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

interface Course {
  id: string;
  coursetitle: string;
  coursetype: string;
  active: boolean | string;
}

type CourseFormFields = {
  coursetitle: string;
  coursetype: string;
  active: 'Yes' | 'No';
};

type FormErrors = Partial<Record<keyof CourseFormFields, string>>;

const initialFormState: CourseFormFields = {
  coursetitle: '',
  coursetype: '',
  active: 'Yes',
};

export default function CoursesPage() {
  const { userId, companyId, companyName, loading } = useAuth();
  const { setMessage } = useMessage();
  const router = useRouter();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog / Form States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormFields>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Deletion confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
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

  // 2. Fetch courses whenever the selectedCompanyId changes
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const { ok, data, status } = await apiFetch<Course[]>(`/api/companies/${selectedCompanyId}/courses`);
        if (ok) {
          setCourses(data || []);
        } else {
          throw new Error(`Failed to load courses (HTTP ${status})`);
        }
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setMessage('Failed to load course records', 'error');
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [selectedCompanyId, setMessage]);

  const handleOpenAddDialog = () => {
    setEditingCourse(null);
    setForm(initialFormState);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (course: Course) => {
    setEditingCourse(course);
    
    // Check active boolean/string conversion defensibly
    let activeVal: 'Yes' | 'No' = 'Yes';
    if (course.active === false || String(course.active).toLowerCase() === 'false' || course.active === 'No') {
      activeVal = 'No';
    }

    setForm({
      coursetitle: course.coursetitle || '',
      coursetype: course.coursetype || '',
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

    if (!form.coursetitle.trim()) {
      errors.coursetitle = 'Course title is required.';
    }
    if (!form.coursetype.trim()) {
      errors.coursetype = 'Course type is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !selectedCompanyId) return;

    setSaving(true);
    try {
      const isEdit = !!editingCourse;
      const url = isEdit 
        ? `/api/companies/${selectedCompanyId}/courses/${editingCourse.id}` 
        : `/api/companies/${selectedCompanyId}/courses`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        coursetitle: form.coursetitle.trim(),
        coursetype: form.coursetype.trim(),
        active: form.active === 'Yes',
      };

      const { ok, data, status } = await apiFetch<Course>(url, {
        method,
        body: payload,
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Failed to save course (HTTP ${status})`;
        throw new Error(errMsg);
      }

      const savedCourse = data;

      if (isEdit) {
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? savedCourse : c))
        );
        setMessage(`${form.coursetitle} record was changed`, 'success');
      } else {
        setCourses((prev) => [savedCourse, ...prev]);
        setMessage(`Course ${form.coursetitle} added successfully`, 'success');
      }

      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving course:', err);
      setMessage(err.message || 'Failed to save course record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (course: Course) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setCourseToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!courseToDelete || !selectedCompanyId) return;

    setDeleting(true);
    try {
      const { ok, data, status } = await apiFetch(`/api/companies/${selectedCompanyId}/courses/${courseToDelete.id}`, {
        method: 'DELETE',
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Failed to delete course (HTTP ${status})`;
        throw new Error(errMsg);
      }

      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setMessage(`Course ${courseToDelete.coursetitle} was deleted`, 'success');
      handleCloseDeleteConfirm();
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setMessage(err.message || 'Failed to delete course', 'error');
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
                Please log in to manage course records.
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

  // Filter courses by search query
  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    const title = (course.coursetitle || '').toLowerCase();
    const type = (course.coursetype || '').toLowerCase();
    
    return title.includes(term) || type.includes(term);
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
                Course Catalog
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Manage course titles, types, accreditation structures, and active catalog statuses.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search courses..."
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
                Add Course
              </Button>
            </Box>
          </Box>

          {/* Company Selector for Admins */}
          <Box sx={{ mb: 4, maxWidth: 400 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="company-select-label">View Courses for Company</InputLabel>
              <Select
                labelId="company-select-label"
                value={selectedCompanyId}
                label="View Courses for Company"
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
            {loadingCourses ? (
              <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress sx={{ color: '#0074C8' }} />
                <Typography variant="body2" sx={{ color: '#777777' }}>
                  Loading course catalog...
                </Typography>
              </Box>
            ) : filteredCourses.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#777777', mb: 1 }}>
                  No Courses Found
                </Typography>
                <Typography variant="body2" sx={{ color: '#999999' }}>
                  {courses.length === 0
                    ? 'No courses have been registered yet for this company. Click "Add Course" to add one.'
                    : 'Try searching for a different course title or type.'}
                </Typography>
              </Box>
            ) : (
              <Table aria-label="courses directory table">
                <TableHead sx={{ backgroundColor: '#0074C8' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Course Title</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Course Type</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '120px' }}>Active</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '140px', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const isCourseActive = course.active === true || String(course.active).toLowerCase() === 'true' || course.active === 'Yes';
                    return (
                      <TableRow
                        key={course.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#fcfcfc' },
                          '&:hover': { backgroundColor: 'rgba(0, 116, 200, 0.02)' },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: '#333333' }}>{course.coursetitle}</TableCell>
                        <TableCell sx={{ color: '#555555' }}>
                          <Chip
                            label={course.coursetype}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#b2dfdb',
                              color: '#004d40',
                              backgroundColor: '#e0f2f1',
                              fontWeight: 600,
                              borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isCourseActive ? (
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
                          <Tooltip title="Edit Course">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(course)}
                              sx={{
                                color: '#0074C8',
                                '&:hover': { backgroundColor: 'rgba(0, 116, 200, 0.04)' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Course">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(course)}
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
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Course Title"
            name="coursetitle"
            variant="outlined"
            fullWidth
            size="small"
            value={form.coursetitle}
            onChange={(e) => setForm({ ...form, coursetitle: e.target.value })}
            error={!!formErrors.coursetitle}
            helperText={formErrors.coursetitle}
            placeholder="e.g. Basic Life Support (BLS)"
          />

          <TextField
            label="Course Type"
            name="coursetype"
            variant="outlined"
            fullWidth
            size="small"
            value={form.coursetype}
            onChange={(e) => setForm({ ...form, coursetype: e.target.value })}
            error={!!formErrors.coursetype}
            helperText={formErrors.coursetype}
            placeholder="e.g. Certification, Recertification"
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
            Are you sure you want to delete course{' '}
            <strong>
              {courseToDelete ? courseToDelete.coursetitle : ''}
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
