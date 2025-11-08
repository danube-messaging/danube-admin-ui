import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { SideNav, collapsedWidth, expandedWidth } from './SideNav';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((o) => !o);
  const handleToggleExpand = () => setExpanded((e) => !e);
  const sideWidth = expanded ? expandedWidth : collapsedWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar onMenuClick={handleDrawerToggle} sideWidth={sideWidth} />
      <SideNav mobileOpen={mobileOpen} onClose={handleDrawerToggle} expanded={expanded} onToggleExpand={handleToggleExpand} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sideWidth}px)` },
          ml: { md: `${sideWidth}px` },
          backgroundColor: (t) => t.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
