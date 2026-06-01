'use client';

import React from 'react';
import { Divider, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';

export default function Pfapmenulist() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const divStyle: React.CSSProperties = {
    color: '#00518c',
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
        <MenuItem onClick={() => { handleClose(); router.push('/'); }}>
          <span style={divStyle}>Home</span>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); router.push('/calendar'); }}>
          <span style={divStyle}>Calendar</span>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); router.push('/login'); }}>
          <span style={divStyle}>Login</span>
        </MenuItem>

        {/* horizontal separator between groups */}
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => { handleClose(); router.push('/about'); }}>
          <span style={divStyle}>About</span>
        </MenuItem>
      </Menu>
    </div>
  );
}

