'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { apiFetch } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  purpose: string;
  approval: 'No' | 'Yes' | 'Expired';
}

interface TimeBlock {
  startTime: string;
  endTime: string;
  slots: string;
}

export default function CreateClassPage() {
  const router = useRouter();
  const { userId, companyName, loading: authLoading } = useAuth();
  const { setMessage } = useMessage();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classStatus, setClassStatus] = useState<'ACTIVE' | 'IN ACTIVE'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic time blocks state (Default: 1:00 pm - 1:45 pm with 8 slots)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { startTime: '1:00 pm', endTime: '1:45 pm', slots: '8' }
  ]);

  // Generate 15-minute time increments to support custom ranges like 1:45 pm
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

  // Set default date to today in YYYY-MM-DD format
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setClassDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch companies database to check status
  useEffect(() => {
    if (authLoading) return;

    setLoadingCompanies(true);
    apiFetch<Company[]>('/api/companies')
      .then(({ ok, data }) => {
        if (!ok) throw new Error('Failed to fetch companies');
        setCompanies(data);
        
        // Auto-select company for normal logged-in user
        if (userId !== 'Admin' && companyName) {
          const userComp = data.find(
            (c: Company) =>
              c.name.toLowerCase() === companyName.toLowerCase() ||
              (companyName.toLowerCase().includes('fred') && c.name.toLowerCase().includes('fred'))
          );
          if (userComp) {
            setSelectedCompany(userComp.name);
          } else {
            setSelectedCompany(companyName);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching companies:', err);
        setMessage('Failed to load company records', 'error');
      })
      .finally(() => {
        setLoadingCompanies(false);
      });
  }, [userId, companyName, authLoading, setMessage]);

  // Determine current active status of selected company
  const currentCompanyStatus = useMemo(() => {
    if (!selectedCompany) return null;
    const matched = companies.find(
      (c) => c.name.toLowerCase() === selectedCompany.toLowerCase()
    );
    return matched ? matched.approval : null;
  }, [selectedCompany, companies]);

  // Helper to convert "1:45 pm" to absolute minutes from midnight for safe validation comparison
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

  const handleAddBlock = () => {
    const lastBlock = timeBlocks[timeBlocks.length - 1];
    let nextStart = '1:00 pm';
    let nextEnd = '1:45 pm';
    let nextSlots = '8';

    if (lastBlock) {
      // Intelligently default to the end of the last block as the start of the next block
      nextStart = lastBlock.endTime;
      const minutes = timeToMinutes(lastBlock.endTime);
      // Default to 45 mins slot duration
      const endMinutes = minutes + 45;
      const endH24 = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      const period = endH24 >= 12 ? 'pm' : 'am';
      const displayH = endH24 % 12 === 0 ? 12 : endH24 % 12;
      nextEnd = `${displayH}:${String(endM).padStart(2, '0')} ${period}`;
      nextSlots = lastBlock.slots;
    }

    setTimeBlocks([...timeBlocks, { startTime: nextStart, endTime: nextEnd, slots: nextSlots }]);
  };

  const handleRemoveBlock = (index: number) => {
    if (timeBlocks.length === 1) return;
    setTimeBlocks(timeBlocks.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, key: keyof TimeBlock, value: string) => {
    const updated = [...timeBlocks];
    updated[index] = { ...updated[index], [key]: value };
    setTimeBlocks(updated);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCompany) {
      setMessage('Please select a company.', 'error');
      return;
    }

    if (!classDate) {
      setMessage('Please select a date.', 'error');
      return;
    }

    // Verify company active condition again on client
    if (currentCompanyStatus !== 'Yes') {
      setMessage(`Scheduling failed. Your company is currently NOT ACTIVE.`, 'error');
      return;
    }

    // Comprehensive client-side validations for all time blocks
    for (let i = 0; i < timeBlocks.length; i++) {
      const block = timeBlocks[i];
      const slotsNum = Number(block.slots);

      if (isNaN(slotsNum) || slotsNum < 1 || slotsNum > 30) {
        setMessage(`Block ${i + 1}: Slots must be a number between 1 and 30.`, 'error');
        return;
      }

      const startMins = timeToMinutes(block.startTime);
      const endMins = timeToMinutes(block.endTime);

      if (endMins <= startMins) {
        setMessage(`Block ${i + 1}: End time (${block.endTime}) must be strictly after Start time (${block.startTime}).`, 'error');
        return;
      }
    }

    setSubmitting(true);
    let successCount = 0;

    try {
      // Loop through each configured time block and submit to the backend endpoint
      for (let i = 0; i < timeBlocks.length; i++) {
        const block = timeBlocks[i];
        const slotsNum = Number(block.slots);

        const { ok, data } = await apiFetch<any>('/api/classes', {
          method: 'POST',
          body: {
            companyName: selectedCompany,
            date: classDate,
            startTime: block.startTime,
            endTime: block.endTime,
            time: `${block.startTime} - ${block.endTime}`, // Legacy support fallback
            slots: slotsNum,
            status: classStatus,
          },
        });

        if (!ok) {
          throw new Error((data as any)?.message || `Failed to create class slot at row ${i + 1} (${block.startTime} - ${block.endTime}).`);
        }
        successCount++;
      }

      setMessage(`Successfully scheduled ${successCount} class slot(s)!`, 'success');
      router.push('/calendar');
    } catch (err) {
      console.error('Error creating class slots:', err);
      setMessage(err instanceof Error ? err.message : 'Failed to create class slots', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading Check
  if (authLoading || (loadingCompanies && companies.length === 0)) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Pfapappbar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#0074C8' }} />
        </Box>
        <Pfapfooter />
      </Box>
    );
  }

  // 2. Auth Access Guard
  if (!userId || userId === 'Admin') {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Pfapappbar />
        <Pfapcontainer maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 5,
              textAlign: 'center',
              border: '2px solid #c62828',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 40px rgba(198, 40, 40, 0.08)',
              mt: 4,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#c62828', mb: 2 }}>
              Access Restrained
            </Typography>
            <Typography variant="body1" sx={{ color: '#555555', mb: 4, lineHeight: 1.6 }}>
              {userId === 'Admin' 
                ? 'Administrators cannot schedule class slots. Please sign in with an approved company account.'
                : 'You must be signed in with an approved company account to view and schedule classes.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#0074C8',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1,
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#00518c' },
              }}
            >
              Sign In
            </Button>
          </Paper>
        </Pfapcontainer>
        <Pfapfooter />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flex: 1, pb: 8 }}>
        <Pfapcontainer maxWidth="md">
          {/* Page Header */}
          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography variant="h4" component="h1" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
              Schedule Date, Time & Slots
            </Typography>
            <Typography variant="body1" sx={{ color: '#555555' }}>
              Create class offerings with available seats for approved active companies.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Form Section */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '7 7 0' }, minWidth: 0 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  border: '2px solid #0074C8',
                  backgroundColor: '#ffffff',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* 1. Company Selection (Read-only for normal users) */}
                    <TextField
                      label="Hosting Company"
                      value={selectedCompany || companyName || ''}
                      disabled
                      fullWidth
                      slotProps={{
                        input: {
                          style: { fontWeight: 600, color: '#333333' }
                        }
                      }}
                    />

                    {/* 2. Date Selector */}
                    <TextField
                      label="Select Class Date"
                      type="date"
                      value={classDate}
                      onChange={(e) => setClassDate(e.target.value)}
                      required
                      fullWidth
                      slotProps={{
                        inputLabel: { shrink: true }
                      }}
                    />

                    {/* 3. Class Slot Status Selection */}
                    <FormControl fullWidth required>
                      <InputLabel id="class-status-label">Class Slot Status</InputLabel>
                      <Select
                        labelId="class-status-label"
                        id="class-status-select"
                        value={classStatus}
                        label="Class Slot Status"
                        onChange={(e) => setClassStatus(e.target.value as 'ACTIVE' | 'IN ACTIVE')}
                      >
                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                        <MenuItem value="IN ACTIVE">IN ACTIVE</MenuItem>
                      </Select>
                    </FormControl>

                    <Divider sx={{ my: 1 }} />

                    {/* 4. Dynamic Time Blocks Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#00518c', fontWeight: 700 }}>
                        Time Slots & Seat Limits
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleAddBlock}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          borderColor: '#0074C8',
                          color: '#0074C8',
                          '&:hover': {
                            borderColor: '#00518c',
                            backgroundColor: 'rgba(0, 116, 200, 0.04)',
                          },
                        }}
                      >
                        Add Row
                      </Button>
                    </Box>

                    <Stack spacing={2}>
                      {timeBlocks.map((block, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: '12px',
                            border: '1.5px solid #e0e0e0',
                            backgroundColor: '#fafafa',
                            position: 'relative',
                            transition: 'border-color 0.15s ease',
                            '&:hover': {
                              borderColor: '#0074C8',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 2,
                              alignItems: { xs: 'stretch', sm: 'center' },
                            }}
                          >
                            {/* Start Time Select */}
                            <FormControl fullWidth required size="small">
                              <InputLabel id={`start-time-label-${index}`}>Start Time</InputLabel>
                              <Select
                                labelId={`start-time-label-${index}`}
                                value={block.startTime}
                                label="Start Time"
                                onChange={(e) => handleUpdateBlock(index, 'startTime', e.target.value)}
                              >
                                {timeSlots.map((slot) => (
                                  <MenuItem key={slot} value={slot}>
                                    {slot}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* End Time Select */}
                            <FormControl fullWidth required size="small">
                              <InputLabel id={`end-time-label-${index}`}>End Time</InputLabel>
                              <Select
                                labelId={`end-time-label-${index}`}
                                value={block.endTime}
                                label="End Time"
                                onChange={(e) => handleUpdateBlock(index, 'endTime', e.target.value)}
                              >
                                {timeSlots.map((slot) => (
                                  <MenuItem key={slot} value={slot}>
                                    {slot}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Slots Input */}
                            <TextField
                              label="Slots (1-30)"
                              type="number"
                              size="small"
                              value={block.slots}
                              onChange={(e) => handleUpdateBlock(index, 'slots', e.target.value)}
                              required
                              fullWidth
                              slotProps={{
                                htmlInput: { min: 1, max: 30 }
                              }}
                            />

                            {/* Remove Button */}
                            {timeBlocks.length > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveBlock(index)}
                                sx={{
                                  alignSelf: { xs: 'flex-end', sm: 'center' },
                                  border: '1px solid #ffcdd2',
                                  backgroundColor: '#ffebee',
                                  borderRadius: '8px',
                                  '&:hover': {
                                    backgroundColor: '#ffcdcf',
                                  },
                                }}
                              >
                                <DeleteRoundedIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Stack>

                    {/* Submission Button */}
                    <Button
                      variant="contained"
                      type="submit"
                      size="large"
                      disabled={submitting || currentCompanyStatus !== 'Yes'}
                      sx={{
                        backgroundColor: '#0074C8',
                        color: '#ffffff',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: '8px',
                        '&:hover': { backgroundColor: '#00518c' },
                        '&.Mui-disabled': { backgroundColor: '#cccccc' },
                      }}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {submitting ? 'Scheduling Classes...' : 'Schedule Class Slots'}
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Box>

            {/* Sidebar Guidelines & Company Status Indicator */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '5 5 0' }, minWidth: 0 }}>
              <Stack spacing={3}>
                {/* Active Status Display Box */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    backgroundColor: currentCompanyStatus === 'Yes' ? '#e8f5e9' : '#ffebee',
                    border: '1.5px solid',
                    borderColor: currentCompanyStatus === 'Yes' ? '#2e7d32' : '#c62828',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: currentCompanyStatus === 'Yes' ? '#2e7d32' : '#c62828' }}>
                    Company Status Indicator
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333333' }}>
                      Selected Company:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555555' }}>
                      {selectedCompany || 'None'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333333' }}>
                      Approval Status:
                    </Typography>
                    {currentCompanyStatus === 'Yes' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2e7d32', backgroundColor: '#c8e6c9', padding: '3px 8px', borderRadius: '4px' }}>
                        ACTIVE
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c62828', backgroundColor: '#ffcdd2', padding: '3px 8px', borderRadius: '4px' }}>
                        IN ACTIVE
                      </span>
                    )}
                  </Box>

                  {currentCompanyStatus !== 'Yes' && (
                    <Alert severity="error" sx={{ mt: 1, borderRadius: '8px', fontSize: '0.85rem' }}>
                      Your company is currently inactive. You cannot schedule classes until an administrator approves your request.
                    </Alert>
                  )}
                </Paper>

                {/* Micro-Help Cards */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00518c', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthRoundedIcon fontSize="small" /> Schedule Guidelines
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <AccessTimeRoundedIcon fontSize="small" sx={{ color: '#0074C8', mt: 0.2 }} />
                      <Typography variant="body2" sx={{ color: '#555555', lineHeight: 1.4 }}>
                        <strong>Multi-Row Times:</strong> Define as many start and end time segments as desired for the selected class date.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <GroupAddRoundedIcon fontSize="small" sx={{ color: '#0074C8', mt: 0.2 }} />
                      <Typography variant="body2" sx={{ color: '#555555', lineHeight: 1.4 }}>
                        <strong>Seat Limits (1-30):</strong> Define the strict capacity limit for each segment. Values must be between 1 and 30 (inclusive).
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Box>
        </Pfapcontainer>
      </Box>
      <Pfapfooter />
    </Box>
  );
}
