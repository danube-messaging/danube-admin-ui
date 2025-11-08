import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {icon}
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5">{value}</Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
