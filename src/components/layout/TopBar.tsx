import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeMode } from '../../app/themeMode';
import danubeLogo from '../../assets/danube.png';

interface TopBarProps {
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { mode, setMode } = useThemeMode();
  
  // Resolve the actual display mode (system -> light/dark)
  const resolvedMode = React.useMemo(() => {
    if (mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return mode;
  }, [mode]);
  
  // Toggle directly between light and dark (not cycling through system)
  const handleToggle = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
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
        <Tooltip title={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={handleToggle} aria-label="toggle theme mode">
            {resolvedMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

