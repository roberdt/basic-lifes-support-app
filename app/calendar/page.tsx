'use client';

import { useMemo, useState } from 'react';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';

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
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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
    <Box>
      <Pfapappbar />
      <Pfapcontainer maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1500,
            mx: 'auto',
            p: { xs: 1.25, sm: 2 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 6,
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: 1.5,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
                <br />
                <br />
                <br />
                <br />
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: '0 14px 30px rgba(21, 101, 255, 0.25)',
                }}
              >

                  <CalendarMonthRoundedIcon />

              </Box>
              <Box>
                <Typography variant="h4">BLS Calendar Planner</Typography>
                <Typography variant="body1" color="text.secondary">
                  Full-page month view with room inside each day for your notes, tasks, or patient info.
                </Typography>
              </Box>
            </Box>
              <br />
              <br />
              <br />
              <br />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<TodayRoundedIcon />}
              onClick={jumpToToday}
            >
              Today
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 1.25,
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', lg: 'center' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Button variant="contained" onClick={goPrevMonth} startIcon={<ChevronLeftRoundedIcon />}>
                  Previous
                </Button>
                <Button variant="contained" onClick={goNextMonth} endIcon={<ChevronRightRoundedIcon />}>
                  Next
                </Button>
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, textAlign: 'center', color: 'primary.dark' }}
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

          <Box
            sx={{
              minHeight: 0,
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {WEEKDAYS.map((weekday) => (
                <Paper
                  key={weekday}
                  elevation={0}
                  sx={{
                    py: 1,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 800,
                    fontSize: { xs: '0.72rem', sm: '0.9rem' },
                  }}
                >
                  {weekday}
                </Paper>
              ))}
            </Box>

            <Box
              aria-label="Monthly calendar"
              sx={{
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
                gap: 1,
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
                        bgcolor: 'rgba(21, 101, 255, 0.02)',
                      }}
                    />
                  );
                }

                return (
                  <Paper
                    key={cell.key}
                    elevation={0}
                    sx={{
                      p: { xs: 0.75, md: 1 },
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: cell.isToday ? 'primary.main' : 'divider',
                      boxShadow: cell.isToday ? 'inset 0 0 0 1px rgba(21, 101, 255, 0.35)' : 'none',
                      display: 'grid',
                      gridTemplateRows: 'auto 1fr',
                      gap: 0.75,
                      minHeight: 0,
                      bgcolor: cell.isToday ? 'rgba(21, 101, 255, 0.06)' : 'background.paper',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {cell.day}
                      </Typography>
                      {cell.isToday ? (
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 999,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            lineHeight: 1.4,
                          }}
                        >
                          Today
                        </Box>
                      ) : null}
                    </Box>

                    <Box
                      sx={{
                        minHeight: 0,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'primary.light',
                        bgcolor: 'rgba(0, 81, 140, 0.04)',
                        px: { xs: 0.5, sm: 0.75 },
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.68rem', sm: '0.75rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        Add info here
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Pfapcontainer>
      <Pfapfooter />
    </Box>
  );
}