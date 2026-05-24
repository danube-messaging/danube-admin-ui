import React, { useMemo } from 'react';
import { Box, Chip, Grid, Paper, Typography, Button, Stack } from '@mui/material';
import type { ReliableMetricsDto } from './TopicReliable';
import { Link as RouterLink } from 'react-router-dom';
import SchemaIcon from '@mui/icons-material/SchemaOutlined';
import TrafficIcon from '@mui/icons-material/SwapCallsOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import AnalyticsIcon from '@mui/icons-material/AnalyticsOutlined';

export type TopicMetricsDto = {
  core: { msg_in_total: number; msg_out_total: number; bytes_in_total: number; bytes_out_total: number };
  active: { producers: number; consumers: number; subscriptions: number };
  quality: { send_error_total: number };
  latency_size: { msg_size_bytes_avg: number; send_latency_ms_p95: number };
  reliable?: ReliableMetricsDto | null;
};

export type TopicDto = {
  name: string;
  schema_subject?: string;
  schema_id?: number;
  schema_version?: number;
  schema_type?: string;
  compatibility_mode?: string;
  subscriptions: string[];
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TopicKpis: React.FC<{ metrics: TopicMetricsDto | undefined }> = ({ metrics }) => {
  return (
    <Grid container spacing={3} mb={3}>
      {/* Traffic Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2.5, height: '100%', boxSizing: 'border-box' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <TrafficIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="600">
              Traffic (Cumulative)
            </Typography>
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Messages In
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.core.msg_in_total ?? 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Messages Out
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.core.msg_out_total ?? 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Bytes In
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {formatBytes(metrics?.core.bytes_in_total ?? 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Bytes Out
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {formatBytes(metrics?.core.bytes_out_total ?? 0)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Active Connections Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2.5, height: '100%', boxSizing: 'border-box' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <PeopleIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="600">
              Active Clients
            </Typography>
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Producers
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.active.producers ?? 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Consumers
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.active.consumers ?? 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Subscriptions
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.active.subscriptions ?? 0}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Quality & Performance Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2.5, height: '100%', boxSizing: 'border-box' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <AnalyticsIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="600">
              Quality & Performance
            </Typography>
          </Stack>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Avg Message Size
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.latency_size.msg_size_bytes_avg 
                  ? `${metrics.latency_size.msg_size_bytes_avg.toFixed(0)} B` 
                  : '0 B'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Send Latency (p95)
              </Typography>
              <Typography variant="h6" fontWeight="600">
                {metrics?.latency_size.send_latency_ms_p95
                  ? `${metrics.latency_size.send_latency_ms_p95.toFixed(2)} ms`
                  : '0.00 ms'}
              </Typography>
            </Box>
            <Box gridColumn="span 2">
              <Typography variant="caption" color="text.secondary" display="block">
                Send Errors (Total)
              </Typography>
              <Typography variant="h6" fontWeight="600" color={metrics?.quality.send_error_total ? 'error.main' : 'inherit'}>
                {metrics?.quality.send_error_total ?? 0}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export const TopicSchemaAndSubscriptions: React.FC<{ topic: TopicDto | undefined }> = ({ topic }) => {
  const dedupedSubs = useMemo(() => Array.from(new Set(topic?.subscriptions || [])), [topic]);
  const hasSchema = !!topic?.schema_subject;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Schema Registry
        </Typography>
        <Paper sx={{ p: 3, height: '100%', minHeight: 220, boxSizing: 'border-box' }}>
          {hasSchema ? (
            <Stack gap={2}>
              <Stack direction="row" alignItems="center" gap={1}>
                <SchemaIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  {topic.schema_subject}
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ my: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Schema Type
                  </Typography>
                  <Chip
                    label={topic.schema_type?.toUpperCase() || 'UNKNOWN'}
                    size="small"
                    color="primary"
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Compatibility
                  </Typography>
                  <Chip
                    label={topic.compatibility_mode?.toUpperCase() || 'NONE'}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5, fontWeight: 500 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Active Version
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    v{topic.schema_version}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Global Schema ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                    ID: {topic.schema_id}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                component={RouterLink}
                to={`/schemas/${encodeURIComponent(topic.schema_subject || '')}`}
                sx={{ mt: 1, alignSelf: 'flex-start' }}
              >
                View Schema Evolution Timeline
              </Button>
            </Stack>
          ) : (
            <Stack gap={1} justifyContent="center" alignItems="center" sx={{ height: '100%', minHeight: 160, color: 'text.secondary' }}>
              <SchemaIcon sx={{ fontSize: 40, opacity: 0.5 }} />
              <Typography variant="body2">No registered schema on this topic.</Typography>
              <Typography variant="caption">Payloads are unstructured binary/bytes.</Typography>
            </Stack>
          )}
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Subscriptions
        </Typography>
        <Paper sx={{ p: 3, height: '100%', minHeight: 220, boxSizing: 'border-box' }}>
          {dedupedSubs.length === 0 ? (
            <Stack justifyContent="center" alignItems="center" sx={{ height: '100%', minHeight: 160, color: 'text.secondary' }}>
              <Typography variant="body2">No active subscriptions</Typography>
            </Stack>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dedupedSubs.map((sub: string) => (
                <Chip key={sub} label={sub} />
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
