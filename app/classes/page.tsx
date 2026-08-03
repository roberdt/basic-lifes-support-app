'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Button,
  IconButton,
  CircularProgress,
  TableSortLabel,
  Stack,
  Card,
  CardContent,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';

interface ClassItem {
  id: string;
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  approved: 'Yes' | 'No' | boolean;
  coursetitle: string;
  coursetype: string;
  endtime: string;
  instructorname: string;
  numberslots: number;
  starttime: string;
  dateId?: string;
}

type Order = 'asc' | 'desc';

export default function ClassesListPage() {
  const router = useRouter();
  const { userId, companyName, companyId, loading: authLoading } = useAuth();
  const { setMessage } = useMessage();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Access control: Redirect Admins to home
  useEffect(() => {
    if (!authLoading && userId === 'Admin') {
      router.push('/');
    }
  }, [userId, authLoading, router]);

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof ClassItem>('date');
  const [order, setOrder] = useState<Order>('desc');

  // 1. Initial Load: Fetch companies and determine the target company
  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      setLoadingCompanies(true);
      try {
        const { ok, data } = await apiFetch<any[]>('/api/companies');
        if (ok) {
          setCompanies(data);
          
          // Use the companyId directly from the auth context if it exists
          if (companyId) {
            setSelectedCompanyId(companyId);
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
  }, [authLoading, userId, companyName, companyId]);

  // 2. Fetch classes whenever the selectedCompanyId changes
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    // If it's YYYY-MM-DD, convert to MM/DD/YYYY
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${m}/${d}/${y}`;
    }
    // If it's already MM/DD/YYYY or similar, return as is
    return dateStr;
  };

  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchClasses = async () => {
      setLoading(true);
      try {
        const { ok, data, status } = await apiFetch<any[]>(`/api/companies/${selectedCompanyId}/all-classes`);
        if (ok) {
          // Map the nested API structure to the flat ClassItem interface
          const mappedClasses: ClassItem[] = (data || []).map((item: any) => ({
            id: item.classInfo?.id || item.dateId,
            companyId: selectedCompanyId,
            companyName: companyName || '',
            date: item.dateValue,
            approved: item.classInfo?.approved === true || item.classInfo?.approved === 'Yes' ? 'Yes' : 'No',
            coursetitle: item.classInfo?.coursetitle || 'N/A',
            coursetype: item.classInfo?.coursetype || 'N/A',
            endtime: item.classInfo?.endtime || '',
            instructorname: item.classInfo?.instructorname || 'N/A',
            numberslots: item.classInfo?.numberslots || 0,
            starttime: item.classInfo?.starttime || '',
            dateId: item.dateId,
          }));
          setClasses(mappedClasses);
        } else {
          const errMsg = typeof data === 'string' ? data : JSON.stringify(data);
          throw new Error(`Failed to fetch classes. [Status ${status}] Response: ${errMsg}`);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setMessage('Failed to load classes for the selected company', 'error');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedCompanyId, setMessage]);

  const handleRequestSort = (property: keyof ClassItem) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [classes, order, orderBy]);

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Pfapappbar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
        <Pfapfooter />
      </Box>
    );
  }

  // Access guard: Must be logged in and NOT an Admin
  if (!userId || userId === 'Admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flexGrow: 1, pb: 8 }}>
        <Pfapcontainer maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
                  Date and Time / Slots
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Manage your scheduled classes, view status, and add new sessions.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleRoundedIcon />}
                onClick={() => router.push('/classes/create')}
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
                Add New Class
              </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff', mb: 3, maxWidth: 400 }}>
              <TextField
                label="Hosting Company"
                value={companyName || ''}
                disabled
                fullWidth
                variant="outlined"
                size="small"
                slotProps={{
                  input: {
                    sx: { fontWeight: 600, color: '#333' }
                  }
                }}
              />
            </Paper>
          </Box>


          <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#0074C8' }} />
                  <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading scheduled classes...</Typography>
                </Box>
              ) : classes.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">No classes scheduled yet.</Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, textTransform: 'none' }}
                    onClick={() => router.push('/classes/create')}
                  >
                    Create your first class
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: 'rgba(0, 116, 200, 0.04)' }}>
                      <TableRow>
                        <TableCell sortDirection={orderBy === 'date' ? order : false}>
                          <TableSortLabel
                            active={orderBy === 'date'}
                            direction={orderBy === 'date' ? order : 'asc'}
                            onClick={() => handleRequestSort('date')}
                            sx={{ fontWeight: 700, color: '#00518c' }}
                          >
                            Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#00518c' }}>Times</TableCell>
                        <TableCell sortDirection={orderBy === 'coursetitle' ? order : false}>
                          <TableSortLabel
                            active={orderBy === 'coursetitle'}
                            direction={orderBy === 'coursetitle' ? order : 'asc'}
                            onClick={() => handleRequestSort('coursetitle')}
                            sx={{ fontWeight: 700, color: '#00518c' }}
                          >
                            Course Title
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sortDirection={orderBy === 'approved' ? order : false}>
                          <TableSortLabel
                            active={orderBy === 'approved'}
                            direction={orderBy === 'approved' ? order : 'asc'}
                            onClick={() => handleRequestSort('approved')}
                            sx={{ fontWeight: 700, color: '#00518c' }}
                          >
                            Approved
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#00518c', pr: 4 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedClasses.map((cls, index) => {
                        const isApproved = cls.approved === 'Yes' || cls.approved === true;
                        return (
                          <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#fcfcfc' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{formatDateForDisplay(cls.date)}</TableCell>
                            <TableCell>
                              {`${cls.starttime} - ${cls.endtime}`}
                            </TableCell>
                            <TableCell>{cls.coursetitle}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isApproved ? (
                                  <>
                                    <CheckCircleRoundedIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>Yes</Typography>
                                  </>
                                ) : (
                                  <>
                                    <HourglassEmptyRoundedIcon sx={{ color: '#ed6c02', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ color: '#ed6c02', fontWeight: 600 }}>No</Typography>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 2 }}>
                              <Tooltip title="Update class details">
                                <IconButton
                                  onClick={() => {
                                    const cId = cls.companyId || selectedCompanyId || companyId || '';
                                    router.push(`/classes/create?id=${cls.id || ''}&companyId=${cId}&dateId=${cls.dateId || ''}&dateValue=${cls.date || ''}&slots=${cls.numberslots || 0}`);
                                  }}
                                  sx={{ color: '#0074C8' }}
                                >
                                  <EditRoundedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Manage class slots">
                                <IconButton
                                  onClick={() => {
                                    const cId = cls.companyId || selectedCompanyId || companyId || '';
                                    router.push(`/classes/slots?id=${cls.id || ''}&companyId=${cId}&dateId=${cls.dateId || ''}`);
                                  }}
                                  sx={{ color: '#2e7d32' }}
                                >
                                  <PeopleAltRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Pfapcontainer>
      </Box>
      <Pfapfooter />
    </Box>
  );
}
