import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import { useSchemaDetail, useSchemaAction } from '../features/schemas/api';
import { KpiCard } from '../components/common/KpiCard';
import { ErrorFallback } from '../components/common/ErrorFallback';
import { SkeletonNamespacesPage } from '../components/common/SkeletonLoader';

export const SchemaDetailPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useSchemaDetail(subject);
  const actionMutation = useSchemaAction();

  const [selectedVersionNum, setSelectedVersionNum] = useState<number | null>(null);
  const [compMode, setCompMode] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteVersionNum, setDeleteVersionNum] = useState<number | null>(null);

  // Sync compatibility mode state when data loads
  React.useEffect(() => {
    if (data?.compatibility_mode) {
      setCompMode(data.compatibility_mode.toLowerCase());
    }
  }, [data]);

  if (isLoading) {
    return <SkeletonNamespacesPage />;
  }

  if (error) {
    return <ErrorFallback message={String(error.message || error)} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorFallback message="Schema details not found" onRetry={refetch} />;
  }

  const versions = data.versions || [];
  const latestSchema = data.latest;

  // Use the selected version if set, otherwise default to latest version number
  const activeVersionNum = selectedVersionNum || latestSchema?.version || (versions[0]?.version);

  // Find the selected version's metadata
  const activeVersionMeta = versions.find((v) => v.version === activeVersionNum);

  // Schema definition for display
  let displayDefinition = '';
  if (activeVersionNum === latestSchema?.version && latestSchema?.schema_definition) {
    displayDefinition = latestSchema.schema_definition;
  } else {
    // If it's an older version, we might not have its full definition in this call.
    // The current gateway endpoint return `latest` schema definition.
    // Let's explain to the user or if they select older versions we show fingerprint/metadata.
    displayDefinition = activeVersionMeta
      ? `Metadata & Fingerprint only for version v${activeVersionMeta.version}. Full definition is only stored for the latest version.\n\nFingerprint: ${activeVersionMeta.fingerprint}`
      : 'No version selected';
  }

  // Format schema definition if it's JSON
  try {
    const parsed = JSON.parse(displayDefinition);
    displayDefinition = JSON.stringify(parsed, null, 2);
  } catch {
    // Keep raw string (e.g. proto files, raw text)
  }

  const handleCompatibilityChange = async () => {
    if (!subject) return;
    try {
      await actionMutation.mutateAsync({
        action: 'set_compatibility',
        subject,
        compatibility_mode: compMode,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = (version: number) => {
    setDeleteVersionNum(version);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subject || deleteVersionNum === null) return;
    try {
      await actionMutation.mutateAsync({
        action: 'delete_version',
        subject,
        version: deleteVersionNum,
      });
      setIsDeleteDialogOpen(false);
      setDeleteVersionNum(null);
      // Reset selected version back to null/latest if we deleted the selected one
      if (selectedVersionNum === deleteVersionNum) {
        setSelectedVersionNum(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/schemas')}
        sx={{ mb: 3 }}
      >
        Back to Schema Registry
      </Button>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyItems="center" justifyContent="space-between" mb={3} gap={2}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography variant="h4" fontWeight="600">
            {subject}
          </Typography>
        </Stack>

        <Stack direction="row" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="compatibility-label">Compatibility Mode</InputLabel>
            <Select
              labelId="compatibility-label"
              value={compMode}
              label="Compatibility Mode"
              onChange={(e) => setCompMode(e.target.value)}
            >
              <MenuItem value="none">NONE</MenuItem>
              <MenuItem value="backward">BACKWARD</MenuItem>
              <MenuItem value="forward">FORWARD</MenuItem>
              <MenuItem value="full">FULL</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={actionMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleCompatibilityChange}
            disabled={actionMutation.isPending || compMode === data.compatibility_mode}
          >
            Apply
          </Button>
        </Stack>
      </Box>

      {actionMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {actionMutation.error.message}
        </Alert>
      )}

      {actionMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Action completed successfully!
        </Alert>
      )}

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Schema Type"
            value={data.schema_type.toUpperCase()}
            subtitle="Central registry type format"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Compatibility"
            value={data.compatibility_mode}
            subtitle="Schema evolution constraint"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Versions"
            value={versions.length}
            subtitle="Count of historical iterations"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Latest Schema ID"
            value={latestSchema?.schema_id || 'N/A'}
            subtitle="Global index ID allocation"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Versions Timeline Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Versions Timeline
              </Typography>
              <Stack gap={1.5}>
                {versions.map((ver) => {
                  const isActive = ver.version === activeVersionNum;
                  return (
                    <Card
                      key={ver.version}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        borderWidth: isActive ? 2 : 1,
                        background: isActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                        '&:hover': {
                          background: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                      onClick={() => setSelectedVersionNum(ver.version)}
                    >
                      <CardContent sx={{ p: '12px !important' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={isActive ? 700 : 500}>
                            Version v{ver.version}
                          </Typography>
                          <Stack direction="row" alignItems="center" gap={1}>
                            {ver.version === latestSchema?.version && (
                              <Chip label="LATEST" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                            <Button
                              size="small"
                              color="error"
                              sx={{ minWidth: 0, p: 0.5 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(ver.version);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Stack>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          {ver.description || 'No description provided'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack direction="row" gap={1.5} flexWrap="wrap">
                          <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary">
                            <CalendarIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {new Date(ver.created_at * 1000).toLocaleDateString()}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary">
                            <PersonIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">{ver.created_by}</Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Schema Definition Code Container */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Schema Definition (v{activeVersionNum})
                </Typography>
                {activeVersionMeta && (
                  <Chip
                    icon={<FingerprintIcon fontSize="small" />}
                    label={`FP: ${activeVersionMeta.fingerprint.substring(0, 16)}...`}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                  />
                )}
              </Box>

              {activeVersionMeta?.description && (
                <Box mb={2} p={1.5} sx={{ background: 'rgba(0, 0, 0, 0.02)', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">{activeVersionMeta.description}</Typography>
                </Box>
              )}

              <Box
                sx={{
                  background: 'rgb(30, 30, 30)',
                  color: 'rgb(220, 220, 220)',
                  fontFamily: '"Fira Code", monospace, Courier, monospace',
                  fontSize: '0.875rem',
                  p: 2.5,
                  borderRadius: 2,
                  overflowX: 'auto',
                  maxHeight: 500,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {displayDefinition}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Version Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Schema Version</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete version <strong>v{deleteVersionNum}</strong> of the subject <strong>{subject}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Version
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
