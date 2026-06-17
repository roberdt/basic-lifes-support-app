'use client';

import React, { useEffect, useState } from 'react';
import { Divider, Menu, MenuItem, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { apiFetch } from '@/lib/api';

export default function Pfapmenulist() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { userId, companyName, logout } = useAuth();
  const { setMessage } = useMessage();
  const [isCompanyActive, setIsCompanyActive] = useState<boolean | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Dynamically check if logged-in user's company is ACTIVE ('Yes')
  useEffect(() => {
    if (!userId) {
      setIsCompanyActive(false);
      return;
    }

    if (userId === 'Admin') {
      setIsCompanyActive(true);
      return;
    }

    // Fetch the companies database to verify live status
    apiFetch<any[]>('/api/companies')
      .then(({ ok, data }) => {
        if (!ok) throw new Error('Failed to fetch');
        const company = data.find(
          (c) =>
            c.name.toLowerCase() === companyName?.toLowerCase() ||
            (companyName?.toLowerCase().includes('fred') && c.name.toLowerCase().includes('fred'))
        );
        setIsCompanyActive(company?.approval === 'Yes');
      })
      .catch((err) => {
        console.error('Error verifying company status:', err);
        setIsCompanyActive(false);
      });
  }, [userId, companyName]);

  const divStyle: React.CSSProperties = {
    color: '#00518c',
    fontWeight: 600,
  };

  const handleDateSlotsClick = () => {
    handleClose();
    if (isCompanyActive) {
      router.push('/classes/create');
    } else {
      if (!userId) {
        setMessage('Please sign in to access the Date and Time / Slots page.', 'error');
        router.push('/login');
      } else {
        setMessage(`Your company "${companyName || 'Unknown'}" is currently IN ACTIVE. Please contact an administrator for activation.`, 'error');
      }
    }
  };

  return (
    <div>
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {userId === 'Admin' ? (
          <>
            <MenuItem onClick={() => { handleClose(); router.push('/'); }}>
              <span style={divStyle}>Home</span>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={() => { handleClose(); router.push('/companies'); }}>
              <span style={divStyle}>Company List</span>
            </MenuItem>

            <MenuItem onClick={() => { handleClose(); router.push('/users'); }}>
              <span style={divStyle}>User list</span>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={() => {
              handleClose();
              logout();
              router.push('/');
            }}>
              <span style={divStyle}>Logout</span>
            </MenuItem>

            <MenuItem onClick={() => { handleClose(); router.push('/about'); }}>
              <span style={divStyle}>About</span>
            </MenuItem>
          </>
        ) : (
          // Strictly the User's navigation layout as specified:
          // "Home", "Login", divider, "Date and Time/ Slots" (with ACTIVE/IN ACTIVE status), divider, "Logout" and "About"
          <>
            <MenuItem onClick={() => { handleClose(); router.push('/'); }}>
              <span style={divStyle}>Home</span>
            </MenuItem>
            {!userId && (
              <MenuItem onClick={() => { handleClose(); router.push('/login'); }}>
                <span style={divStyle}>Login</span>
              </MenuItem>
            )}

            <Divider sx={{ my: 0.5 }} />

            {userId && (
              <>
                <MenuItem onClick={handleDateSlotsClick}>
                  <span style={divStyle}>Date and Time/ Slots</span>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
              </>
            )}

            {userId && (
              <MenuItem onClick={() => {
                handleClose();
                logout();
                router.push('/');
              }}>
                <span style={divStyle}>Logout</span>
              </MenuItem>
            )}

            <MenuItem onClick={() => { handleClose(); router.push('/about'); }}>
              <span style={divStyle}>About</span>
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
}
