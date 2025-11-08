import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../../app/themeMode';
import danubeLogo from '../../assets/danube.png';

interface TopBarProps {
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const { toggle } = useThemeMode();
  return (
    <AppBar
      position="absolute"
      elevation={0}
      color="transparent"
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        backgroundColor: (t) => (t.palette.mode === 'dark' ? '#071a36' : '#e2e8f0'),
        color: (t) => (t.palette.mode === 'dark' ? '#e3f2fd' : t.palette.text.primary),
        boxShadow: 'none',
        borderBottom: 'none',
        displayPrint: 'none',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="open navigation"
          sx={{ mr: 1, color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          component="img"
          src={danubeLogo}
          alt="Danube logo"
          sx={{ height: 24, width: 24, mr: 1, borderRadius: '4px' }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Danube Admin
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggle} aria-label="toggle theme mode">
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

