import React from 'react';
import { Alert, Box, Card, CardContent, Chip, Grid, Typography, Divider, Stack } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useNamespaces } from '../features/namespaces/api';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import { Link as RouterLink } from 'react-router-dom';

import { SkeletonNamespacesPage } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const NamespacesPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useNamespaces();

  if (isLoading) {
    return <SkeletonNamespacesPage />;
  }

  if (error) {
    return <ErrorFallback message={String(error.message || error)} onRetry={refetch} />;
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
    } catch {
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

      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <StorageIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
          Namespaces
        </Typography>
      </Box>

      <Stack spacing={3}>
        {namespaces.map((ns) => {
          const partitionRe = /-part-\d+$/;
          const normalTopics = (ns.topics || []).filter((t) => !partitionRe.test(t));
          const partitionedTopics = (ns.topics || []).filter((t) => partitionRe.test(t));
          return (
            <Card key={ns.name} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <StorageIcon color="primary" sx={{ fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="600" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                      {ns.name}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1.5}>
                    <Chip
                      label={`${ns.topics.length} Topics Total`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Box>
                
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                  {/* Topics Column */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="600" mb={1.5}>
                      Normal Topics ({normalTopics.length})
                    </Typography>
                    <Box 
                      display="flex" 
                      flexWrap="wrap" 
                      gap={1} 
                      sx={{ 
                        maxHeight: 250, 
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: '3px' }
                      }}
                    >
                      {normalTopics.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">No normal topics</Typography>
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
                              sx={{ fontWeight: 600 }}
                            />
                          );
                        })
                      )}
                    </Box>
                  </Grid>

                  {/* Partitioned Topics Column */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="600" mb={1.5}>
                      Partitioned Topics ({partitionedTopics.length})
                    </Typography>
                    <Box 
                      display="flex" 
                      flexWrap="wrap" 
                      gap={1} 
                      sx={{ 
                        maxHeight: 250, 
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: '3px' }
                      }}
                    >
                      {partitionedTopics.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">No partitioned topics</Typography>
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
                              sx={{ fontWeight: 600 }}
                            />
                          );
                        })
                      )}
                    </Box>
                  </Grid>

                  {/* Policies Column */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="600" mb={1.5}>
                      Policies
                    </Typography>
                    <Box sx={{ background: 'action.hover', p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      {renderPoliciesTree(ns.policies, ns.name)}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};
