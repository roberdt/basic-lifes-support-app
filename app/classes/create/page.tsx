'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { apiFetch } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  purpose: string;
  approval: 'No' | 'Yes' | 'Expired';
}

interface Course {
  id: string;
  coursetitle: string;
  coursetype: string;
  active: boolean | string;
}

interface Instructor {
  id: string;
  firstname: string;
  lastname: string;
  postnominalcredential: string;
  active: boolean | string;
}

interface TimeBlock {
  startTime: string;
  endTime: string;
  slots: string;
  coursetitle: string;
  coursetype: string;
  instructorname: string;
  approved: 'Yes' | 'No';
}

function sanitizeId(id: string | null) {
  if (!id || id === 'undefined' || id === 'null') return null;
  return id;
}

function formatDateForInput(dateStr: string) {
  if (!dateStr) return '';
  const cleanDate = String(dateStr).trim();
  // If it's already YYYY-MM-DD, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) return cleanDate;
  // If it's a full ISO string (2024-07-15T...), extract the date part
  if (cleanDate.includes('T')) return cleanDate.split('T')[0];
  // If it's YYYY/MM/DD, convert to YYYY-MM-DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleanDate)) return cleanDate.replace(/\//g, '-');
  
  // If it's MM/DD/YYYY or M/D/YYYY, convert it
  const parts = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (parts) {
    const [, m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return cleanDate;
}

function formatDateForDisplay(dateStr: string) {
  if (!dateStr) return '';
  // If it's already MM/DD/YYYY, return it
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${m}/${d}/${y}`;
  }
  return dateStr;
}

function CreateClassForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = sanitizeId(searchParams.get('id'));
  const queryCompanyId = searchParams.get('companyId');
  const dateId = searchParams.get('dateId');
  const queryDateValue = searchParams.get('dateValue');
  const querySlots = searchParams.get('slots');
  
  const { userId, companyName, companyId, loading: authLoading } = useAuth();
  const { setMessage } = useMessage();
  


  const [classDate, setClassDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEditData, setLoadingEditData] = useState(false);
  const [originalSlots, setOriginalSlots] = useState<number>(0);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      startTime: '1:00 pm',
      endTime: '1:45 pm',
      slots: '0',
      coursetitle: '',
      coursetype: '',
      instructorname: '',
      approved: 'No'
    }
  ]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const period = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMin = String(min).padStart(2, '0');
        slots.push(`${displayHour}:${displayMin} ${period}`);
      }
    }
    return slots;
  }, []);

  // Access control: Redirect Admins to home
  useEffect(() => {
    if (!authLoading && (userId === 'Admin' || !userId)) {
      router.push('/');
    }
  }, [userId, authLoading, router]);

  // 1. Initial Load: Fetch companies and resolve context
  useEffect(() => {
    if (authLoading) return;

    setLoadingCompanies(true);
    apiFetch<Company[]>('/api/companies')
      .then(({ ok, data }) => {
        if (ok && data) {
          setCompanies(data);
          
          // If we have a queryCompanyId, use it (especially for Admins)
          if (queryCompanyId) {
            setResolvedCompanyId(queryCompanyId);
          } else if (companyId && userId !== 'Admin') {
            setResolvedCompanyId(companyId);
          } else if (companyName) {
            // Fallback: Resolve by name
            const matched = data.find(
              (c) =>
                c.name.toLowerCase() === companyName.toLowerCase() ||
                (companyName.toLowerCase().includes('fred') && c.name.toLowerCase().includes('fred'))
            );
            if (matched) setResolvedCompanyId(matched.id);
          }
        }
      })
      .catch(err => console.error('Error loading companies:', err))
      .finally(() => setLoadingCompanies(false));
  }, [authLoading, companyId, companyName, queryCompanyId]);

  // 2. Reactive Data Fetching: Fetch courses AND instructors when company context is available
  useEffect(() => {
    if (authLoading) return;

    // Use queryCompanyId if present (e.g. for editing), otherwise use the resolved companyId
    const effectiveCompanyId = queryCompanyId || resolvedCompanyId;
    if (!effectiveCompanyId) return;

    // Fetch Courses
    setLoadingCourses(true);
    apiFetch<Course[]>(`/api/companies/${effectiveCompanyId}/courses`)
      .then(({ ok, data }) => {
        if (ok) setCourses(data || []);
      })
      .catch(err => {
        console.error('Error fetching company-specific courses:', err);
      })
      .finally(() => {
        setLoadingCourses(false);
      });

    // Fetch Instructors
    setLoadingInstructors(true);
    apiFetch<Instructor[]>(`/api/companies/${effectiveCompanyId}/instructors`)
      .then(({ ok, data }) => {
        if (ok) setInstructors(data || []);
      })
      .catch(err => {
        console.error('Error fetching company-specific instructors:', err);
      })
      .finally(() => {
        setLoadingInstructors(false);
      });
  }, [resolvedCompanyId, queryCompanyId, authLoading]);

  // Set default date if not editing
  useEffect(() => {
    if (!editId) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setClassDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [editId]);

  // Fetch edit data if applicable
  useEffect(() => {
    if (editId && !authLoading) {
      setLoadingEditData(true);
      
      // Determine the URL to use. If we have queryCompanyId, use company-scoped.
      // Fallback to companyId from auth context if needed.
      // Determine the URL to use. If we have queryCompanyId, use company-scoped.
      // Fallback to companyId from auth context if needed.
      const effectiveCompanyId = resolvedCompanyId;
      const effectiveEditId = sanitizeId(editId);
      const effectiveDateId = sanitizeId(dateId);

      if (!effectiveCompanyId || !effectiveEditId) {
        console.warn('Cannot fetch class details: Incomplete context (company or record ID missing).');
        setLoadingEditData(false);
        return;
      }
      
      // Use the new nested endpoint if dateId is available
      const fetchUrl = effectiveDateId 
        ? `/api/companies/${effectiveCompanyId}/dates/${effectiveDateId}/times/${effectiveEditId}`
        : `/api/companies/${effectiveCompanyId}/classes/${effectiveEditId}`;

      apiFetch<any>(fetchUrl)
        .then(({ ok, data }) => {
          console.log('[EditClass] Fetched class data:', data);
          if (ok && data) {
            // Priority: 1. URL Parameter, 2. Root dateValue, 3. Root date, 4. Empty
            const rawDate = queryDateValue || data.dateValue || data.date || '';
            console.log(`[EditClass] Date Processing -> Query: "${queryDateValue}", Raw API: "${data.dateValue || data.date}", Final: "${rawDate}"`);
            
            const formattedDate = formatDateForInput(rawDate);
            setClassDate(formattedDate);

            // Extract class details from nested classInfo if available, otherwise fallback to root
            const info = data.classInfo || data;
            
            // Priority for slots: 1. API Response, 2. URL Parameter, 3. 0
            const slotsFromApi = info.numberslots !== undefined ? Number(info.numberslots) : undefined;
            const slotsCount = slotsFromApi ?? (querySlots ? Number(querySlots) : 0);
            
            console.log(`[EditClass] Slots Processing -> API: ${slotsFromApi}, Query: ${querySlots}, Final: ${slotsCount}`);
            // Fetch the actual slots collection to get the TRUE count of documents
            const slotsUrl = effectiveDateId
              ? `/api/companies/${effectiveCompanyId}/dates/${effectiveDateId}/times/${effectiveEditId}/classslots`
              : `/api/companies/${effectiveCompanyId}/classes/${effectiveEditId}/classslots`;

            apiFetch<any[]>(slotsUrl)
              .then(slotsRes => {
                const actualCount = slotsRes.ok && Array.isArray(slotsRes.data) ? slotsRes.data.length : 0;
                
                // The 'floor' for seats is the maximum of the metadata count or the actual document count.
                // This prevents decreasing seats below either the official capacity or existing records.
                const floorCount = Math.max(slotsCount, actualCount);
                setOriginalSlots(floorCount);
                console.log(`[EditClass] Floor Slots: ${floorCount} (Metadata: ${slotsCount}, Actual: ${actualCount})`);
                
                setTimeBlocks([{
                  startTime: info.starttime || '',
                  endTime: info.endtime || '',
                  slots: String(slotsCount), // Keep the metadata value on screen
                  coursetitle: info.coursetitle || '',
                  coursetype: info.coursetype || '',
                  instructorname: info.instructorname || '',
                  approved: (info.approved === 'Yes' || info.approved === true) ? 'Yes' : 'No'
                }]);
              })
              .catch(err => {
                console.error('Error fetching actual slots:', err);
                setOriginalSlots(slotsCount);
                setTimeBlocks([{
                  startTime: info.starttime || '',
                  endTime: info.endtime || '',
                  slots: String(slotsCount),
                  coursetitle: info.coursetitle || '',
                  coursetype: info.coursetype || '',
                  instructorname: info.instructorname || '',
                  approved: (info.approved === 'Yes' || info.approved === true) ? 'Yes' : 'No'
                }]);
              });
          } else {
            setMessage('Failed to load class details for editing.', 'error');
            router.push('/classes');
          }
        })
        .catch(err => {
          console.error('Error fetching edit data:', err);
          setMessage('Error loading class data.', 'error');
        })
        .finally(() => {
          setLoadingEditData(false);
        });
    }
  }, [editId, dateId, queryCompanyId, resolvedCompanyId, authLoading, setMessage, router]);

  const activeCourses = useMemo(() => {
    return courses.filter(
      (c) => c.active !== false && String(c.active).toLowerCase() !== 'false' && String(c.active).toLowerCase() !== 'no'
    );
  }, [courses]);

  const activeInstructors = useMemo(() => {
    return instructors.filter(
      (inst) => inst.active !== false && String(inst.active).toLowerCase() !== 'false' && String(inst.active).toLowerCase() !== 'no'
    );
  }, [instructors]);

  // 4. Auto-select first available if empty
  useEffect(() => {
    if (!loadingCourses && activeCourses.length > 0) {
      setTimeBlocks(prev => prev.map(block => {
        if (!block.coursetitle) {
          return { ...block, coursetitle: activeCourses[0].coursetitle, coursetype: activeCourses[0].coursetype };
        }
        return block;
      }));
    }
  }, [loadingCourses, activeCourses]);

  useEffect(() => {
    if (!loadingInstructors && activeInstructors.length > 0) {
      setTimeBlocks(prev => prev.map(block => {
        if (!block.instructorname) {
          const first = activeInstructors[0];
          const name = `${first.firstname} ${first.lastname}${first.postnominalcredential ? `, ${first.postnominalcredential}` : ''}`;
          return { ...block, instructorname: name };
        }
        return block;
      }));
    }
  }, [loadingInstructors, activeInstructors]);

  const timeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toLowerCase();
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    return h * 60 + m;
  };

  const handleUpdateBlock = (index: number, key: keyof TimeBlock, value: string) => {
    const updated = [...timeBlocks];
    updated[index] = { ...updated[index], [key]: value };
    setTimeBlocks(updated);
  };

  const handleAddBlock = () => {
    const lastBlock = timeBlocks[timeBlocks.length - 1];
    let nextStart = '1:00 pm';
    let nextEnd = '1:45 pm';
    if (lastBlock) {
      nextStart = lastBlock.endTime;
      const mins = timeToMinutes(lastBlock.endTime) + 45;
      const h24 = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const p = h24 >= 12 ? 'pm' : 'am';
      const dh = h24 % 12 === 0 ? 12 : h24 % 12;
      nextEnd = `${dh}:${String(m).padStart(2, '0')} ${p}`;
    }
    setTimeBlocks([...timeBlocks, {
      startTime: nextStart,
      endTime: nextEnd,
      slots: '0',
      coursetitle: activeCourses[0]?.coursetitle || '',
      coursetype: activeCourses[0]?.coursetype || '',
      instructorname: '',
      approved: 'No'
    }]);
  };

  const handleRemoveBlock = (index: number) => {
    if (timeBlocks.length > 1) {
      setTimeBlocks(timeBlocks.filter((_, i) => i !== index));
    }
  };

  // We assume the company is active if the user can log in and see the menu,
  // but we keep the logic ready if a status field is added to the session.
  const currentCompanyStatus = 'Yes'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classDate) {
      setMessage('Date is required.', 'error');
      return;
    }

    // Date validation: Must be today or future for new classes
    if (!editId) {
      const selectedDate = new Date(classDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setMessage('Date cannot be in the past.', 'error');
        return;
      }
    }

    if (currentCompanyStatus !== 'Yes') {
      setMessage('Company must be active to schedule classes.', 'error');
      return;
    }

    const effectiveCompanyId = resolvedCompanyId;
    const effectiveEditId = sanitizeId(editId);
    const effectiveDateId = sanitizeId(dateId);
    
    if (!effectiveCompanyId) {
      setMessage('Company ID is missing. Please refresh and try again.', 'error');
      return;
    }

    let newSlotsCount = 0;
    if (effectiveEditId) {
      newSlotsCount = Number(timeBlocks[0].slots);
      if (newSlotsCount < originalSlots) {
        setMessage(`Slot count cannot be decreased. Minimum allowed: ${originalSlots}`, 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (effectiveEditId) {
        // Update existing class (Single record)
        const block = timeBlocks[0];
        const effectiveDateId = sanitizeId(dateId);
        
        const putUrl = effectiveDateId
          ? `/api/companies/${effectiveCompanyId}/dates/${effectiveDateId}/times/${effectiveEditId}`
          : `/api/companies/${effectiveCompanyId}/classes/${effectiveEditId}`;

        // 1. Fetch the ACTUAL count of documents currently in the database.
        const slotUrl = effectiveDateId
          ? `/api/companies/${effectiveCompanyId}/dates/${effectiveDateId}/times/${effectiveEditId}/classslots`
          : `/api/companies/${effectiveCompanyId}/classes/${effectiveEditId}/classslots`;

        const currentSlotsRes = await apiFetch<any[]>(slotUrl);
        const actualCount = (currentSlotsRes.ok && Array.isArray(currentSlotsRes.data)) 
          ? currentSlotsRes.data.length 
          : originalSlots;

        // 2. Update metadata. 
        // IMPORTANT: If we are adding slots, we set the metadata to the CURRENT count.
        // The POST /classslots loop will automatically increment numberslots on the backend.
        // If we set it to newSlotsCount here, and then POST, it will end up at newSlotsCount + diff.
        const diff = newSlotsCount - actualCount;
        const baselineCount = diff > 0 ? actualCount : newSlotsCount;

        const putRes = await apiFetch<any>(putUrl, {
          method: 'PUT',
          body: {
            id: effectiveEditId,
            date: classDate,
            dateValue: classDate,
            starttime: timeBlocks[0].startTime,
            endtime: timeBlocks[0].endTime,
            coursetitle: timeBlocks[0].coursetitle,
            coursetype: timeBlocks[0].coursetype,
            instructorname: timeBlocks[0].instructorname,
            numberslots: baselineCount,
            classslots: baselineCount,
            approved: timeBlocks[0].approved === 'Yes',
          },
        });

        if (!putRes.ok) {
          const errMsg = typeof putRes.data === 'string' ? putRes.data : JSON.stringify(putRes.data);
          throw new Error(`Failed to update class metadata. [Status ${putRes.status}] ${errMsg}`);
        }

        console.log(`[handleSubmit] Syncing Slots: Target=${newSlotsCount}, Baseline=${baselineCount}, Adding=${diff > 0 ? diff : 0}`);

        if (diff > 0) {
          try {
            for (let i = 0; i < diff; i++) {
              const slotRes = await apiFetch<any>(slotUrl, {
                method: 'POST',
                body: {}
              });
              if (!slotRes.ok) {
                const message = (slotRes.data as any)?.message || `Backend rejected slot addition ${i + 1}/${diff}`;
                throw new Error(message);
              }
            }
          } catch (slotErr: any) {
            console.error('[SlotUpdateError]', slotErr);
            setMessage(`Class metadata updated, but failed to create all new slots: ${slotErr.message}`, 'error');
            setSubmitting(false);
            return;
          }
        }
        setOriginalSlots(newSlotsCount);
        setMessage('Class updated successfully!', 'success');
      } else {
        // Create new class(es)
        const effectiveDateId = sanitizeId(dateId);
        let resolvedDateId = effectiveDateId;

        if (!resolvedDateId) {
          const dateRes = await apiFetch<any>(`/api/companies/${effectiveCompanyId}/dates`, {
            method: 'POST',
            body: {
              date: classDate,
              dateValue: classDate,
              starttime: timeBlocks[0].startTime,
              endtime: timeBlocks[0].endTime,
              coursetitle: timeBlocks[0].coursetitle,
              coursetype: timeBlocks[0].coursetype,
              instructorname: timeBlocks[0].instructorname,
              numberslots: 0,
              classslots: 0,
              approved: timeBlocks[0].approved === 'Yes',
            },
          });

          if (!dateRes.ok) throw new Error('Failed to create class date');
          resolvedDateId = dateRes.data.dateId || dateRes.data.id;
        }

        // For subsequent blocks (or all if we already had a dateId)
        const startIdx = effectiveDateId ? 0 : 1;
        for (let i = startIdx; i < timeBlocks.length; i++) {
          const b = timeBlocks[i];
          const tRes = await apiFetch<any>(`/api/companies/${effectiveCompanyId}/dates/${resolvedDateId}/times`, {
            method: 'POST',
            body: {
              starttime: b.startTime,
              endtime: b.endTime,
              coursetitle: b.coursetitle,
              coursetype: b.coursetype,
              instructorname: b.instructorname,
              approved: b.approved === 'Yes',
              numberslots: 0,
              classslots: 0,
            },
          });
          if (tRes.ok) {
            const timeId = tRes.data.timeId || tRes.data.id;
            for (let j = 0; j < Number(b.slots); j++) {
              await apiFetch(`/api/companies/${effectiveCompanyId}/dates/${resolvedDateId}/times/${timeId}/classslots`, {
                method: 'POST'
              });
            }
          }
        }
        setMessage(`Successfully scheduled ${timeBlocks.length - startIdx + (effectiveDateId ? 0 : 1)} class(es)!`, 'success');
      }
      router.push('/classes');
    } catch (err) {
      console.error(err);
      setMessage('Operation failed. Please check backend logs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingEditData || loadingCompanies || userId === 'Admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flex: 1, pb: 8 }}>
        <Pfapcontainer maxWidth="xl">
          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography variant="h4" component="h1" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
              {editId ? 'Update Class' : 'Schedule Date, Time & Slots'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#555555' }}>
              {editId ? 'Modify existing class offering details.' : 'Create class offerings with available seats for approved active companies.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '9 9 0' } }}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '2px solid #0074C8' }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField label="Hosting Company" value={companyName || ''} disabled fullWidth />
                    <TextField 
                      label="Select Class Date" 
                      type={editId ? "text" : "date"}
                      value={editId ? formatDateForDisplay(classDate) : classDate} 
                      onChange={(e) => !editId && setClassDate(e.target.value)} 
                      required 
                      fullWidth 
                      slotProps={{ 
                        input: {
                          readOnly: !!editId,
                        },
                        htmlInput: {
                          min: !editId ? new Date().toISOString().split('T')[0] : undefined
                        },
                        inputLabel: { shrink: true } 
                      }}
                      sx={{ 
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#00518c', fontWeight: 700 }}>
                        {editId ? 'Class Details' : 'Time Slots & Seat Limits'}
                      </Typography>
                      {!editId && (
                        <Button variant="outlined" size="small" startIcon={<AddRoundedIcon />} onClick={handleAddBlock} sx={{ textTransform: 'none' }}>
                          Add Row
                        </Button>
                      )}
                    </Box>

                    <Stack spacing={2.5}>
                      {timeBlocks.map((block, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1.5px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                              {editId ? (
                                <TextField label="Course Title" size="small" value={block.coursetitle} disabled fullWidth />
                              ) : (
                                <FormControl fullWidth required size="small">
                                  <InputLabel>Course Title</InputLabel>
                                  <Select
                                    value={block.coursetitle}
                                    label="Course Title"
                                    onChange={(e) => {
                                      const title = e.target.value;
                                      const course = activeCourses.find(c => c.coursetitle === title);
                                      handleUpdateBlock(index, 'coursetitle', title);
                                      handleUpdateBlock(index, 'coursetype', course ? course.coursetype : '');
                                    }}
                                  >
                                    {activeCourses.map((c) => (
                                      <MenuItem key={c.id} value={c.coursetitle}>{c.coursetitle}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                              <TextField label="Course Type" size="small" value={block.coursetype} disabled fullWidth />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                              <FormControl fullWidth required size="small">
                                <InputLabel>Start Time</InputLabel>
                                <Select value={block.startTime} label="Start Time" onChange={(e) => handleUpdateBlock(index, 'startTime', e.target.value)}>
                                  {timeSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                              </FormControl>
                              <FormControl fullWidth required size="small">
                                <InputLabel>End Time</InputLabel>
                                <Select value={block.endTime} label="End Time" onChange={(e) => handleUpdateBlock(index, 'endTime', e.target.value)}>
                                  {timeSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                              </FormControl>
                              <TextField 
                                label="Seats / Slots (1-30)" 
                                type="number" 
                                size="small" 
                                value={block.slots} 
                                onChange={(e) => handleUpdateBlock(index, 'slots', e.target.value)} 
                                required 
                                fullWidth 
                                slotProps={{ htmlInput: { min: editId ? originalSlots : 1 } }}
                              />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                              <FormControl fullWidth required size="small">
                                <InputLabel>Instructor Name</InputLabel>
                                <Select value={block.instructorname} label="Instructor Name" onChange={(e) => handleUpdateBlock(index, 'instructorname', e.target.value)}>
                                  {/* Ensure current instructor is in the list even if inactive/missing */}
                                  {block.instructorname && !activeInstructors.some(inst => `${inst.firstname} ${inst.lastname}${inst.postnominalcredential ? `, ${inst.postnominalcredential}` : ''}` === block.instructorname) && (
                                    <MenuItem value={block.instructorname}>{block.instructorname}</MenuItem>
                                  )}
                                  {activeInstructors.map(inst => {
                                    const name = `${inst.firstname} ${inst.lastname}${inst.postnominalcredential ? `, ${inst.postnominalcredential}` : ''}`;
                                    return <MenuItem key={inst.id} value={name}>{name}</MenuItem>;
                                  })}
                                </Select>
                              </FormControl>
                              <FormControl fullWidth required size="small">
                                <InputLabel>Approved Status</InputLabel>
                                <Select value={block.approved} label="Approved Status" onChange={(e) => handleUpdateBlock(index, 'approved', e.target.value as any)}>
                                  <MenuItem value="Yes">Yes</MenuItem>
                                  <MenuItem value="No">No</MenuItem>
                                </Select>
                              </FormControl>
                              {!editId && timeBlocks.length > 1 && (
                                <IconButton color="error" onClick={() => handleRemoveBlock(index)} sx={{ border: '1px solid #ffcdd2', backgroundColor: '#ffebee' }}>
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>

                    <Button variant="contained" type="submit" size="large" disabled={submitting || currentCompanyStatus !== 'Yes'} sx={{ backgroundColor: '#0074C8', fontWeight: 600, py: 1.5 }}>
                      {submitting ? (editId ? 'Updating...' : 'Scheduling...') : (editId ? 'Update Class' : 'Schedule Class Slots')}
                    </Button>
                    <Button variant="text" onClick={() => router.push('/classes')} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                      Cancel and Return to List
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '3 3 0' } }}>
               <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    backgroundColor: currentCompanyStatus === 'Yes' ? '#e8f5e9' : '#ffebee',
                    border: '1.5px solid',
                    borderColor: currentCompanyStatus === 'Yes' ? '#2e7d32' : '#c62828',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: currentCompanyStatus === 'Yes' ? '#2e7d32' : '#c62828', mb: 1 }}>
                    Status: {currentCompanyStatus === 'Yes' ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Classes can only be managed for active organizations.
                  </Typography>
                </Paper>
            </Box>
          </Box>
        </Pfapcontainer>
      </Box>
      <Pfapfooter />
    </Box>
  );
}

export default function CreateClassPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>}>
      <CreateClassForm />
    </Suspense>
  );
}
