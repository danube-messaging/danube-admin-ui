import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  LinearProgress,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTopicPage } from '../features/topic/api';
import { TopicKpis, TopicSchemaAndSubscriptions } from './topic/TopicSections';
import type { TopicDto, TopicMetricsDto } from './topic/TopicSections';
import { TopicCharts } from './topic/TopicCharts';
import type { SeriesItem } from './topic/TopicCharts';
import { TopicReliable } from './topic/TopicReliable';
import type { ReliableMetricsDto } from './topic/TopicReliable';
import { StatCard } from '../components/common/StatCard';

export const TopicPage: React.FC = () => {
  const { topic: topicName } = useParams<{ topic: string }>();
  const { data, isLoading, error } = useTopicPage(topicName);
  const [series, setSeries] = useState<SeriesItem[] | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: number; to: number; step: string }>(() => {
    const to = Math.floor(Date.now() / 1000);
    return { from: to - 15 * 60, to, step: '15s' };
  });

  // Fetch range series for charts/tables (must be before early returns to keep hook order stable)
  useEffect(() => {
    if (!topicName) return;
    const controller = new AbortController();
    const apiBase = (
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_ADMIN_API_BASE
    ) || 'http://localhost:8080';
    const url = `${apiBase}/ui/v1/topics/${encodeURIComponent(topicName)}/series?from=${range.from}&to=${range.to}&step=${range.step}`;
    setSeriesError(null);
    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((j) => setSeries(j.series))
      .catch((e) => {
        if (e.name !== 'AbortError') setSeriesError(String(e));
      });
    return () => controller.abort();
  }, [topicName, range]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load topic data: {error.message}</Alert>;
  }

  const { topic, metrics, errors } = (data || {}) as { topic?: TopicDto; metrics?: TopicMetricsDto & { reliable?: ReliableMetricsDto | null }; errors?: string[] };

  return (
    <Box>
      {errors && errors.length > 0 && (
        <Box mb={2}>
          {errors.map((e, i) => (
            <Alert severity="warning" key={i}>
              {e}
            </Alert>
          ))}
        </Box>
      )}

      {data && (
        <>
          <Box mb={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2}>
              <Typography variant="h4">Topic: {topic?.name}</Typography>
              <Stack direction="row" gap={2} alignItems="center">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={range.to - range.from}
                  onChange={(_e: React.MouseEvent<HTMLElement>, val: number | null) => {
                    if (!val) return;
                    const now = Math.floor(Date.now() / 1000);
                    setRange({ from: now - val, to: now, step: range.step });
                  }}
                >
                  <ToggleButton value={15 * 60}>15m</ToggleButton>
                  <ToggleButton value={60 * 60}>1h</ToggleButton>
                  <ToggleButton value={6 * 60 * 60}>6h</ToggleButton>
                </ToggleButtonGroup>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="step-label">Step</InputLabel>
                  <Select
                    labelId="step-label"
                    label="Step"
                    value={range.step}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRange((r: { from: number; to: number; step: string }) => ({ ...r, step: (e.target as HTMLInputElement).value }))
                    }
                  >
                    <MenuItem value={'15s'}>15s</MenuItem>
                    <MenuItem value={'30s'}>30s</MenuItem>
                    <MenuItem value={'1m'}>1m</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          <TopicKpis metrics={metrics} />

          <TopicSchemaAndSubscriptions topic={topic} />

          {/* Sample StatCard using bytes_out_rate_1m */}
          <Grid container spacing={3} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Bytes Out Rate (1m)"
                value={(() => {
                  const pts = series?.find((s: SeriesItem) => s.name === 'bytes_out_rate_1m')?.points || [];
                  const v = pts.length ? pts[pts.length - 1][1] : 0;
                  return (Number.isFinite(v) ? v : 0).toFixed(2);
                })()}
                interval={`Last ${Math.floor((range.to - range.from) / 60)}m`}
                data={(series?.find((s: SeriesItem) => s.name === 'bytes_out_rate_1m')?.points || []).map((p: [number, number]) => p[1])}
                compact
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <TopicCharts series={series} error={seriesError} />

          {/* Reliable section */}
          {metrics?.reliable && <TopicReliable reliable={metrics.reliable as ReliableMetricsDto} />}
        </>
      )}
    </Box>
  );
};
