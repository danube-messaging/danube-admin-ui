import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../../app/ThemeModeProvider';

interface TopBarProps {
  onMenuClick?: () => void;
  sideWidth: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sideWidth }) => {
  const theme = useTheme();
  const { toggle } = useThemeMode();
  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="transparent"
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        width: { md: `calc(100% - ${sideWidth}px)` },
        ml: { md: `${sideWidth}px` },
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: 'none',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="open navigation"
          sx={{ mr: 1, color: (t) => t.palette.text.primary, '&:hover': { backgroundColor: (t) => t.palette.action.hover }, display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
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

