import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { KpiCard } from '../../components/common/KpiCard';

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

export const TopicReliable: React.FC<{ reliable: ReliableMetricsDto }>
  = ({ reliable }) => {
  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Reliable Delivery
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL Appends" value={reliable.wal_append_total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL Append Bytes" value={reliable.wal_append_bytes_total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL fsync Total" value={reliable.wal_fsync_total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Cloud Upload Bytes" value={reliable.cloud_upload_bytes_total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Cloud Upload Objects" value={reliable.cloud_upload_objects_total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL Flush p50 (ms)" value={reliable.wal_flush_latency_ms_p50.toFixed(3)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL Flush p95 (ms)" value={reliable.wal_flush_latency_ms_p95.toFixed(3)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="WAL Flush p99 (ms)" value={reliable.wal_flush_latency_ms_p99.toFixed(3)} />
        </Grid>
      </Grid>
    </Box>
  );
}
