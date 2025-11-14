import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import TopicIcon from '@mui/icons-material/TopicOutlined';
import { Link as RouterLink, useLocation } from 'react-router-dom';
export const collapsedWidth = 104;
export const expandedWidth = 240;

interface SideNavProps {
  mobileOpen: boolean;
  onClose: () => void;
  expanded: boolean;
  container?: HTMLElement | undefined;
}

export const SideNav: React.FC<SideNavProps> = ({ mobileOpen, onClose, expanded, container }) => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const width = expanded ? expandedWidth : collapsedWidth;
  const mini = !expanded;

  const [isFullyExpanded, setIsFullyExpanded] = useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(!expanded);

  useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);
      return () => clearTimeout(timeout);
    }
    setIsFullyExpanded(false);
  }, [expanded, theme.transitions.duration.enteringScreen]);

  useEffect(() => {
    if (!expanded) {
      const timeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);
      return () => clearTimeout(timeout);
    }
    setIsFullyCollapsed(false);
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        <ListItemButton component={RouterLink} to="/cluster" selected={pathname.startsWith('/cluster')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Cluster" />
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
        container={container}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            color: 'text.primary',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.standard }),
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
            bgcolor: 'background.default',
            color: 'text.primary',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.standard }),
          },
        }}
        open
      >
        <Toolbar />
        <List sx={{
          p: mini ? 0 : 0.5,
        }}>
          <ListItemButton
            component={RouterLink}
            to="/cluster"
            selected={pathname.startsWith('/cluster')}
            sx={{
              height: mini ? 50 : 'auto',
              py: mini ? 0 : 1.5,
              px: 1,
              position: 'relative',
              borderRadius: 1,
              transition: (t) => t.transitions.create(['height', 'padding'], { duration: t.transitions.duration.shorter }),
              '&:hover': {
                backgroundColor: 'action.hover'
              },
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                color: 'primary.main'
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'action.selected'
              },
              '&.Mui-selected::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 6,
                bottom: 6,
                width: 3,
                bgcolor: 'primary.main',
                borderRadius: 1,
              },
            }}
          >
            <Box sx={mini ? {
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 6px)',
              transform: 'translate(-50%, -50%)',
            } : {}}>
              <ListItemIcon sx={{
                minWidth: 0,
                justifyContent: mini ? 'center' : 'flex-start',
                color: 'inherit',
                mr: mini ? 0 : 1.5,
              }}>
                <DashboardIcon />
              </ListItemIcon>
              {mini && isFullyCollapsed ? (
                <Typography variant="caption" sx={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: collapsedWidth - 28,
                }}>
                  Cluster
                </Typography>
              ) : null}
            </Box>
            {!mini && isFullyExpanded ? (
              <ListItemText primary="Cluster" sx={{ whiteSpace: 'nowrap', zIndex: 1 }} />
            ) : null}
          </ListItemButton>
          <ListItemButton
            disabled
            sx={{
              height: mini ? 50 : 'auto',
              py: mini ? 0 : 1.5,
              px: 1,
              position: 'relative',
              borderRadius: 1,
              transition: (t) => t.transitions.create(['height', 'padding'], { duration: t.transitions.duration.shorter }),
            }}
          >
            <Box sx={mini ? {
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 6px)',
              transform: 'translate(-50%, -50%)',
            } : {}}>
              <ListItemIcon sx={{
                minWidth: 0,
                justifyContent: mini ? 'center' : 'flex-start',
                color: 'inherit',
                mr: mini ? 0 : 1.5,
              }}>
                <StorageIcon />
              </ListItemIcon>
              {mini && isFullyCollapsed ? (
                <Typography variant="caption" sx={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: collapsedWidth - 28,
                }}>
                  Namespaces
                </Typography>
              ) : null}
            </Box>
            {!mini && isFullyExpanded ? (
              <ListItemText primary="Namespaces" sx={{ whiteSpace: 'nowrap', zIndex: 1 }} />
            ) : null}
          </ListItemButton>
          <ListItemButton
            disabled
            sx={{
              height: mini ? 50 : 'auto',
              py: mini ? 0 : 1.5,
              px: 1,
              position: 'relative',
              borderRadius: 1,
              transition: (t) => t.transitions.create(['height', 'padding'], { duration: t.transitions.duration.shorter }),
            }}
          >
            <Box sx={mini ? {
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 6px)',
              transform: 'translate(-50%, -50%)',
            } : {}}>
              <ListItemIcon sx={{
                minWidth: 0,
                justifyContent: mini ? 'center' : 'flex-start',
                color: 'inherit',
                mr: mini ? 0 : 1.5,
              }}>
                <TopicIcon />
              </ListItemIcon>
              {mini && isFullyCollapsed ? (
                <Typography variant="caption" sx={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: collapsedWidth - 28,
                }}>
                  Topics
                </Typography>
              ) : null}
            </Box>
            {!mini && isFullyExpanded ? (
              <ListItemText primary="Topics" sx={{ whiteSpace: 'nowrap', zIndex: 1 }} />
            ) : null}
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
};
