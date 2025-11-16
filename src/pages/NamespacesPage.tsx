import React from 'react';
import { Alert, Box, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useNamespaces } from '../features/namespaces/api';
import { KpiCard } from '../components/common/KpiCard';
import { Link as RouterLink } from 'react-router-dom';

export const NamespacesPage: React.FC = () => {
  const { data, isLoading, error } = useNamespaces();

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load namespaces: {String((error as Error)?.message || error)}</Alert>;
  }

  const namespaces = data?.namespaces || [];

  const renderPoliciesTree = (policiesJson: string, ns: string) => {
    try {
      const obj = JSON.parse(policiesJson || '{}');
      const entries = Object.entries(obj) as Array<[string, unknown]>;
      return (
        <SimpleTreeView aria-label={`policies-${ns}`} sx={{ flex: 1 }}>
          <TreeItem itemId={`${ns}-root`} label="Policies">
            {entries.map(([k, v]) => (
              <TreeItem key={`${ns}-${k}`} itemId={`${ns}-${k}`} label={`${k}: ${String(v)}`} />
            ))}
          </TreeItem>
        </SimpleTreeView>
      );
    } catch (_) {
      return <Typography color="error">Invalid policies JSON</Typography>;
    }
  };

  return (
    <Box>
      {data?.errors && data.errors.length > 0 && (
        <Box mb={2}>
          {data.errors.map((e: string, i: number) => (
            <Alert severity="warning" key={i}>
              {e}
            </Alert>
          ))}
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Namespaces</Typography>
        <Typography variant="caption" color="text.secondary">
          Updated at {data ? new Date(data.timestamp).toLocaleString() : ''}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {namespaces.map((ns) => {
          const partitionRe = /-part-\d+$/;
          const normalTopics = (ns.topics || []).filter((t) => !partitionRe.test(t));
          const partitionedTopics = (ns.topics || []).filter((t) => partitionRe.test(t));
          return (
          <Grid key={ns.name} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
            <KpiCard
              title={ns.name}
              value={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography component="span" variant="h6">{ns.topics.length}</Typography>
                  <Typography component="span" color="text.secondary">topics</Typography>
                </Box>
              }
              subtitle="Namespace overview"
            />
            <Box mt={1}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Topics</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {normalTopics.length === 0 ? (
                      <Typography color="text.secondary">No topics</Typography>
                    ) : (
                      normalTopics.map((t) => {
                        const topicPath = t.startsWith('/') ? t : `/${t}`;
                        return (
                          <Chip
                            key={`norm-${t}`}
                            size="small"
                            label={t}
                            variant="outlined"
                            component={RouterLink}
                            to={`/topics/${encodeURIComponent(topicPath)}`}
                            clickable
                          />
                        );
                      })
                    )}
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>Partitioned Topics</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {partitionedTopics.length === 0 ? (
                        <Typography color="text.secondary">No partitioned topics</Typography>
                      ) : (
                        partitionedTopics.map((t) => {
                          const topicPath = t.startsWith('/') ? t : `/${t}`;
                          return (
                            <Chip
                              key={`part-${t}`}
                              size="small"
                              label={t}
                              variant="outlined"
                              component={RouterLink}
                              to={`/topics/${encodeURIComponent(topicPath)}`}
                              clickable
                            />
                          );
                        })
                      )}
                    </Box>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>Policies</Typography>
                    {renderPoliciesTree(ns.policies, ns.name)}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        );})}
      </Grid>
    </Box>
  );
};
