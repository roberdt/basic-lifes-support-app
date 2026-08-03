'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface ClassItem {
  id: string;
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  approved: 'Yes' | 'No' | boolean;
  coursetitle: string;
  coursetype: 'BLS Provider' | 'Heartsaver CPR' | 'First Aid';
  endtime: string;
  instructorname: string;
  numberslots: number;
  starttime: string;
  
  // Legacy support fallback keys
  time?: string;
  slots?: number;
  status?: 'ACTIVE' | 'IN ACTIVE';
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type EmptyCell = { type: 'empty'; key: string };
type DayCell = { type: 'day'; key: string; day: number; isToday: boolean };
type CalendarCell = EmptyCell | DayCell;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const { userId, companyId, companyName, loading: authLoading } = useAuth();
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const router = useRouter();

  // Interactive modal state for slot details
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 1. Initial Load: Fetch companies and determine the target company
  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      setLoadingCompanies(true);
      try {
        const { ok, data } = await apiFetch<any[]>('/api/companies');
        if (ok) {
          setCompanies(data);
          
          if (companyId) {
            setSelectedCompanyId(companyId);
          } else if (userId === 'Admin' && data.length > 0) {
            setSelectedCompanyId(data[0].id);
          } else if (companyName) {
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
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const { ok, data } = await apiFetch<any[]>(`/api/companies/${selectedCompanyId}/all-classes`);
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
          }));
          setClasses(mappedClasses);
        }
      } catch (err) {
        console.error('Error fetching classes for calendar:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [selectedCompanyId]);

  const yearOptions = useMemo(
    () => Array.from({ length: 101 }, (_, index) => currentYear - 50 + index),
    [currentYear]
  );

  const grid = useMemo(() => {
    const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const cells: CalendarCell[] = [];

    for (let index = 0; index < firstDayOffset; index += 1) {
      cells.push({ type: 'empty', key: `empty-start-${index}` });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        type: 'day',
        key: `day-${day}`,
        day,
        isToday:
          day === today.getDate() &&
          viewMonth === today.getMonth() &&
          viewYear === today.getFullYear(),
      });
    }

    while (cells.length < 42) {
      cells.push({ type: 'empty', key: `empty-end-${cells.length}` });
    }

    return cells;
  }, [today, viewMonth, viewYear]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year: number) => year - 1);
      return;
    }

    setViewMonth((month: number) => month - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year: number) => year + 1);
      return;
    }

    setViewMonth((month: number) => month + 1);
  };

  const onMonthChange = (event: SelectChangeEvent<number>) => {
    setViewMonth(Number(event.target.value));
  };

  const onYearChange = (event: SelectChangeEvent<number>) => {
    setViewYear(Number(event.target.value));
  };

  const jumpToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Pfapappbar />
      <Pfapcontainer maxWidth="xl" sx={{ flex: 1, pb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1500,
            mx: 'auto',
            p: { xs: 1.25, sm: 2.5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 6,
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: 2,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            mt: 2,
          }}
        >
          {/* Header Block */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#0074C8',
                  color: 'primary.contrastText',
                  boxShadow: '0 8px 24px rgba(0, 116, 200, 0.25)',
                }}
              >
                <CalendarMonthRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#00518c' }}>
                  BLS Calendar Planner
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Full-page view of scheduled BLS classes, times, and slots.
                </Typography>
              </Box>
            </Box>

            {/* Company Selector for Admins */}
            <Box sx={{ minWidth: 260, display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="company-select-label">Company View</InputLabel>
                <Select
                  labelId="company-select-label"
                  value={selectedCompanyId}
                  label="Company View"
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  disabled={userId !== 'Admin' || loadingCompanies}
                  sx={{ 
                    bgcolor: '#ffffff', 
                    borderRadius: 2,
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

            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<TodayRoundedIcon />}
                onClick={jumpToToday}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Today
              </Button>
              {userId && userId !== 'Admin' && (
                <Button
                  variant="contained"
                  startIcon={<AddCircleRoundedIcon />}
                  onClick={() => router.push('/classes/create')}
                  sx={{
                    backgroundColor: '#0074C8',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#00518c' },
                  }}
                >
                  Schedule Class Slots
                </Button>
              )}
            </Box>
          </Box>

          {/* Month/Year Controller */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 1.5,
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', lg: 'center' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Button variant="contained" size="small" onClick={goPrevMonth} startIcon={<ChevronLeftRoundedIcon />} sx={{ textTransform: 'none', backgroundColor: '#0074C8', '&:hover': { backgroundColor: '#00518c' } }}>
                  Previous
                </Button>
                <Button variant="contained" size="small" onClick={goNextMonth} endIcon={<ChevronRightRoundedIcon />} sx={{ textTransform: 'none', backgroundColor: '#0074C8', '&:hover': { backgroundColor: '#00518c' } }}>
                  Next
                </Button>
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, textAlign: 'center', color: '#00518c' }}
              >
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="month-label">Month</InputLabel>
                  <Select labelId="month-label" label="Month" value={viewMonth} onChange={onMonthChange}>
                    {MONTH_NAMES.map((monthName, index) => (
                      <MenuItem value={index} key={monthName}>
                        {monthName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select labelId="year-label" label="Year" value={viewYear} onChange={onYearChange}>
                    {yearOptions.map((year) => (
                      <MenuItem value={year} key={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Grid Layout */}
          <Box
            sx={{
              minHeight: 0,
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: 1.5,
            }}
          >
            {/* Weekdays Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 1.25,
              }}
            >
              {WEEKDAYS.map((weekday) => (
                <Paper
                  key={weekday}
                  elevation={0}
                  sx={{
                    py: 1,
                    textAlign: 'center',
                    borderRadius: '8px',
                    bgcolor: '#0074C8',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: { xs: '0.72rem', sm: '0.85rem' },
                  }}
                >
                  {weekday}
                </Paper>
              ))}
            </Box>

            {/* Days Grid */}
            {loadingClasses ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 20, gap: 2 }}>
                <CircularProgress sx={{ color: '#0074C8' }} />
                <Typography variant="body2" color="text.secondary">
                  Fetching scheduled classes...
                </Typography>
              </Box>
            ) : (
              <Box
                aria-label="Monthly calendar"
                sx={{
                  minHeight: 480,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
                  gap: 1.25,
                }}
              >
                {grid.map((cell) => {
                  if (cell.type === 'empty') {
                    return (
                      <Paper
                        key={cell.key}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: '1px dashed',
                          borderColor: 'divider',
                          bgcolor: 'rgba(0, 116, 200, 0.01)',
                        }}
                      />
                    );
                  }

                  // Format current cell's date for string matching
                  const cellDateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                  const dayClasses = classes.filter((c) => c.date === cellDateString);

                  return (
                    <Paper
                      key={cell.key}
                      elevation={0}
                      sx={{
                        p: 1,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: cell.isToday ? '#0074C8' : 'divider',
                        boxShadow: cell.isToday ? 'inset 0 0 0 1.5px rgba(0, 116, 200, 0.2)' : 'none',
                        display: 'grid',
                        gridTemplateRows: 'auto 1fr',
                        gap: 1,
                        minHeight: 110,
                        bgcolor: cell.isToday ? '#f0f7ff' : '#ffffff',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                          borderColor: '#0074C8',
                        }
                      }}
                    >
                      {/* Day Number and Today Badge */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cell.isToday ? '#0074C8' : '#333333' }}>
                          {cell.day}
                        </Typography>
                        {cell.isToday ? (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 999,
                              bgcolor: '#0074C8',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              lineHeight: 1.2,
                            }}
                          >
                            Today
                          </Box>
                        ) : null}
                      </Box>

                      {/* Day Offerings / Classes */}
                      <Box
                        sx={{
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.75,
                          overflowY: 'auto',
                          maxHeight: '110px',
                          width: '100%',
                        }}
                      >
                        {dayClasses.length === 0 ? (
                          <Box
                            sx={{
                              height: '100%',
                              minHeight: 35,
                              borderRadius: 2,
                              border: '1px dashed',
                              borderColor: 'divider',
                              bgcolor: 'rgba(0, 116, 200, 0.01)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
                              Empty
                            </Typography>
                          </Box>
                        ) : (
                          dayClasses.map((cls) => {
                            // Defensive fallbacks to ensure compatibility with any older DB entries
                            const startTime = cls.starttime || (cls.time ? cls.time.split(' - ')[0] : 'N/A');
                            const endTime = cls.endtime || (cls.time ? cls.time.split(' - ')[1] : '');
                            const courseType = cls.coursetype || 'BLS Provider';
                            const numSeats = cls.numberslots !== undefined ? cls.numberslots : (cls.slots !== undefined ? cls.slots : 0);
                            
                            // Map approved status with status fallback
                            const isApproved = cls.approved === 'Yes' || cls.approved === true || cls.status === 'ACTIVE';
                            
                            return (
                              <Paper
                                key={cls.id}
                                elevation={0}
                                onClick={() => {
                                  setSelectedClass(cls);
                                  setDetailsOpen(true);
                                }}
                                sx={{
                                  p: 0.75,
                                  border: '1px solid',
                                  borderColor: !isApproved ? '#ffcc80' : '#c8e6c9',
                                  bgcolor: !isApproved ? '#fff8e1' : '#e8f5e9',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                  '&:hover': {
                                    bgcolor: !isApproved ? '#ffe082' : '#c8e6c9',
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: !isApproved ? '#b77100' : '#1b5e20', fontSize: '0.68rem', lineHeight: 1.2 }}>
                                    {startTime}{endTime ? ` - ${endTime}` : ''}
                                  </Typography>
                                  <span style={{
                                    fontSize: '0.52rem',
                                    fontWeight: 900,
                                    color: !isApproved ? '#b77100' : '#2e7d32',
                                    backgroundColor: !isApproved ? '#fff3e0' : '#c8e6c9',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    textTransform: 'uppercase',
                                    border: `1px solid ${!isApproved ? '#ffe0b2' : '#a5d6a7'}`
                                  }}>
                                    {!isApproved ? 'Pending' : 'Approved'}
                                  </span>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#222222', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800, lineHeight: 1.2 }}>
                                  {courseType}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#555555', fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, lineHeight: 1.1 }}>
                                  {cls.companyName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#555555', fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, mt: 0.25 }}>
                                  Seats: <strong>{numSeats}</strong>
                                </Typography>
                              </Paper>
                            );
                          })
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Class Details Modal Dialog */}
        {selectedClass && (
          <Dialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '16px',
                  p: 1,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                }
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, color: '#00518c', fontWeight: 800 }}>
              <SchoolRoundedIcon sx={{ color: '#0074C8', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h6" component="span" sx={{ fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
                  {selectedClass.coursetitle || 'Basic Life Support (BLS)'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {selectedClass.coursetype || 'BLS Provider'}
                </Typography>
              </Box>
            </DialogTitle>
            
            <Divider sx={{ mx: 3, my: 0.5 }} />

            <DialogContent sx={{ py: 2 }}>
              <Stack spacing={2.5}>
                {/* Approval Status Alert/Banner */}
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' ? '#e8f5e9' : '#fff3e0',
                    border: '1px solid',
                    borderColor: selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' ? '#c8e6c9' : '#ffe0b2',
                  }}
                >
                  {selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' ? (
                    <CheckCircleRoundedIcon sx={{ color: '#2e7d32' }} />
                  ) : (
                    <HourglassEmptyRoundedIcon sx={{ color: '#ef6c00' }} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' ? '#1b5e20' : '#e65100' }}>
                      {selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' ? 'Approved Class Slot' : 'Pending Administrative Approval'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedClass.approved === 'Yes' || selectedClass.status === 'ACTIVE' 
                        ? 'This class is approved, active, and open for candidate bookings.' 
                        : 'This class has been submitted and is currently awaiting admin verification.'}
                    </Typography>
                  </Box>
                </Box>

                {/* Grid details */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                    mt: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <WorkRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Hosting Company
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333333' }}>
                        {selectedClass.companyName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <PersonRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Class Instructor
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333333' }}>
                        {selectedClass.instructorname || 'To Be Assigned'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CalendarMonthRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Class Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333333' }}>
                        {(() => {
                          try {
                            const d = new Date(selectedClass.date + 'T12:00:00');
                            return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          } catch {
                            return selectedClass.date;
                          }
                        })()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <AccessTimeRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Time Duration
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333333' }}>
                        {selectedClass.starttime || selectedClass.time?.split(' - ')[0] || 'N/A'} - {selectedClass.endtime || selectedClass.time?.split(' - ')[1] || ''}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <GroupRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Available Seats
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333333' }}>
                        {selectedClass.numberslots !== undefined ? selectedClass.numberslots : selectedClass.slots} Seats
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <InfoRoundedIcon sx={{ color: '#0074C8', mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        Class Slot ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555555' }}>
                        {selectedClass.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
              <Button
                onClick={() => setDetailsOpen(false)}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#0074C8',
                  px: 3.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#00518c' }
                }}
              >
                Close Details
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Pfapcontainer>
      <Pfapfooter />
    </Box>
  );
}