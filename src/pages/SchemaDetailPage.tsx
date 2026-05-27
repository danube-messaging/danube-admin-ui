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
import SchemaIcon from '@mui/icons-material/SchemaOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';

import { useSchemaDetail, useSchemaAction } from '../features/schemas/api';
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
          <SchemaIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
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
        {/* Card 1: Schema Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <SchemaIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  Schema Type
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Format
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {data.schema_type.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Compatibility */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <SettingsIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  Compatibility Mode
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Rule Constraint
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {data.compatibility_mode.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Evolution Statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <HistoryIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  Evolution Statistics
                </Typography>
              </Stack>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Versions
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {versions.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Latest Schema ID
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {latestSchema?.schema_id || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
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
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                  fontFamily: '"Fira Code", monospace, Courier, monospace',
                  fontSize: '0.875rem',
                  p: 2.5,
                  borderRadius: 2,
                  overflowX: 'auto',
                  maxHeight: 500,
                  whiteSpace: 'pre-wrap',
                  border: '1px solid',
                  borderColor: 'divider',
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
