import React, { useMemo } from 'react';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';

export type SeriesItem = { name: string; labels?: Record<string, string> | null; points: [number, number][] };

const toMap = (s?: SeriesItem) => {
  const m = new Map<number, number>();
  if (!s?.points) return m;
  for (const [ts, v] of s.points) m.set(ts, v);
  return m;
};

const alignTwo = (a?: SeriesItem, b?: SeriesItem) => {
  const ma = toMap(a);
  const mb = toMap(b);
  const xs = Array.from(new Set<number>([...ma.keys(), ...mb.keys()])).sort((x, y) => x - y);
  const xData = xs.map((t) => new Date(t));
  const ya = xs.map((t) => (ma.has(t) ? (ma.get(t) as number) : null));
  const yb = xs.map((t) => (mb.has(t) ? (mb.get(t) as number) : null));
  return { xData, ya, yb };
};

const CardChart: React.FC<{
  title: string;
  leftName: string; leftData: number[]; leftColor: string;
  rightName: string; rightData: number[]; rightColor: string;
  xData: Date[];
}>
  = ({ title, leftName, leftData, leftColor, rightName, rightData, rightColor, xData }) => {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ width: '100%', height: 280 }}>
          <LineChart
            xAxis={[{ scaleType: 'time', data: xData }]}
            series={[
              { id: leftName, label: leftName, data: leftData, color: leftColor, showMark: false, area: false },
              { id: rightName, label: rightName, data: rightData, color: rightColor, showMark: false, area: false },
            ]}
            height={260}
            margin={{ left: 40, right: 20, top: 10, bottom: 30 }}
            grid={{ horizontal: true }}
          />
        </Box>
      </Paper>
    );
  };

export const TopicCharts: React.FC<{ series: SeriesItem[] | null; error: string | null }>
  = ({ series, error }) => {
    const pubDis = useMemo(() => alignTwo(
      series?.find((x) => x.name === 'publish_rate_1m'),
      series?.find((x) => x.name === 'dispatch_rate_1m')
    ), [series]);
    const bytesInOut = useMemo(() => alignTwo(
      series?.find((x) => x.name === 'bytes_in_rate_1m'),
      series?.find((x) => x.name === 'bytes_out_rate_1m')
    ), [series]);

    return (
      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          {error && <Alert severity="warning">Failed to load series: {error}</Alert>}
          {!series && !error && <Typography variant="body2">Loading series…</Typography>}
          {series && (
            <CardChart
              title="Publish vs Dispatch rate (1m)"
              leftName="publish_rate_1m"
              leftData={pubDis.ya as number[]}
              leftColor="#1976d2"
              rightName="dispatch_rate_1m"
              rightData={pubDis.yb as number[]}
              rightColor="#9c27b0"
              xData={pubDis.xData}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {error && <Alert severity="warning">Failed to load series: {error}</Alert>}
          {!series && !error && <Typography variant="body2">Loading series…</Typography>}
          {series && (
            <CardChart
              title="Bytes In/Out rate (1m)"
              leftName="bytes_in_rate_1m"
              leftData={bytesInOut.ya as number[]}
              leftColor="#2e7d32"
              rightName="bytes_out_rate_1m"
              rightData={bytesInOut.yb as number[]}
              rightColor="#ef6c00"
              xData={bytesInOut.xData}
            />
          )}
        </Grid>
      </Grid>
    );
  };
