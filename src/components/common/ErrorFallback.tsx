import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ErrorFallbackProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message, onRetry }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={8} px={2} width="100%">
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" mb={2}>
            <WarningAmberIcon color="error" sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h5" component="h2" gutterBottom color="text.primary">
            Failed to Load Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, wordBreak: 'break-word' }}>
            {message || 'An unexpected error occurred while fetching information.'}
          </Typography>
          {onRetry ? (
            <Button variant="contained" color="primary" onClick={onRetry}>
              Try Again
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
