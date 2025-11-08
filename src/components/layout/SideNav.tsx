import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import TopicIcon from '@mui/icons-material/TopicOutlined';
import { Link as RouterLink, useLocation } from 'react-router-dom';
export const collapsedWidth = 72;
export const expandedWidth = 240;

interface SideNavProps {
  mobileOpen: boolean;
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ mobileOpen, onClose, expanded, onToggleExpand }) => {
  const { pathname } = useLocation();
  const width = expanded ? expandedWidth : collapsedWidth;

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        <ListItemButton component={RouterLink} to="/cluster" selected={pathname.startsWith('/cluster')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemIcon>
            <StorageIcon />
          </ListItemIcon>
          <ListItemText primary="Namespaces" />
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemIcon>
            <TopicIcon />
          </ListItemIcon>
          <ListItemText primary="Topics" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }} aria-label="sidebar navigation">
      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: '#0b2a5b',
            color: '#e3f2fd',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: {
            width,
            boxSizing: 'border-box',
            bgcolor: '#0b2a5b',
            color: '#e3f2fd',
          },
        }}
        open
      >
        <Toolbar sx={{ px: 1, justifyContent: expanded ? 'space-between' : 'center', gap: 1 }}>
          <IconButton size="small" onClick={onToggleExpand} aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'} sx={{ color: 'inherit' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          {expanded && (
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              Danube Admin
            </Typography>
          )}
        </Toolbar>
        <List sx={{
          [`& .MuiListItemButton-root`]: {
            py: 1.5,
            px: expanded ? 1.5 : 1,
            justifyContent: expanded ? 'flex-start' : 'center',
          },
          [`& .MuiListItemIcon-root`]: {
            minWidth: 0,
            justifyContent: 'center',
            color: 'inherit',
          },
          [`& .MuiListItemText-root`]: {
            display: expanded ? 'block' : 'none',
            ml: 1,
          },
        }}>
          <ListItemButton component={RouterLink} to="/cluster" selected={pathname.startsWith('/cluster')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton disabled>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText primary="Namespaces" />
          </ListItemButton>
          <ListItemButton disabled>
            <ListItemIcon>
              <TopicIcon />
            </ListItemIcon>
            <ListItemText primary="Topics" />
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
};
