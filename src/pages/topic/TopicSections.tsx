import React, { useMemo } from 'react';
import { Box, Chip, Grid, Card, CardContent, Typography, Button, Stack } from '@mui/material';
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

export type SubscriptionFailurePolicyDto = {
  max_redelivery_count: number;
  ack_timeout_ms: number;
  base_redelivery_delay_ms: number;
  max_redelivery_delay_ms: number;
  backoff_strategy: string; // "fixed" | "exponential"
  dead_letter_topic?: string;
  poison_policy: string; // "dead_letter" | "block" | "drop"
};

export type SubscriptionDetailDto = {
  name: string;
  subscription_type: string;
  failure_policy?: SubscriptionFailurePolicyDto | null;
};

export type TopicDto = {
  name: string;
  schema_subject?: string;
  schema_id?: number;
  schema_version?: number;
  schema_type?: string;
  compatibility_mode?: string;
  subscriptions: SubscriptionDetailDto[];
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
        <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
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
          </CardContent>
        </Card>
      </Grid>

      {/* Active Connections Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
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
          </CardContent>
        </Card>
      </Grid>

      {/* Quality & Performance Card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const getSubscriptionTypeColor = (type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (type) {
    case 'Exclusive':
      return 'primary';
    case 'Shared':
      return 'success';
    case 'Failover':
      return 'warning';
    case 'KeyShared':
      return 'secondary';
    default:
      return 'default';
  }
};

export const TopicSchemaAndSubscriptions: React.FC<{ topic: TopicDto | undefined }> = ({ topic }) => {
  const subscriptions = useMemo(() => topic?.subscriptions || [], [topic]);
  const hasSchema = !!topic?.schema_subject;

  return (
    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, md: 6 }} display="flex" flexDirection="column">
        <Card variant="outlined" sx={{ flexGrow: 1, minHeight: 220, boxSizing: 'border-box' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              Schema Registry
            </Typography>
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
                      variant="outlined"
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
                      sx={{ mt: 0.5, fontWeight: 600 }}
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
              <Stack gap={1} justifyContent="center" alignItems="center" sx={{ minHeight: 160, color: 'text.secondary' }}>
                <SchemaIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                <Typography variant="body2">No registered schema on this topic.</Typography>
                <Typography variant="caption">Payloads are unstructured binary/bytes.</Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} display="flex" flexDirection="column">
        <Card variant="outlined" sx={{ flexGrow: 1, minHeight: 220, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 3 } }}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              Subscriptions
            </Typography>
            {subscriptions.length === 0 ? (
              <Stack justifyContent="center" alignItems="center" sx={{ flexGrow: 1, minHeight: 160, color: 'text.secondary' }}>
                <Typography variant="body2">No active subscriptions</Typography>
              </Stack>
            ) : (
              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
                <Stack gap={2}>
                  {subscriptions.map((sub) => (
                    <Card key={sub.name} variant="outlined" sx={{ p: 2, borderRadius: '8px', boxShadow: 'none' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight="700">
                          {sub.name}
                        </Typography>
                        <Chip 
                          label={sub.subscription_type} 
                          color={getSubscriptionTypeColor(sub.subscription_type)}
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }} 
                        />
                      </Stack>
                      {sub.failure_policy && (
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5} mt={1} sx={{ pl: 1, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Poison Policy / Backoff
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {sub.failure_policy.poison_policy.toUpperCase().replace('_', ' ')} / {sub.failure_policy.backoff_strategy.toUpperCase()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Max Redeliveries
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {sub.failure_policy.max_redelivery_count} times
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ack Timeout
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {sub.failure_policy.ack_timeout_ms} ms
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Redelivery Delay
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {sub.failure_policy.base_redelivery_delay_ms} ms
                            </Typography>
                          </Box>
                          {sub.failure_policy.dead_letter_topic && (
                            <Box gridColumn="span 2">
                              <Typography variant="caption" color="text.secondary" display="block">
                                Dead Letter Topic
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'error.main', wordBreak: 'break-all' }}>
                                {sub.failure_policy.dead_letter_topic}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
