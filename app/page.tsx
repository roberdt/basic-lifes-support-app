'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  People as PeopleIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as NotificationsActiveIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';

// Define core interfaces
interface ClassItem {
  id: string;
  name: string;
  date: string;
  instructor: string;
  registered: number;
  capacity: number;
  type: 'BLS Provider' | 'Heartsaver CPR' | 'First Aid';
}

interface ActivityLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export default function HomePage() {
  // Pre-populated high-fidelity mock classes
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: 'cls-1',
      name: 'BLS Provider Certification Course',
      date: 'June 20, 2026 - 09:00 AM',
      instructor: 'Dr. Sarah Connor, MD',
      registered: 11,
      capacity: 15,
      type: 'BLS Provider',
    },
    {
      id: 'cls-2',
      name: 'Heartsaver CPR/AED Adult & Pediatric',
      date: 'June 22, 2026 - 01:00 PM',
      instructor: 'Marcus Wright, EMT-P',
      registered: 8,
      capacity: 10,
      type: 'Heartsaver CPR',
    },
    {
      id: 'cls-3',
      name: 'First Aid Refresher & Basic Life Support',
      date: 'June 25, 2026 - 10:00 AM',
      instructor: 'Ellen Ripley, RN',
      registered: 12,
      capacity: 12,
      type: 'First Aid',
    },
  ]);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 'act-1', time: '10 mins ago', message: 'Dr. Sarah Connor approved 3 pending certificates.', type: 'success' },
    { id: 'act-2', time: '1 hour ago', message: 'John Doe registered for Class #cls-2.', type: 'info' },
    { id: 'act-3', time: '4 hours ago', message: 'First Aid Refresher (Class #cls-3) reached max capacity.', type: 'warning' },
  ]);

  // Dialog & Notification States
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Registration Form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassType, setNewClassType] = useState<'BLS Provider' | 'Heartsaver CPR' | 'First Aid'>('BLS Provider');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassInstructor, setNewClassInstructor] = useState('');
  const [newClassCapacity, setNewClassCapacity] = useState(15);

  // Snackbar feedback states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' });

  // Dynamically calculated stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.registered, 0);
  const averageFillRate = Math.round(
    (classes.reduce((sum, cls) => sum + cls.registered, 0) /
      classes.reduce((sum, cls) => sum + cls.capacity, 0)) *
      100
  );

  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle scheduling new class
  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassDate || !newClassInstructor) {
      showNotification('Please fill out all fields.', 'warning');
      return;
    }

    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      name: newClassName,
      date: newClassDate,
      instructor: newClassInstructor,
      registered: 0,
      capacity: Number(newClassCapacity),
      type: newClassType,
    };

    setClasses([newClass, ...classes]);
    setActivityLogs([
      {
        id: `act-${Date.now()}`,
        time: 'Just now',
        message: `New class "${newClassName}" was successfully scheduled.`,
        type: 'success',
      },
      ...activityLogs,
    ]);

    // Reset Form & Close
    setIsClassDialogOpen(false);
    setNewClassName('');
    setNewClassDate('');
    setNewClassInstructor('');
    setNewClassCapacity(15);
    showNotification('New BLS training class scheduled successfully!');
  };

  // Open register modal
  const openRegisterModal = (classId: string) => {
    setSelectedClassId(classId);
    setIsRegisterDialogOpen(true);
  };

  // Handle registering student
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) {
      showNotification('Please fill out both name and email.', 'warning');
      return;
    }

    setClasses(
      classes.map((cls) => {
        if (cls.id === selectedClassId) {
          return { ...cls, registered: Math.min(cls.registered + 1, cls.capacity) };
        }
        return cls;
      })
    );

    const targetClass = classes.find((cls) => cls.id === selectedClassId);
    if (targetClass) {
      setActivityLogs([
        {
          id: `act-${Date.now()}`,
          time: 'Just now',
          message: `${studentName} registered for "${targetClass.name}".`,
          type: 'info',
        },
        ...activityLogs,
      ]);
    }

    setIsRegisterDialogOpen(false);
    setStudentName('');
    setStudentEmail('');
    showNotification(`Successfully registered ${studentName} for the class!`);
  };

  // Helper to choose tag chip colors
  const getChipColor = (type: string) => {
    switch (type) {
      case 'BLS Provider':
        return 'primary';
      case 'Heartsaver CPR':
        return 'secondary';
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <Pfapappbar />
      <Pfapcontainer maxWidth="lg">
        {/* Main Dashboard Title Header */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#00518c', mb: 1 }}>
              Welcome to BLS Training Scheduler (Under Construction)
            </Typography>
            <Typography variant="body1" sx={{ color: '#546e7a' }}>
              Simulated School Administrator Portal — Mock Interface & Live State Demo
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsClassDialogOpen(true)}
            sx={{
              backgroundColor: '#00518c',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: '24px',
              boxShadow: '0 4px 14px rgba(0, 81, 140, 0.4)',
              '&:hover': {
                backgroundColor: '#003c66',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
              },
            }}
          >
            Schedule a Class
          </Button>
        </Box>

        {/* Top KPI Metrics Row using CSS Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 5,
          }}
        >
          {/* Card 1: Active Classes */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#78909c', fontWeight: 600, textTransform: 'uppercase' }}>
                  Active Classes
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#263238', mt: 1 }}>
                  {totalClasses}
                </Typography>
              </Box>
              <Avatar sx={{ backgroundColor: 'rgba(0, 81, 140, 0.1)', color: '#00518c', width: 56, height: 56 }}>
                <CalendarMonthIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>

          {/* Card 2: Total Registered */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#78909c', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Registered
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#263238', mt: 1 }}>
                  {totalStudents}
                </Typography>
              </Box>
              <Avatar sx={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0', width: 56, height: 56 }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>

          {/* Card 3: Class Fill Rate */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#78909c', fontWeight: 600, textTransform: 'uppercase' }}>
                  Average Fill Rate
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#263238', mt: 1 }}>
                  {averageFillRate}%
                </Typography>
              </Box>
              <Avatar sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', width: 56, height: 56 }}>
                <TrendingUpIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>

          {/* Card 4: Active Instructors */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#78909c', fontWeight: 600, textTransform: 'uppercase' }}>
                  Certified Instructors
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#263238', mt: 1 }}>
                  6
                </Typography>
              </Box>
              <Avatar sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', width: 56, height: 56 }}>
                <SchoolIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content Area using CSS Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 4,
          }}
        >
          {/* Left Column: Scheduled Classes list */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                📅 Scheduled BLS & CPR Classes
              </Typography>
              <Chip label="Real-time Interactive Demo" variant="outlined" size="small" color="primary" sx={{ fontWeight: 600 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {classes.map((cls) => {
                const occupancyRate = Math.round((cls.registered / cls.capacity) * 100);
                const isFull = cls.registered >= cls.capacity;

                return (
                  <Card key={cls.id} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                        <Box>
                          <Chip
                            label={cls.type}
                            size="small"
                            color={getChipColor(cls.type)}
                            sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem', mb: 1 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {cls.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                            👤 Instructor: <strong>{cls.instructor}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            🕒 Time: <strong>{cls.date}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isFull ? '#ef4444' : '#00518c' }}>
                            {cls.registered} / {cls.capacity} Enrolled
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            ({occupancyRate}% Full)
                          </Typography>
                        </Box>
                      </Box>

                      {/* Occupancy Progress Bar */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={occupancyRate}
                            color={isFull ? 'error' : occupancyRate > 80 ? 'warning' : 'primary'}
                            sx={{ height: 8, borderRadius: '4px', backgroundColor: '#e2e8f0' }}
                          />
                        </Box>
                      </Box>

                      {/* Card Action Buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openRegisterModal(cls.id)}
                          disabled={isFull}
                          startIcon={isFull ? <CheckCircleIcon /> : <AddIcon />}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            '&:hover': {
                              borderColor: '#00518c',
                              color: '#00518c',
                              backgroundColor: 'rgba(0, 81, 140, 0.04)',
                            },
                          }}
                        >
                          {isFull ? 'Class Full' : 'Register Student'}
                        </Button>
                        <Tooltip title="Real-time backend API configuration panel is currently simulated">
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                              fontWeight: 600,
                              backgroundColor: '#00518c',
                              '&:hover': { backgroundColor: '#003c66' },
                            }}
                          >
                            Manage Class
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>

          {/* Right Column: Activity Stream & Quick Help */}
          <Box>
            {/* Quick Actions Card */}
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                  🛠️ School Administrator Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setIsClassDialogOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: '10px', py: 1, fontWeight: 600 }}
                  >
                    Schedule Class
                  </Button>
                  <Tooltip title="This will trigger a bulk download simulation">
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      onClick={() => showNotification('Downloaded scheduled classes backup (Simulated PDF format).', 'info')}
                      sx={{ textTransform: 'none', borderRadius: '10px', py: 1, fontWeight: 600 }}
                    >
                      Export PDF Schedule
                    </Button>
                  </Tooltip>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    onClick={() => showNotification('Instructors notifications successfully dispatched via email simulation.', 'success')}
                    sx={{ textTransform: 'none', borderRadius: '10px', py: 1, fontWeight: 600 }}
                  >
                    Notify Instructors
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Simulated Live Activity Feed */}
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsActiveIcon color="primary" /> Recent Activities
                  </Typography>
                  <Chip label="Live Feed" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                </Box>

                <List sx={{ p: 0 }}>
                  {activityLogs.map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <Avatar sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: log.type === 'success' ? '#e8f5e9' : log.type === 'warning' ? '#fff3e0' : '#e3f2fd',
                            color: log.type === 'success' ? '#2e7d32' : log.type === 'warning' ? '#ed6c02' : '#1976d2'
                          }}>
                            {log.type === 'success' ? (
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            ) : log.type === 'warning' ? (
                              <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <SchoolIcon sx={{ fontSize: 16 }} />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={log.message}
                          secondary={log.time}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: '#334155' }}
                          secondaryTypographyProps={{ variant: 'caption', color: '#94a3b8' }}
                        />
                      </ListItem>
                      {index < activityLogs.length - 1 && <Divider component="li" variant="inset" sx={{ ml: 4, borderColor: '#f1f5f9' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Under Construction Notice Banner */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            backgroundColor: 'rgba(255, 152, 0, 0.08)',
            border: '1.5px dashed #ff9800',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar sx={{ backgroundColor: '#ff9800', color: '#ffffff' }}>🚧</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#e65100', fontWeight: 700 }}>
              Under Construction: BLS Scheduler is being finalized
            </Typography>
            <Typography variant="body2" sx={{ color: '#b78103' }}>
              The interactive widgets on this page are fully dynamic locally to show state progression. When the Java Tomcat backend API endpoints are online, these controls will seamlessly link to databases.
            </Typography>
          </Box>
        </Box>
      </Pfapcontainer>

      {/* DIALOG 1: Create a Training Class Modal */}
      <Dialog open={isClassDialogOpen} onClose={() => setIsClassDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleScheduleClass}>
          <DialogTitle sx={{ fontWeight: 800, color: '#00518c', pb: 1 }}>
            📅 Schedule a New BLS/CPR Class
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 1,
              }}
            >
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                <TextField
                  fullWidth
                  label="Course Title"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. BLS Provider Re-Certification"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Course Type</InputLabel>
                  <Select
                    value={newClassType}
                    label="Course Type"
                    onChange={(e) => setNewClassType(e.target.value as any)}
                  >
                    <MenuItem value="BLS Provider">BLS Provider</MenuItem>
                    <MenuItem value="Heartsaver CPR">Heartsaver CPR</MenuItem>
                    <MenuItem value="First Aid">First Aid</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Class Date & Time"
                  required
                  value={newClassDate}
                  onChange={(e) => setNewClassDate(e.target.value)}
                  placeholder="e.g. June 28, 2026 - 09:00 AM"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Instructor Name"
                  required
                  value={newClassInstructor}
                  onChange={(e) => setNewClassInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jane Foster, PhD"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Max Capacity"
                  type="number"
                  required
                  value={newClassCapacity}
                  onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                  slotProps={{
                    htmlInput: { min: 1, max: 50 }
                  }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setIsClassDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#00518c', '&:hover': { backgroundColor: '#003c66' }, textTransform: 'none', fontWeight: 600 }}
            >
              Schedule Class
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG 2: Quick Student Registration Modal */}
      <Dialog open={isRegisterDialogOpen} onClose={() => setIsRegisterDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleRegisterStudent}>
          <DialogTitle sx={{ fontWeight: 800, color: '#00518c', pb: 1 }}>
            👤 Register Student to Class
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Add a student to the selected training class. This will increment the registered capacity counter instantly.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Student Full Name"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ellen Ripley"
                variant="outlined"
                size="small"
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. eripley@weyland.org"
                variant="outlined"
                size="small"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setIsRegisterDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#00518c', '&:hover': { backgroundColor: '#003c66' }, textTransform: 'none', fontWeight: 600 }}
            >
              Confirm Registration
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar feedback notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Pfapfooter />
    </Box>
  );
}
