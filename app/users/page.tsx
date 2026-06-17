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
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SuperSimplePersonIcon from '@mui/icons-material/Person';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  purpose: string;
  approval: string;
}

interface CompanyUser {
  id: string;            // This stores the Username / User ID in Firestore
  username?: string;     // Maps to backend entity "username"
  name?: string;         // Maps to backend entity "name"
  email?: string;        // Maps to backend entity "email"
  phonenumber?: string;  // Maps to backend entity "phonenumber"
}

type UserFormFields = {
  userId: string;
  username: string;
  fullname: string;
  emailAddress: string;
  phonenumber: string;
  password: string;
  verifyPassword: string;
};

type FormErrors = Partial<Record<keyof UserFormFields, string>>;

const initialFormState: UserFormFields = {
  userId: '',
  username: '',
  fullname: '',
  emailAddress: '',
  phonenumber: '',
  password: '',
  verifyPassword: '',
};

// Helper function to filter non-digits and format phone numbers on the fly
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
  const truncated = cleaned.slice(0, 10);   // Max 10 digits

  if (truncated.length === 0) return '';
  if (truncated.length <= 3) return `(${truncated}`;
  if (truncated.length <= 6) return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
  return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
};

export default function UsersPage() {
  const { userId, loading } = useAuth();
  const { setMessage } = useMessage();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dialog / Form States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
  const [form, setForm] = useState<UserFormFields>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Fetch Companies on Mount if Super User
  useEffect(() => {
    if (loading || userId !== 'Admin') return;

    setLoadingCompanies(true);
    apiFetch<Company[]>('/api/companies')
      .then(({ ok, data, status }) => {
        if (!ok) {
          throw new Error(`Failed to load companies (HTTP ${status})`);
        }
        // Sort companies alphabetically
        const sorted = (data || []).sort((a, b) => a.name.localeCompare(b.name));
        setCompanies(sorted);
      })
      .catch((err: any) => {
        console.error('Error fetching companies list:', err);
        setMessage('Failed to load companies', 'error');
      })
      .finally(() => {
        setLoadingCompanies(false);
      });
  }, [userId, loading, setMessage]);

  // Fetch users reactive to company selection
  useEffect(() => {
    if (!selectedCompany) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    apiFetch<CompanyUser[]>(`/api/companies/${selectedCompany.id}/users`)
      .then(({ ok, data, status }) => {
        if (!ok) {
          throw new Error(`Failed to fetch users (HTTP ${status})`);
        }
        setUsers(data || []);
      })
      .catch((err: any) => {
        console.error('Error fetching users:', err);
        setMessage('Failed to load users for the selected company', 'error');
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, [selectedCompany, setMessage]);

  // Form Field Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const isEdit = !!editingUser;
    if (isEdit && !form.userId.trim()) {
      errors.userId = 'User ID is required.';
    }

    if (!form.username.trim()) {
      errors.username = 'Username is required.';
    } else if (form.username.trim().toLowerCase() === form.fullname.trim().toLowerCase()) {
      errors.username = 'User Name cannot be the same as the Full Name.';
    }

    if (!form.fullname.trim()) {
      errors.fullname = 'Full name is required.';
    }

    if (!form.emailAddress.trim()) {
      errors.emailAddress = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim())) {
      errors.emailAddress = 'Enter a valid email address.';
    }

    // Validate phone number format if provided
    if (form.phonenumber.trim() && form.phonenumber.length !== 14) {
      errors.phonenumber = 'Phone number must be complete, e.g. (734) 770-8457.';
    }

    // Password validation rules (required for NEW users only)
    if (!editingUser) {
      const password = form.password;
      if (!password) {
        errors.password = 'Password is required.';
      } else if (password.length < 8 || !/[#$&]/.test(password)) {
        errors.password = 'Password must be 8 characters or greater and contain #, $, or &.';
      }

      if (password !== form.verifyPassword) {
        errors.verifyPassword = 'Passwords do not match.';
      }
    } else {
      // For updates, password is optional, but if entered, it must match validation
      const password = form.password;
      if (password) {
        if (password.length < 8 || !/[#$&]/.test(password)) {
          errors.password = 'Password must be 8 characters or greater and contain #, $, or &.';
        }
        if (password !== form.verifyPassword) {
          errors.verifyPassword = 'Passwords do not match.';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (user: CompanyUser | null = null) => {
    setEditingUser(user);
    if (user) {
      setForm({
        userId: user.id || '',
        username: user.username || '',
        fullname: user.name || '',
        emailAddress: user.email || '',
        phonenumber: user.phonenumber || '', // Pre-fill phone number
        password: '',
        verifyPassword: '',
      });
    } else {
      setForm(initialFormState);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(initialFormState);
    setFormErrors({});
  };

  // Create or Update submit handler
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    if (!validateForm()) {
      setMessage('Please correct form errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editingUser;
      const url = isEdit
        ? `/api/companies/${selectedCompany.id}/users/${editingUser.id}`
        : `/api/companies/${selectedCompany.id}/users`;

      const method = isEdit ? 'PUT' : 'POST';

      // Assemble payload matching spring boot entity requirements exactly
      const payload: Record<string, any> = {
        username: form.username.trim(),     // Explicit backend username field
        name: form.fullname.trim(),         // Full name mapped to name
        email: form.emailAddress.trim(),     // Email mapped to email
        phonenumber: form.phonenumber.trim(), // Phone number mapped to phonenumber
      };

      if (isEdit) {
        payload.id = editingUser.id;        // Preserve original document ID for edit
      }

      if (form.password) {
        payload.password = form.password;
      }

      const { ok, data, status } = await apiFetch<any>(url, {
        method,
        body: payload,
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Operation failed (HTTP ${status})`;
        throw new Error(errMsg);
      }

      setMessage(isEdit ? 'User updated successfully' : 'User created successfully', 'success');
      handleCloseDialog();

      // Refresh the users list dynamically
      const refreshRes = await apiFetch<CompanyUser[]>(`/api/companies/${selectedCompany.id}/users`);
      if (refreshRes.ok) {
        setUsers(refreshRes.data || []);
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      setMessage(err.message || 'An error occurred while saving user record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete handler with strict restraint
  const handleDeleteUser = async (user: CompanyUser) => {
    if (!selectedCompany) return;

    // Strict restraint: MUST have at least one user per company
    if (users.length <= 1) {
      setMessage('Constraint Violation: A company must have at least one registered user. You cannot delete the sole user.', 'error');
      return;
    }

    const confirmDeletion = window.confirm(
      `Are you sure you want to delete user "${user.name || '—'}" (User Name: ${user.username || '—'}, User ID: ${user.id})?`
    );
    if (!confirmDeletion) return;

    try {
      const targetUserId = user.id;
      const { ok, data, status } = await apiFetch(`/api/companies/${selectedCompany.id}/users/${targetUserId}`, {
        method: 'DELETE',
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Deletion failed (HTTP ${status})`;
        throw new Error(errMsg);
      }

      setMessage('User deleted successfully', 'success');

      // Refresh listing dynamically
      const refreshRes = await apiFetch<CompanyUser[]>(`/api/companies/${selectedCompany.id}/users`);
      if (refreshRes.ok) {
        setUsers(refreshRes.data || []);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setMessage(err.message || 'An error occurred while deleting the user.', 'error');
    }
  };

  // Guard loading state checking Auth
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

  // Auth Guard: Admin check
  if (userId !== 'Admin') {
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
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 32px rgba(198, 40, 40, 0.08)',
              mt: 8,
              mb: 8,
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
              The screen you are trying to view is restricted to Super User administrators.
              Please log in with the Super User account to manage company users.
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
        <Pfapfooter />
      </Box>
    );
  }

  const isDeleteDisabled = users.length <= 1;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 6 }}>
        <Pfapcontainer maxWidth="lg">
          
          {/* Page Header */}
          <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
                User Management
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Search and select an organization, then view, add, modify, or remove its registered user members.
              </Typography>
            </Box>
          </Box>

          {/* Search Selector Panel */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#00518c', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon fontSize="small" /> Select or Search Company
              </Typography>

              {loadingCompanies ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                  <CircularProgress size={24} sx={{ color: '#0074C8' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading companies registry...</Typography>
                </Box>
              ) : (
                <Autocomplete
                  options={companies}
                  getOptionLabel={(option) => option.name}
                  value={selectedCompany}
                  onChange={(event, newValue) => {
                    setSelectedCompany(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type name or select a company from list..."
                      placeholder="Start typing company name..."
                      fullWidth
                      variant="outlined"
                    />
                  )}
                  noOptionsText="No matching companies found"
                />
              )}
            </CardContent>
          </Card>

          {/* Users List & Controls */}
          {selectedCompany && (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#00518c', fontWeight: 700 }}>
                  Active Users of: <span style={{ color: '#0074C8' }}>{selectedCompany.name}</span>
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(null)}
                  sx={{
                    backgroundColor: '#0074C8',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    px: 3,
                    '&:hover': { backgroundColor: '#00518c' },
                  }}
                >
                  Add User
                </Button>
              </Box>

              {loadingUsers ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                  <CircularProgress sx={{ mb: 2, color: '#0074C8' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fetching organization members...</Typography>
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider', borderRadius: '8px' }}>
                  <SuperSimplePersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                    No Users Registered
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    This company currently does not have any active user accounts. Click "Add User" above to register one.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Box}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: 'rgba(0, 116, 200, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#00518c' }}>User Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#00518c' }}>Full Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#00518c' }}>Email Address</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#00518c' }}>Phone Number</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#00518c', pr: 4 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => {
                        const displayName = user.name || '—';
                        const displayEmail = user.email || '—';
                        const displayPhone = user.phonenumber || '—';
                        return (
                          <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                              {user.username || '—'}
                            </TableCell>
                            <TableCell>{displayName}</TableCell>
                            <TableCell>{displayEmail}</TableCell>
                            <TableCell>{displayPhone}</TableCell>
                            <TableCell align="right" sx={{ pr: 2 }}>
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(user)}
                                size="small"
                                sx={{ mr: 1, color: '#0074C8' }}
                                title="Edit User details"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>

                              {isDeleteDisabled ? (
                                <Tooltip
                                  title="Cannot delete the sole user of a company. There must always be at least one user per organization."
                                  placement="top"
                                  arrow
                                >
                                  <span>
                                    <IconButton
                                      disabled
                                      size="small"
                                      sx={{ color: 'rgba(0,0,0,0.26)' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              ) : (
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteUser(user)}
                                  size="small"
                                  sx={{ color: '#c62828' }}
                                  title="Delete User record"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {!selectedCompany && !loadingCompanies && (
            <Paper
              elevation={0}
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: '12px',
                p: 8,
                textAlign: 'center',
                backgroundColor: '#ffffff'
              }}
            >
              <SuperSimplePersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                Awaiting Search Selection
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please select an organization in the search search box above to populate and manage company user accounts.
              </Typography>
            </Paper>
          )}
        </Pfapcontainer>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveUser}>
          <DialogTitle sx={{ color: '#00518c', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
            {editingUser ? 'Update User Details' : 'Add User to Organization'}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={2.5}>
              {editingUser && (
                <TextField
                  label="User ID"
                  name="userId"
                  value={form.userId}
                  onChange={(e) => {
                    setForm({ ...form, userId: e.target.value });
                    setFormErrors({ ...formErrors, userId: '' });
                  }}
                  disabled={true}
                  error={Boolean(formErrors.userId)}
                  helperText={formErrors.userId || 'Unique database document identifier.'}
                  fullWidth
                  required
                  variant="outlined"
                />
              )}

              <TextField
                label="User Name"
                name="username"
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  setFormErrors({ ...formErrors, username: '' });
                }}
                error={Boolean(formErrors.username)}
                helperText={formErrors.username || 'Unique login user name.'}
                fullWidth
                required
                variant="outlined"
              />

              <TextField
                label="User Full Name"
                name="fullname"
                value={form.fullname}
                onChange={(e) => {
                  setForm({ ...form, fullname: e.target.value });
                  setFormErrors({ ...formErrors, fullname: '' });
                }}
                error={Boolean(formErrors.fullname)}
                helperText={formErrors.fullname || ''}
                fullWidth
                required
                variant="outlined"
              />

              <TextField
                label="Email Address"
                name="emailAddress"
                type="email"
                value={form.emailAddress}
                onChange={(e) => {
                  setForm({ ...form, emailAddress: e.target.value });
                  setFormErrors({ ...formErrors, emailAddress: '' });
                }}
                error={Boolean(formErrors.emailAddress)}
                helperText={formErrors.emailAddress || ''}
                fullWidth
                required
                variant="outlined"
              />

              <TextField
                label="Phone Number"
                name="phonenumber"
                value={form.phonenumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setForm({ ...form, phonenumber: formatted });
                  setFormErrors({ ...formErrors, phonenumber: '' });
                }}
                placeholder="(734) 770-8457"
                error={Boolean(formErrors.phonenumber)}
                helperText={formErrors.phonenumber || 'Format: (734) 770-8457'}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
                error={Boolean(formErrors.password)}
                helperText={
                  formErrors.password ||
                  (editingUser
                    ? 'Leave password blank to keep current password.'
                    : 'Must be 8+ characters and contain #, $, or &.')
                }
                fullWidth
                required={!editingUser}
                variant="outlined"
              />

              <TextField
                label="Verify Password"
                name="verifyPassword"
                type="password"
                value={form.verifyPassword}
                onChange={(e) => {
                  setForm({ ...form, verifyPassword: e.target.value });
                  setFormErrors({ ...formErrors, verifyPassword: '' });
                }}
                error={Boolean(formErrors.verifyPassword)}
                helperText={formErrors.verifyPassword || ''}
                fullWidth
                required={!editingUser && !!form.password}
                variant="outlined"
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: 'text.primary', backgroundColor: '#f5f5f5' }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                backgroundColor: '#0074C8',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#00518c' }
              }}
            >
              {saving ? 'Saving...' : 'Save User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Pfapfooter />
    </Box>
  );
}
