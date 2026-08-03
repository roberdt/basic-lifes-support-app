'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Checkbox,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AddCircleRounded as AddCircleRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  DeleteSweepRounded as DeleteSweepRoundedIcon,
  GroupAddRounded as GroupAddRoundedIcon,
  ArrowBackRounded as ArrowBackRoundedIcon,
  RefreshRounded as RefreshRoundedIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  ErrorRounded as ErrorRoundedIcon,
  EditRounded as EditRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  RotateLeftRounded as RotateLeftRoundedIcon,
  DeleteForeverRounded as DeleteForeverRoundedIcon,
  AddRounded as AddRoundedIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';

interface ClassSlot {
  id: string;
  ahaid: string;
  firstname: string;
  lastname: string;
  postnominalcredential: string;
  email: string;
  phone: string;
  attendance: string;
  passfail: string;
  score: string | number;
  notes: string;
}

interface ClassDetails {
  id: string;
  coursetitle: string;
  coursetype: string;
  dateValue: string;
  starttime: string;
  endtime: string;
  instructorname: string;
}

function SlotsManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeId = searchParams.get('id');
  const companyId = searchParams.get('companyId');
  const dateId = searchParams.get('dateId');

  const { userId, authLoading } = useAuth();
  const { setMessage } = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [originalSlots, setOriginalSlots] = useState<ClassSlot[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Dialog states
  const [isPopulateOpen, setIsPopulateOpen] = useState(false);
  const [populateData, setPopulateData] = useState('');
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [batchEditData, setBatchEditData] = useState({ postnominalcredential: '', attendance: '', passfail: '', score: '', notes: '' });
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState<Partial<ClassSlot>>({
    ahaid: '',
    firstname: '',
    lastname: '',
    postnominalcredential: '',
    email: '',
    attendance: 'No Show',
    passfail: 'No Grade',
    score: 0,
    notes: ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (!authLoading && (!userId || userId === 'Admin')) {
      router.push('/');
    }
  }, [userId, authLoading, router]);

  const fetchData = async () => {
    if (!companyId || !dateId || !timeId) return;
    
    setLoading(true);
    try {
      // Fetch Class Details
      const detailRes = await apiFetch<any>(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}`);
      if (detailRes.ok) {
        setClassDetails(detailRes.data.classInfo || detailRes.data);
      }

      // Fetch Slots
      const slotsRes = await apiFetch<ClassSlot[]>(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots`);
      if (slotsRes.ok) {
        const sortedSlots = (slotsRes.data || []).sort((a, b) => a.id.localeCompare(b.id));
        setSlots(sortedSlots);
        setOriginalSlots(JSON.parse(JSON.stringify(sortedSlots)));
      }
    } catch (err) {
      console.error('Error fetching slots data:', err);
      setMessage('Failed to load slots data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, dateId, timeId]);

  const handleSlotChange = (id: string, field: keyof ClassSlot, value: any) => {
    setSlots(prev => prev.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const handleQuickAdd = async () => {
    setSaving(true);
    try {
      // 1. Add blank slot
      const addRes = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots`, {
        method: 'POST',
        body: {}
      });
      
      if (addRes.ok) {
        const newSlotId = addRes.data.id;
        // 2. Immediately update it with student info
        const updateRes = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/update`, {
          method: 'PUT',
          body: [{ ...quickAddData, id: newSlotId }]
        });
        
        if (updateRes.ok) {
          setSnackbar({ open: true, message: 'Student record added successfully', severity: 'success' });
          setIsQuickAddOpen(false);
          const newSlot = { 
            ...quickAddData, 
            id: newSlotId,
            score: Number(quickAddData.score || 0)
          } as ClassSlot;
          
          setQuickAddData({
            ahaid: '',
            firstname: '',
            lastname: '',
            postnominalcredential: '',
            email: '',
            attendance: 'No Show',
            passfail: 'No Grade',
            score: 0,
            notes: ''
          });
          
          // Surgical state update
          setSlots(prev => [...prev, newSlot].sort((a, b) => a.id.localeCompare(b.id)));
          setOriginalSlots(prev => [...prev, JSON.parse(JSON.stringify(newSlot))].sort((a, b) => a.id.localeCompare(b.id)));
        } else {
          throw new Error('Failed to set student info');
        }
      } else {
        throw new Error('Failed to create slot');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding student record', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(slots.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleIndividualUpdate = async (slot: ClassSlot) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/update`, {
        method: 'PUT',
        body: [slot]
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Slot updated successfully', severity: 'success' });
        // Surgical update: update originalSlots for this row to "commit" the change locally
        setOriginalSlots(prev => prev.map(s => s.id === slot.id ? JSON.parse(JSON.stringify(slot)) : s));
      } else {
        throw new Error('Failed to update slot');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating slot', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleIndividualReset = async (slotId: string) => {
    if (!confirm('Are you sure you want to reset this slot? Student data will be cleared.')) return;
    
    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/delete`, {
        method: 'POST',
        body: [slotId]
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Slot reset successfully', severity: 'success' });
        // Surgical update: reset both current and original state for this row
        const resetSlot = (slotsRes: any) => {
           // We need the default slot object or just clear it locally
           setSlots(prev => prev.map(s => s.id === slotId ? {
             ...s,
             ahaid: '', firstname: '', lastname: '', postnominalcredential: '',
             email: '', phone: '', attendance: 'No Show', passfail: 'No Grade', score: 0, notes: ''
           } : s));
           setOriginalSlots(prev => prev.map(s => s.id === slotId ? {
             ...s,
             ahaid: '', firstname: '', lastname: '', postnominalcredential: '',
             email: '', phone: '', attendance: 'No Show', passfail: 'No Grade', score: 0, notes: ''
           } : s));
        };
        resetSlot(null);
      } else {
        throw new Error('Failed to reset slot');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error resetting slot', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSingle = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots`, {
        method: 'POST',
        body: {}
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'New blank slot added', severity: 'success' });
        const newSlot = res.data; // Assuming it returns the new slot object
        setSlots(prev => [...prev, newSlot].sort((a, b) => a.id.localeCompare(b.id)));
        setOriginalSlots(prev => [...prev, JSON.parse(JSON.stringify(newSlot))].sort((a, b) => a.id.localeCompare(b.id)));
      } else {
        throw new Error('Failed to add slot');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding slot', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBatchUpdate = async () => {
    const modifiedSlots = slots.filter((slot, index) => {
      return JSON.stringify(slot) !== JSON.stringify(originalSlots[index]);
    });

    if (modifiedSlots.length === 0) {
      setSnackbar({ open: true, message: 'No changes to save', severity: 'success' });
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/update`, {
        method: 'PUT',
        body: modifiedSlots
      });
      if (res.ok) {
        setSnackbar({ open: true, message: `Successfully updated ${modifiedSlots.length} slots`, severity: 'success' });
        fetchData();
      } else {
        throw new Error('Failed to update slots');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating slots', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBatchReset = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to reset ${selectedIds.length} selected slots? Student data will be cleared.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/delete`, {
        method: 'POST',
        body: selectedIds
      });
      if (res.ok) {
        setSnackbar({ open: true, message: `Successfully reset ${selectedIds.length} slots`, severity: 'success' });
        setSelectedIds([]);
        fetchData();
      } else {
        throw new Error('Failed to reset slots');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error resetting slots', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePopulate = async () => {
    // Parse populate data (assumed CSV or TSV format: AHA ID, FirstName, LastName, Email)
    const lines = populateData.split('\n').filter(l => l.trim());
    const newSlotsData = lines.map(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      return {
        ahaid: parts[0] || '',
        firstname: parts[1] || '',
        lastname: parts[2] || '',
        email: parts[3] || '',
        postnominalcredential: '',
        attendance: 'No Show',
        passfail: 'No Grade',
        score: 0,
        notes: ''
      };
    });

    if (newSlotsData.length === 0) return;

    setSaving(true);
    try {
      const res = await apiFetch(`/api/companies/${companyId}/dates/${dateId}/times/${timeId}/classslots/add`, {
        method: 'POST',
        body: newSlotsData
      });
      if (res.ok) {
        setSnackbar({ open: true, message: `Successfully populated ${newSlotsData.length} slots`, severity: 'success' });
        setIsPopulateOpen(false);
        setPopulateData('');
        fetchData();
      } else {
        throw new Error('Failed to populate slots');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error populating slots', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyBatchEdit = () => {
    setSlots(prev => prev.map(slot => {
      if (selectedIds.includes(slot.id)) {
        return {
          ...slot,
          postnominalcredential: batchEditData.postnominalcredential || slot.postnominalcredential,
          attendance: batchEditData.attendance || slot.attendance,
          passfail: batchEditData.passfail || slot.passfail,
          score: batchEditData.score !== '' ? batchEditData.score : slot.score,
          notes: batchEditData.notes || slot.notes
        };
      }
      return slot;
    }));
    setIsBatchEditOpen(false);
    setBatchEditData({ postnominalcredential: '', attendance: '', passfail: '', score: '', notes: '' });
    setSnackbar({ open: true, message: `Applied changes to ${selectedIds.length} slots locally. Click Batch Update to save.`, severity: 'success' });
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(slots) !== JSON.stringify(originalSlots);
  }, [slots, originalSlots]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flexGrow: 1, pb: 8 }}>
        <Pfapcontainer maxWidth="xl">
          {/* Header Section */}
          <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => router.push('/classes')}
                sx={{ mb: 2, textTransform: 'none', color: '#64748b' }}
              >
                Back to Classes
              </Button>
              <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800, mb: 1 }}>
                Manage Class Slots
              </Typography>
              {classDetails && (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip label={classDetails.coursetitle} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      • {classDetails.dateValue} • {classDetails.starttime} - {classDetails.endtime} • Instructor: <strong>{classDetails.instructorname}</strong>
                    </Typography>
                  </Stack>
                  {classDetails.notes && (
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: 'rgba(0, 116, 200, 0.05)', borderRadius: '8px', borderLeft: '4px solid #0074C8' }}>
                      <Typography variant="caption" sx={{ color: '#0074C8', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                        Class Notes
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {classDetails.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={fetchData}
                disabled={saving}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveRoundedIcon />}
                onClick={handleBatchUpdate}
                disabled={saving || !hasChanges}
                sx={{ 
                  borderRadius: '10px', 
                  textTransform: 'none', 
                  fontWeight: 700,
                  backgroundColor: '#0074C8',
                  boxShadow: '0 4px 12px rgba(0, 116, 200, 0.2)',
                  px: 3,
                  '&:hover': { backgroundColor: '#00518c' }
                }}
              >
                {saving ? 'Saving...' : 'Batch Update All'}
              </Button>
            </Stack>
          </Box>

          {/* Stats Bar */}
          <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Slots</Typography>
              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>{slots.length}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Filled</Typography>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>{slots.filter(s => s.firstname || s.ahaid).length}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Empty</Typography>
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700 }}>{slots.filter(s => !s.firstname && !s.ahaid).length}</Typography>
            </Box>
          </Paper>

          {/* Actions Toolbar */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddCircleRoundedIcon />}
                onClick={() => setIsQuickAddOpen(true)}
                disabled={saving}
                sx={{ backgroundColor: '#0074C8', textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
              >
                Add Student Record
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={handleAddSingle}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
              >
                Add Blank Slot
              </Button>
              <Button
                variant="outlined"
                startIcon={<GroupAddRoundedIcon />}
                onClick={() => setIsPopulateOpen(true)}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
              >
                Batch Populate
              </Button>
            </Stack>

            {selectedIds.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0074C8', mr: 1 }}>
                  {selectedIds.length} slots selected
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => setIsBatchEditOpen(true)}
                  disabled={saving}
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                >
                  Edit Selected
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteSweepRoundedIcon />}
                  onClick={handleBatchReset}
                  disabled={saving}
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                >
                  Reset Selected
                </Button>
              </Stack>
            )}
          </Box>

          {/* Slots Table */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.length > 0 && selectedIds.length < slots.length}
                      checked={slots.length > 0 && selectedIds.length === slots.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', py: 2 }}>AHA ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Post-nom</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Attendance</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Notes</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', pr: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow 
                    key={slot.id} 
                    hover 
                    selected={selectedIds.includes(slot.id)}
                    sx={{ '&.Mui-selected': { backgroundColor: 'rgba(0, 116, 200, 0.04)' } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(slot.id)}
                        onChange={() => handleSelectOne(slot.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={slot.ahaid || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'ahaid', e.target.value)}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="AHA-123..."
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={slot.firstname || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'firstname', e.target.value)}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="John"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={slot.lastname || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'lastname', e.target.value)}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="Doe"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={slot.postnominalcredential || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'postnominalcredential', e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="DR">DR</MenuItem>
                        <MenuItem value="DO">DO</MenuItem>
                        <MenuItem value="RN">RN</MenuItem>
                        <MenuItem value="MA">MA</MenuItem>
                        <MenuItem value="NP">NP</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={slot.email || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'email', e.target.value)}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="john@example.com"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={slot.attendance || 'No Show'}
                        onChange={(e) => handleSlotChange(slot.id, 'attendance', e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{ fontSize: '0.875rem', fontWeight: slot.attendance === 'Show' ? 600 : 400, color: slot.attendance === 'Show' ? '#2e7d32' : '#64748b' }}
                      >
                        <MenuItem value="No Show">No Show</MenuItem>
                        <MenuItem value="Show">Show</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={slot.passfail || 'No Grade'}
                        onChange={(e) => handleSlotChange(slot.id, 'passfail', e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: slot.passfail === 'Pass' ? '#2e7d32' : slot.passfail === 'Fail' ? '#d32f2f' : '#64748b'
                        }}
                      >
                        <MenuItem value="No Grade">No Grade</MenuItem>
                        <MenuItem value="Pass">Pass</MenuItem>
                        <MenuItem value="Fail">Fail</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={slot.score ?? 0}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          handleSlotChange(slot.id, 'score', val);
                        }}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                       <TextField
                        size="small"
                        fullWidth
                        value={slot.notes || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'notes', e.target.value)}
                        variant="standard"
                        slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.875rem' } } }}
                        placeholder="Additional info..."
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Save individual row changes">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#0074C8' }}
                            onClick={() => handleIndividualUpdate(slot)}
                            disabled={saving}
                          >
                            <SaveRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset student data (Delete)">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#f59e0b' }} 
                            onClick={() => handleIndividualReset(slot.id)}
                            disabled={saving}
                          >
                            <RotateLeftRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {slots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No slots found for this class. Add some to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Pfapcontainer>
      </Box>

      {/* Batch Populate Dialog */}
      <Dialog open={isPopulateOpen} onClose={() => setIsPopulateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Batch Populate Slots</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
            Paste student data below (one per line). Format: <strong>AHA ID, First Name, Last Name, Email</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            placeholder="AHA-001, John, Doe, john@example.com&#10;AHA-002, Jane, Smith, jane@smith.com"
            value={populateData}
            onChange={(e) => setPopulateData(e.target.value)}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This will fill existing empty slots first, then create new ones if needed.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsPopulateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePopulate} 
            disabled={!populateData.trim() || saving}
            sx={{ textTransform: 'none', backgroundColor: '#0074C8' }}
          >
            Populate Now
          </Button>
        </DialogActions>
      </Dialog>
      {/* Batch Edit Dialog */}
      <Dialog open={isBatchEditOpen} onClose={() => setIsBatchEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Batch Edit {selectedIds.length} Slots</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
            Enter values to apply to all selected slots. Leave fields blank to keep existing values.
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Post-nominal</InputLabel>
              <Select
                value={batchEditData.postnominalcredential}
                label="Post-nominal"
                onChange={(e) => setBatchEditData({ ...batchEditData, postnominalcredential: e.target.value })}
              >
                <MenuItem value=""><em>None/Keep</em></MenuItem>
                <MenuItem value="DR">DR</MenuItem>
                <MenuItem value="DO">DO</MenuItem>
                <MenuItem value="RN">RN</MenuItem>
                <MenuItem value="MA">MA</MenuItem>
                <MenuItem value="NP">NP</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Attendance</InputLabel>
              <Select
                value={batchEditData.attendance}
                label="Attendance"
                onChange={(e) => setBatchEditData({ ...batchEditData, attendance: e.target.value })}
              >
                <MenuItem value=""><em>Keep existing</em></MenuItem>
                <MenuItem value="No Show">No Show</MenuItem>
                <MenuItem value="Show">Show</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Grade</InputLabel>
              <Select
                value={batchEditData.passfail}
                label="Grade"
                onChange={(e) => setBatchEditData({ ...batchEditData, passfail: e.target.value })}
              >
                <MenuItem value=""><em>Keep existing</em></MenuItem>
                <MenuItem value="No Grade">No Grade</MenuItem>
                <MenuItem value="Pass">Pass</MenuItem>
                <MenuItem value="Fail">Fail</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Score (0-100)"
              type="number"
              value={batchEditData.score}
              onChange={(e) => setBatchEditData({ ...batchEditData, score: e.target.value })}
              placeholder="Leave blank to keep"
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={batchEditData.notes}
              onChange={(e) => setBatchEditData({ ...batchEditData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsBatchEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleApplyBatchEdit} 
            sx={{ textTransform: 'none', backgroundColor: '#0074C8' }}
          >
            Apply to Selection
          </Button>
        </DialogActions>
      </Dialog>
      {/* Quick Add Dialog */}
      <Dialog open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Individual Student Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
            Enter student details to add a new record to this class.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="First Name"
              value={quickAddData.firstname}
              onChange={(e) => setQuickAddData({ ...quickAddData, firstname: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={quickAddData.lastname}
              onChange={(e) => setQuickAddData({ ...quickAddData, lastname: e.target.value })}
              fullWidth
            />
          </Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="AHA ID"
                value={quickAddData.ahaid}
                onChange={(e) => setQuickAddData({ ...quickAddData, ahaid: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Post-nominal</InputLabel>
                <Select
                  value={quickAddData.postnominalcredential || ''}
                  label="Post-nominal"
                  onChange={(e) => setQuickAddData({ ...quickAddData, postnominalcredential: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="DR">DR</MenuItem>
                  <MenuItem value="DO">DO</MenuItem>
                  <MenuItem value="RN">RN</MenuItem>
                  <MenuItem value="MA">MA</MenuItem>
                  <MenuItem value="NP">NP</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Email"
              value={quickAddData.email}
              onChange={(e) => setQuickAddData({ ...quickAddData, email: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Attendance</InputLabel>
                <Select
                  value={quickAddData.attendance || 'No Show'}
                  label="Attendance"
                  onChange={(e) => setQuickAddData({ ...quickAddData, attendance: e.target.value })}
                >
                  <MenuItem value="No Show">No Show</MenuItem>
                  <MenuItem value="Show">Show</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={quickAddData.passfail || 'No Grade'}
                  label="Grade"
                  onChange={(e) => setQuickAddData({ ...quickAddData, passfail: e.target.value })}
                >
                  <MenuItem value="No Grade">No Grade</MenuItem>
                  <MenuItem value="Pass">Pass</MenuItem>
                  <MenuItem value="Fail">Fail</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Score (0-100)"
                type="number"
                value={quickAddData.score ?? 0}
                onChange={(e) => setQuickAddData({ ...quickAddData, score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                fullWidth
              />
            </Box>
            <TextField
              label="Notes"
              multiline
              rows={2}
              value={quickAddData.notes}
              onChange={(e) => setQuickAddData({ ...quickAddData, notes: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsQuickAddOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleQuickAdd} 
            disabled={saving}
            sx={{ textTransform: 'none', backgroundColor: '#0074C8' }}
          >
            Add Record Now
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: '12px', fontWeight: 600 }}
          icon={snackbar.severity === 'success' ? <CheckCircleRoundedIcon /> : <ErrorRoundedIcon />}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Pfapfooter />
    </Box>
  );
}

export default function SlotsManagementPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <SlotsManagementContent />
    </Suspense>
  );
}
