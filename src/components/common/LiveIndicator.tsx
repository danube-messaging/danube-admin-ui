import React from 'react';
import { Box, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

export const LiveIndicator: React.FC = () => {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().getAll();
  // If there's at least one query in the cache and it ended in an error state
  const hasError = queries.length > 0 && queries.some((q) => q.state.status === 'error');

  const status: 'disconnected' | 'live' = hasError ? 'disconnected' : 'live';

  const getStatusColor = () => {
    return status === 'disconnected' ? 'error.main' : 'success.main';
  };

  const getStatusText = () => {
    return status === 'disconnected' ? 'Disconnected' : 'Live';
  };

  return (
    <Box display="flex" alignItems="center" gap={1.2}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: getStatusColor(),
          boxShadow: (theme) => {
            const color = getStatusColor();
            const resolvedColor =
              color === 'error.main'
                ? theme.palette.error.main
                : theme.palette.success.main;
            return `0 0 8px ${resolvedColor}`;
          },
          animation: 'pulse-glow 2s infinite ease-in-out',
          '@keyframes pulse-glow': {
            '0%': {
              transform: 'scale(0.95)',
              opacity: 0.7,
            },
            '50%': {
              transform: 'scale(1.1)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(0.95)',
              opacity: 0.7,
            },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {getStatusText()}
      </Typography>
    </Box>
  );
};
