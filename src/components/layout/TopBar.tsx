import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const TopBar: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          <RouterLink to="/cluster" style={{ textDecoration: 'none', color: 'inherit' }}>
            Danube Admin
          </RouterLink>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
