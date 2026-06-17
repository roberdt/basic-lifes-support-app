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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ClassItem {
  id: string;
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  time: string;
  slots: number;
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
  const { userId } = useAuth();
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const router = useRouter();

  // Fetch classes on mount
  useEffect(() => {
    setLoadingClasses(true);
    apiFetch<ClassItem[]>('/api/classes')
      .then(({ ok, data }) => {
        if (!ok) throw new Error('Failed to fetch classes');
        setClasses(data);
      })
      .catch((err) => {
        console.error('Error fetching classes for calendar:', err);
      })
      .finally(() => {
        setLoadingClasses(false);
      });
  }, []);

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
                            const isInactive = cls.status === 'IN ACTIVE';
                            return (
                              <Paper
                                key={cls.id}
                                elevation={0}
                                sx={{
                                  p: 0.75,
                                  border: '1px solid',
                                  borderColor: isInactive ? '#cfd8dc' : '#c8e6c9',
                                  bgcolor: isInactive ? '#eceff1' : '#e8f5e9',
                                  opacity: isInactive ? 0.75 : 1,
                                  borderRadius: '6px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  transition: 'background-color 0.15s ease, opacity 0.15s ease',
                                  '&:hover': {
                                    bgcolor: isInactive ? '#cfd8dc' : '#c8e6c9',
                                    opacity: 1,
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: isInactive ? '#37474f' : '#1b5e20', fontSize: '0.7rem', lineHeight: 1.2 }}>
                                    {cls.time}
                                  </Typography>
                                  <span style={{
                                    fontSize: '0.58rem',
                                    fontWeight: 800,
                                    color: isInactive ? '#c62828' : '#2e7d32',
                                    backgroundColor: isInactive ? '#ffebee' : '#c8e6c9',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {isInactive ? 'Inactive' : 'Active'}
                                  </span>
                                </Box>
                                <Typography variant="caption" sx={{ color: isInactive ? '#78909c' : '#333333', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, lineHeight: 1.2 }}>
                                  {cls.companyName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: isInactive ? '#90a4ae' : '#555555', fontSize: '0.65rem', fontWeight: 500, lineHeight: 1.1, mt: 0.25 }}>
                                  Seats: <strong>{cls.slots}</strong>
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
      </Pfapcontainer>
      <Pfapfooter />
    </Box>
  );
}