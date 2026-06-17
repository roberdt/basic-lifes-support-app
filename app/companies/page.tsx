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
  Select,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
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
  approval?: 'No' | 'Yes' | 'Expired' | null;
}

export default function CompaniesPage() {
  const { userId, loading } = useAuth();
  const { setMessage } = useMessage();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch companies on mount if user is Admin
  useEffect(() => {
    if (loading || userId !== 'Admin') return;

    setLoadingCompanies(true);
    apiFetch<Company[]>('/api/companies')
      .then(({ ok, data, status }) => {
        if (!ok) {
          const errMsg = (data as any)?.message || `Failed to fetch companies (HTTP ${status})`;
          throw new Error(errMsg);
        }
        setCompanies(data);
      })
      .catch((err) => {
        console.error('Error fetching companies:', err);
        setMessage('Failed to load company records', 'error');
      })
      .finally(() => {
        setLoadingCompanies(false);
      });
  }, [userId, loading, setMessage]);

  // Handle status update
  const handleStatusChange = async (companyId: string, nextStatus: 'No' | 'Yes' | 'Expired') => {
    try {
      const targetCompany = companies.find((c) => c.id === companyId);
      const companyName = targetCompany ? targetCompany.name : 'Company';

      const { ok, data, status } = await apiFetch(`/api/companies/${companyId}/approval`, {
        method: 'PUT',
        body: { approval: nextStatus },
      });

      if (!ok) {
        const errMsg = (data as any)?.message || `Failed to update status (HTTP ${status})`;
        throw new Error(errMsg);
      }

      // Update local state reactive-ly
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, approval: nextStatus } : c))
      );

      // Trigger global top notification toast
      setMessage(`${companyName} record was changed`, 'success');
    } catch (err: any) {
      console.error('Error updating company status:', err);
      setMessage(err.message || 'Failed to update company approval status', 'error');
    }
  };

  // Render Loading Spinner while checking auth state
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

  // Render Access Denied View for unauthorized users
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
              Please log in with the Super User account to manage company records.
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

  // Helper for Status badges (Chip)
  const renderStatusChip = (status?: 'No' | 'Yes' | 'Expired' | null) => {
    switch (status) {
      case 'Yes':
        return (
          <Chip
            label="Yes (ACTIVE)"
            sx={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'No':
        return (
          <Chip
            label="No (NOT ACTIVE)"
            sx={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'Expired':
        return (
          <Chip
            label="Expired (EXPIRED)"
            sx={{
              backgroundColor: '#eceff1',
              color: '#37474f',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      default:
        return (
          <Chip
            label="Pending"
            sx={{
              backgroundColor: '#f5f5f5',
              color: '#616161',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
    }
  };

  // Filter companies by search query
  const filteredCompanies = companies.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.approval || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Pfapappbar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 4 }}>
        <Pfapcontainer maxWidth="lg">
          {/* Page Header */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: '#0074C8', fontWeight: 700, mb: 1 }}>
                Company Approvals
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Review registration requests, track system approvals, and modify active statuses.
              </Typography>
            </Box>
            <Box>
              <TextField
                placeholder="Search companies..."
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
                sx={{ minWidth: 260 }}
              />
            </Box>
          </Box>

          {/* Company List Table Container */}
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
            {loadingCompanies ? (
              <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress sx={{ color: '#0074C8' }} />
              <Typography variant="body2" sx={{ color: '#777777' }}>
                Loading companies...
              </Typography>
            </Box>
          ) : filteredCompanies.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#777777', mb: 1 }}>
                No Companies Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#999999' }}>
                Try searching for a different name, purpose, or status.
              </Typography>
            </Box>
          ) : (
            <Table aria-label="companies approval table">
              <TableHead sx={{ backgroundColor: '#0074C8' }}>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Company Name</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Purpose / Use Case</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '180px' }}>Current Status</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', width: '240px' }}>Approval Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#fcfcfc' },
                      '&:hover': { backgroundColor: 'rgba(0, 116, 200, 0.02)' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Name */}
                    <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                      {company.name}
                    </TableCell>

                    {/* Purpose */}
                    <TableCell sx={{ color: '#555555' }}>
                      {company.purpose}
                    </TableCell>

                    {/* Status Chip */}
                    <TableCell>
                      {renderStatusChip(company.approval)}
                    </TableCell>

                    {/* Action Selector */}
                    <TableCell>
                      <Select
                        value={company.approval || ''}
                        onChange={(e: SelectChangeEvent) =>
                          handleStatusChange(company.id, e.target.value as 'No' | 'Yes' | 'Expired')
                        }
                        size="small"
                        sx={{
                          width: '100%',
                          fontSize: '0.85rem',
                          borderRadius: '6px',
                          color: '#0074C8',
                          fontWeight: 600,
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0074C8',
                            borderWidth: '1.5px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00518c',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00518c',
                          },
                        }}
                      >
                        <MenuItem value="No" sx={{ fontSize: '0.85rem' }}>No (NOT ACTIVE)</MenuItem>
                        <MenuItem value="Yes" sx={{ fontSize: '0.85rem' }}>Yes (ACTIVE)</MenuItem>
                        <MenuItem value="Expired" sx={{ fontSize: '0.85rem' }}>Expired (EXPIRED)</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Pfapcontainer>
      </Box>
      <Pfapfooter />
    </Box>
  );
}
