import React, { useMemo } from 'react';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import { KpiCard } from '../../components/common/KpiCard';

export type TopicMetricsDto = {
  core: { msg_in_total: number; msg_out_total: number; bytes_in_total: number; bytes_out_total: number };
  active: { producers: number; consumers: number; subscriptions: number };
  quality: { send_error_total: number };
  latency_size: { msg_size_bytes_avg: number; send_latency_ms_p95: number };
  reliable?: any | null;
};

export type TopicDto = {
  name: string;
  type_schema: number;
  schema_data: string;
  subscriptions: string[];
};

export const TopicKpis: React.FC<{ metrics: TopicMetricsDto | undefined }> = ({ metrics }) => {
  return (
    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Messages In" value={metrics?.core.msg_in_total ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Messages Out" value={metrics?.core.msg_out_total ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Bytes In" value={metrics?.core.bytes_in_total ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Bytes Out" value={metrics?.core.bytes_out_total ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Producers" value={metrics?.active.producers ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Consumers" value={metrics?.active.consumers ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Subscriptions" value={metrics?.active.subscriptions ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Send Errors" value={metrics?.quality.send_error_total ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Avg Msg Size (B)" value={(metrics?.latency_size.msg_size_bytes_avg ?? 0).toFixed(2)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard title="Latency p95 (ms)" value={(metrics?.latency_size.send_latency_ms_p95 ?? 0).toFixed(3)} />
      </Grid>
    </Grid>
  );
};

const decodeBase64 = (str: string): string => {
  try { return atob(str); } catch { return 'Invalid base64 string'; }
};

export const TopicSchemaAndSubscriptions: React.FC<{ topic: TopicDto | undefined }> = ({ topic }) => {
  const decodedSchema = topic ? decodeBase64(topic.schema_data) : '';
  const dedupedSubs = useMemo(() => Array.from(new Set(topic?.subscriptions || [])), [topic]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Schema
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Type: {topic?.type_schema}
          </Typography>
          <Box
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              p: 2,
              borderRadius: 1,
            }}
          >
            {decodedSchema}
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Subscriptions
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {dedupedSubs.map((sub: string) => (
              <Chip key={sub} label={sub} />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
