import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import SpeedIcon from '@mui/icons-material/SpeedOutlined';

export type ReliableMetricsDto = {
  wal_append_total: number;
  wal_append_bytes_total: number;
  wal_fsync_total: number;
  wal_flush_latency_ms_p50: number;
  wal_flush_latency_ms_p95: number;
  wal_flush_latency_ms_p99: number;
  cloud_upload_bytes_total: number;
  cloud_upload_objects_total: number;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TopicReliable: React.FC<{ reliable: ReliableMetricsDto }> = ({ reliable }) => {
  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom mb={2}>
        Reliable Delivery
      </Typography>
      <Grid container spacing={3}>
        {/* WAL & Cloud Storage Operations */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <SaveIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  Storage Operations (WAL & Cloud Backup)
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    WAL Appends
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.wal_append_total}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    WAL Append Size
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {formatBytes(reliable.wal_append_bytes_total)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    WAL fsync Total
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.wal_fsync_total}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Cloud Objects Uploaded
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.cloud_upload_objects_total}
                  </Typography>
                </Box>
                <Box gridColumn="span 2">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Cloud Upload Size
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {formatBytes(reliable.cloud_upload_bytes_total)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Flush Latencies */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <SpeedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  WAL Flush Latency
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    p50 (Median)
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.wal_flush_latency_ms_p50 ? `${reliable.wal_flush_latency_ms_p50.toFixed(2)} ms` : '0.00 ms'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    p95
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.wal_flush_latency_ms_p95 ? `${reliable.wal_flush_latency_ms_p95.toFixed(2)} ms` : '0.00 ms'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    p99
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {reliable.wal_flush_latency_ms_p99 ? `${reliable.wal_flush_latency_ms_p99.toFixed(2)} ms` : '0.00 ms'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
