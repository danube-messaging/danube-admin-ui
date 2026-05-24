import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

export const SkeletonKpis: React.FC = () => {
  return (
    <Grid container spacing={3} mb={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="80%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const SkeletonTable: React.FC<{ rowsCount?: number }> = ({ rowsCount = 5 }) => {
  return (
    <Box>
      <Skeleton variant="rectangular" width="200px" height={32} sx={{ mb: 2 }} />
      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <Box p={2} borderBottom="1px solid" borderColor="divider">
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Box>
          {Array.from({ length: rowsCount }).map((_, idx) => (
            <Box key={idx} p={2} borderBottom={idx === rowsCount - 1 ? 'none' : '1px solid'} borderColor="divider" display="flex" gap={2}>
              <Skeleton variant="rectangular" width="30%" height={24} />
              <Skeleton variant="rectangular" width="20%" height={24} />
              <Skeleton variant="rectangular" width="20%" height={24} />
              <Skeleton variant="rectangular" width="15%" height={24} />
              <Skeleton variant="rectangular" width="15%" height={24} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export const SkeletonClusterPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width="250px" height={48} />
        <Skeleton variant="text" width="180px" height={20} />
      </Box>
      <SkeletonKpis />
      <SkeletonTable rowsCount={6} />
    </Box>
  );
};

export const SkeletonBrokerPage: React.FC = () => {
  return (
    <Box>
      <Box mb={3}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="200px" height={24} />
      </Box>
      <SkeletonKpis />
      <SkeletonTable rowsCount={4} />
    </Box>
  );
};

export const SkeletonNamespacesPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width="200px" height={48} />
        <Skeleton variant="text" width="180px" height={20} />
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={120} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const SkeletonTopicPage: React.FC = () => {
  return (
    <Box>
      <Box mb={3}>
        <Skeleton variant="text" width="350px" height={48} />
      </Box>
      <SkeletonKpis />
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={250} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={250} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
