'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Instructor {
  id: string;
  certificationid: string;
  firstname: string;
  lastname: string;
  postnominalcredential: string;
  active: boolean | string;
}

type InstructorFormFields = {
  firstname: string;
  lastname: string;
  certificationid: string;
  postnominalcredential: string;
  active: 'Yes' | 'No';
};

type FormErrors = Partial<Record<keyof InstructorFormFields, string>>;

const initialFormState: InstructorFormFields = {
  firstname: '',
  lastname: '',
  certificationid: '',
  postnominalcredential: '',
  active: 'Yes',
};

export default function InstructorsPage() {
  const { userId, companyId, companyName, loading } = useAuth();
  const { setMessage } = useMessage();
  const router = useRouter();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog / Form States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [form, setForm] = useState<InstructorFormFields>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Deletion confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Initial Load: Fetch companies and determine the target company
  useEffect(() => {
    if (loading) return;

    const init = async () => {
      setLoadingCompanies(true);
      try {
        const { ok, data } = await apiFetch<any[]>('/api/companies');
        if (ok) {
          setCompanies(data);
          
          // Use the companyId directly from the auth context if it exists
          if (companyId) {
            setSelectedCompanyId(companyId);
          } else if (userId === 'Admin' && data.length > 0) {
            // Default to first company for Admin
            setSelectedCompanyId(data[0].id);
          } else if (companyName) {
            // Fallback to name matching if ID is missing from session
            const userComp = data.find(
              (c) =>
                c.name.toLowerCase() === companyName.toLowerCase() ||
                (companyName.toLowerCase().includes('fred') && c.name.toLowerCase().includes('fred'))
            );
            if (userComp) setSelectedCompanyId(userComp.id);
          }
        }
      } catch (err) {
        console.error('Error loading companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    init();
  }, [loading, userId, companyName, companyId]);

  // 2. Fetch instructors whenever the selectedCompanyId changes
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const { ok, data, status } = await apiFetch<Instructor[]>(`/api/companies/${selectedCompanyId}/instructors`);
        if (ok) {
          setInstructors(data || []);
        } else {
          throw new Error(`Failed to load instructors (HTTP ${status})`);
        }
      } catch (err: any) {
        console.error('Error fetching instructors:', err);
        setMessage('Failed to load instructor records', 'error');
        setInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, [selectedCompanyId, setMessage]);

  const handleOpenAddDialog = () => {
    setEditingInstructor(null);
    setForm(initialFormState);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (inst: Instructor) => {
    setEditingInstructor(inst);
    
    // Check active boolean/string conversion defensibly
    let activeVal: 'Yes' | 'No' = 'Yes';
    if (inst.active === false || String(inst.active).toLowerCase() === 'false' || inst.active === 'No') {
      activeVal = 'No';
    }

    setForm({
      firstname: inst.firstname || '',
      lastname: inst.lastname || '',
      certificationid: inst.certificationid || '',
      postnominalcredential: inst.postnominalcredential || '',
      active: activeVal,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm(initialFormState);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.firstname.trim()) {
      errors.firstname = 'First name is required.';
    }
    if (!form.lastname.trim()) {
      errors.lastname = 'Last name is required.';
    }
    if (!form.certificationid.trim()) {
      errors.certificationid = 'Certification ID is required.';
    }
    if (!form.postnominalcredential.trim()) {
      errors.postnominalcredential = 'Post-nominal credential is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !selectedCompanyId) return;

    setSaving(true);
    try {
      const isEdit = !!editingInstructor;
      const url = isEdit 
        ? `/api/companies/${selectedCompanyId}/instructors/${editingInstructor.id}` 
        : `/api/companies/${selectedCompanyId}/instructors`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        certificationid: form.certificationid.trim(),
        postnominalcredential: form.postnominalcredential.trim(),
        active: form.active === 'Yes',
      };

      const { ok, data, status } = await apiFetch<Instructor>(url, {
        method,
        body: payload,
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Failed to save instructor (HTTP ${status})`;
        throw new Error(errMsg);
      }

      const savedInstructor = data;

      if (isEdit) {
        setInstructors((prev) =>
          prev.map((inst) => (inst.id === editingInstructor.id ? savedInstructor : inst))
        );
        setMessage(`${form.firstname} ${form.lastname} record was changed`, 'success');
      } else {
        setInstructors((prev) => [savedInstructor, ...prev]);
        setMessage(`Instructor ${form.firstname} ${form.lastname} added successfully`, 'success');
      }

      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving instructor:', err);
      setMessage(err.message || 'Failed to save instructor record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (inst: Instructor) => {
    setInstructorToDelete(inst);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setInstructorToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!instructorToDelete || !selectedCompanyId) return;

    setDeleting(true);
    try {
      const { ok, data, status } = await apiFetch(`/api/companies/${selectedCompanyId}/instructors/${instructorToDelete.id}`, {
        method: 'DELETE',
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Failed to delete instructor (HTTP ${status})`;
        throw new Error(errMsg);
      }

      setInstructors((prev) => prev.filter((inst) => inst.id !== instructorToDelete.id));
      setMessage(`Instructor ${instructorToDelete.firstname} ${instructorToDelete.lastname} was deleted`, 'success');
      handleCloseDeleteConfirm();
    } catch (err: any) {
      console.error('Error deleting instructor:', err);
      setMessage(err.message || 'Failed to delete instructor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Render Access Denied for non-logged-in users
  if (loading) {
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

  if (!userId) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Pfapappbar />
        <Box sx={{ flex: 1, pb: 12 }}>
          <Pfapcontainer maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                p: 5,
                textAlign: 'center',
                border: '2px solid #c62828',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(198, 40, 40, 0.08)',
                mt: 8,
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  mb: 3,
                }}
              >
                <LockIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#c62828', mb: 2 }}>
                Access Denied
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555', mb: 4, lineHeight: 1.6 }}>
                Please log in to manage instructor records.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/')}
                  sx={{
                    color: '#0074C8',
                    borderColor: '#0074C8',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#00518c', backgroundColor: 'rgba(0, 116, 200, 0.04)' },
                  }}
                >
                  Go Home
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/login')}
                  sx={{
                    backgroundColor: '#0074C8',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#00518c' },
                  }}
                >
                  Log In
                </Button>
              </Box>
            </Paper>
          </Pfapcontainer>
        </Box>
        <Pfapfooter />
      </Box>
    );
  }

  // Filter instructors by search query
  const filteredInstructors = instructors.filter((inst) => {
    const term = searchTerm.toLowerCase();
    const firstname = (inst.firstname || '').toLowerCase();
    const lastname = (inst.lastname || '').toLowerCase();
    const fullname = `${firstname} ${lastname}`;
    const cert = (inst.certificationid || '').toLowerCase();
    const creds = (inst.postnominalcredential || '').toLowerCase();
    
    return (
      firstname.includes(term) ||
      lastname.includes(term) ||
      fullname.includes(term) ||
      cert.includes(term) ||
      creds.includes(term)
    );
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 4 }}>
        <Pfapcontainer maxWidth="lg">
          {/* Header */}
          <Box
            sx={{
              mb: 4,
              mt: 2,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
                Instructors Directory
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Manage certified trainers, credentials, active state and accreditation IDs.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search instructors..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#777777' }} />
                      </InputAdornment>
                    ),
                    style: { backgroundColor: '#ffffff', borderRadius: '8px' }
                  }
                }}
                sx={{ minWidth: 240 }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                disabled={!selectedCompanyId}
                sx={{
                  backgroundColor: '#0074C8',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#00518c' },
                }}
              >
                Add Instructor
              </Button>
            </Box>
          </Box>

          {/* Company Selector for Admins */}
          <Box sx={{ mb: 4, maxWidth: 400 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="company-select-label">View Instructors for Company</InputLabel>
              <Select
                labelId="company-select-label"
                value={selectedCompanyId}
                label="View Instructors for Company"
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={userId !== 'Admin' || loadingCompanies}
                sx={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                {companies.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* List Container */}
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: '12px',
              border: '2px solid #0074C8',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}
          >
            {loadingInstructors ? (
              <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress sx={{ color: '#0074C8' }} />
                <Typography variant="body2" sx={{ color: '#777777' }}>
                  Loading instructors list...
                </Typography>
              </Box>
            ) : filteredInstructors.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#777777', mb: 1 }}>
                  No Instructors Found
                </Typography>
                <Typography variant="body2" sx={{ color: '#999999' }}>
                  {instructors.length === 0
                    ? 'No instructors have been registered yet for this company. Click "Add Instructor" to add one.'
                    : 'Try searching for a different name, credential, or certification ID.'}
                </Typography>
              </Box>
            ) : (
              <Table aria-label="instructors directory table">
                <TableHead sx={{ backgroundColor: '#0074C8' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>First Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Last Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Certification ID</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Credentials</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '120px' }}>Active</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '140px', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInstructors.map((inst) => {
                    const isInstActive = inst.active === true || String(inst.active).toLowerCase() === 'true' || inst.active === 'Yes';
                    return (
                      <TableRow
                        key={inst.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#fcfcfc' },
                          '&:hover': { backgroundColor: 'rgba(0, 116, 200, 0.02)' },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: '#333333' }}>{inst.firstname}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#333333' }}>{inst.lastname}</TableCell>
                        <TableCell sx={{ color: '#555555', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                          {inst.certificationid}
                        </TableCell>
                        <TableCell sx={{ color: '#555555' }}>
                          <Chip
                            label={inst.postnominalcredential}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#90caf9',
                              color: '#0d47a1',
                              backgroundColor: '#e3f2fd',
                              fontWeight: 600,
                              borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isInstActive ? (
                            <Chip
                              label="Yes"
                              size="small"
                              sx={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                fontWeight: 600,
                                borderRadius: '6px',
                              }}
                            />
                          ) : (
                            <Chip
                              label="No"
                              size="small"
                              sx={{
                                backgroundColor: '#ffebee',
                                color: '#c62828',
                                fontWeight: 600,
                                borderRadius: '6px',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="Edit Instructor">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(inst)}
                              sx={{
                                color: '#0074C8',
                                '&:hover': { backgroundColor: 'rgba(0, 116, 200, 0.04)' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Instructor">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(inst)}
                              sx={{
                                color: '#c62828',
                                '&:hover': { backgroundColor: 'rgba(198, 40, 40, 0.04)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Pfapcontainer>
      </Box>
      <Pfapfooter />

      {/* Add / Edit Modal Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            style: { borderRadius: '12px' },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700, color: '#0074C8', borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="First Name"
            name="firstname"
            variant="outlined"
            fullWidth
            size="small"
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.target.value })}
            error={!!formErrors.firstname}
            helperText={formErrors.firstname}
          />

          <TextField
            label="Last Name"
            name="lastname"
            variant="outlined"
            fullWidth
            size="small"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            error={!!formErrors.lastname}
            helperText={formErrors.lastname}
          />

          <TextField
            label="Certification ID"
            name="certificationid"
            variant="outlined"
            fullWidth
            size="small"
            value={form.certificationid}
            onChange={(e) => setForm({ ...form, certificationid: e.target.value })}
            error={!!formErrors.certificationid}
            helperText={formErrors.certificationid}
            placeholder="e.g. AHA-123456"
          />

          <TextField
            label="Post-nominal Credential"
            name="postnominalcredential"
            variant="outlined"
            fullWidth
            size="small"
            value={form.postnominalcredential}
            onChange={(e) => setForm({ ...form, postnominalcredential: e.target.value })}
            error={!!formErrors.postnominalcredential}
            helperText={formErrors.postnominalcredential}
            placeholder="e.g. MD, RN, EMT-P"
          />

          <FormControl fullWidth size="small">
            <InputLabel id="active-select-label">Active</InputLabel>
            <Select
              labelId="active-select-label"
              id="active-select"
              value={form.active}
              label="Active"
              onChange={(e) => setForm({ ...form, active: e.target.value as 'Yes' | 'No' })}
            >
              <MenuItem value="Yes">Yes (Active)</MenuItem>
              <MenuItem value="No">No (Not Active)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#555555',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              backgroundColor: '#0074C8',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              px: 3,
              '&:hover': { backgroundColor: '#00518c' },
            }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        slotProps={{
          paper: {
            style: { borderRadius: '12px' },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete instructor{' '}
            <strong>
              {instructorToDelete ? `${instructorToDelete.firstname} ${instructorToDelete.lastname}` : ''}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            sx={{
              color: '#555555',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              backgroundColor: '#c62828',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              px: 3,
              '&:hover': { backgroundColor: '#b71c1c' },
            }}
          >
            {deleting ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
