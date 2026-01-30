import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../theme';

export default function Topbar() {
  const { mode, toggle } = useTheme();
  return (
    <AppBar position="static" elevation={0} sx={{ background: 'var(--topbar-bg)', color: 'var(--sidebar-text)', borderBottom: '1px solid #eee' }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <IconButton onClick={toggle} color="inherit">
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
