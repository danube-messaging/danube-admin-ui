import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { SideNav, collapsedWidth, expandedWidth } from './SideNav';

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isOverMd = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState<boolean>(() => {
    const v = localStorage.getItem('nav.desktopExpanded');
    return v === null ? true : v === 'true';
  });
  const handleDrawerToggle = () => setMobileOpen((prev: boolean) => !prev);
  const handleMenuClick = () => {
    if (isOverMd) {
      setDesktopExpanded((prev: boolean) => !prev);
    } else {
      setMobileOpen((prev: boolean) => !prev);
    }
  };
  const isNavigationExpanded = isOverMd ? desktopExpanded : true;
  const sideWidth = useMemo(() => (isNavigationExpanded ? expandedWidth : collapsedWidth), [isNavigationExpanded]);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nav.desktopExpanded', String(desktopExpanded));
  }, [desktopExpanded]);

  return (
    <Box ref={layoutRef} sx={{ display: 'flex', position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}>
      <CssBaseline />
      <TopBar onMenuClick={handleMenuClick} />
      <SideNav
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        expanded={isNavigationExpanded}
        container={layoutRef.current ?? undefined}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
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
