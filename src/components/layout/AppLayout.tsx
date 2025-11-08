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
  const [mobileExpanded, _setMobileExpanded] = useState<boolean>(() => {
    const v = localStorage.getItem('nav.mobileExpanded');
    return v === null ? false : v === 'true';
  });
  const handleDrawerToggle = () => setMobileOpen((o) => !o);
  const handleMenuClick = () => {
    if (isOverMd) {
      setDesktopExpanded((v) => !v);
    } else {
      setMobileOpen((o) => !o);
    }
  };
  const isNavigationExpanded = isOverMd ? desktopExpanded : mobileExpanded;
  const sideWidth = useMemo(() => (isNavigationExpanded ? expandedWidth : collapsedWidth), [isNavigationExpanded]);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nav.desktopExpanded', String(desktopExpanded));
  }, [desktopExpanded]);
  useEffect(() => {
    localStorage.setItem('nav.mobileExpanded', String(mobileExpanded));
  }, [mobileExpanded]);

  return (
    <Box ref={layoutRef} sx={{ display: 'flex', position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}>
      <CssBaseline />
      <TopBar onMenuClick={handleMenuClick} sideWidth={sideWidth} />
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
