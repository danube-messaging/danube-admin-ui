import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tooltip,
  IconButton,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton, type GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate, useParams } from 'react-router-dom';
import { useBrokerPage, type BrokerTopic } from '../features/broker/api';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SyncIcon from '@mui/icons-material/Sync';
import TrafficIcon from '@mui/icons-material/SwapCallsOutlined';
import { useTopicActions } from '../features/topics/TopicsActions';

import { SkeletonBrokerPage } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BrokerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useBrokerPage(id);
  const { openCreateDialog, openUnloadDialog, openDeleteDialog, Dialogs } = useTopicActions({ invalidateKeys: [['broker', id]] });

  if (isLoading) {
    return <SkeletonBrokerPage />;
  }

  if (error) {
    return <ErrorFallback message={error.message} onRetry={refetch} />;
  }

  const { broker, metrics, topics, errors } = data || {};
  type BrokerTopicRow = { id: string; name: string; delivery: string; producers: number; consumers: number; subscriptions: number };

  const QuickToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarQuickFilter debounceMs={300} />
    </GridToolbarContainer>
  );

  const handleTopicClick = (topicName: string) => {
    navigate(`/topics/${encodeURIComponent(topicName)}`);
  };

  return (
    <Box>
      {errors && errors.length > 0 && (
        <Box mb={2}>
          {errors.map((e: string, i: number) => (
            <Alert severity="warning" key={i}>
              {e}
            </Alert>
          ))}
        </Box>
      )}

      {data && (
        <>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              <DnsIcon color="primary" sx={{ fontSize: 32, mt: 0.5 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                  Broker {broker?.broker_id}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {broker?.broker_role} - {broker?.broker_addr}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3} mb={3}>
            {/* Card 1: Broker Load */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                    <EqualizerIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Broker Load
                    </Typography>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Topics Owned
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {metrics?.topics_owned ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Operations */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                    <SyncIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Operations
                    </Typography>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Total RPCs
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {metrics?.rpc_total ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: Traffic (Cumulative) */}
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
                        Inbound Bytes
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formatBytes(metrics?.inbound_bytes_total ?? 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Outbound Bytes
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formatBytes(metrics?.outbound_bytes_total ?? 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="600">Topics</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreateDialog()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              Create Topic
            </Button>
          </Box>
          <Box sx={{ width: '100%' }}>
            <DataGrid<BrokerTopicRow>
              rows={((topics as BrokerTopic[]) || []).map((t: BrokerTopic) => ({ id: t.name, name: t.name, delivery: t.delivery, producers: t.producers_connected, consumers: t.consumers_connected, subscriptions: t.subscriptions }))}
              columns={([
                { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
                {
                  field: 'delivery',
                  headerName: 'Delivery',
                  width: 150,
                  sortable: true,
                  renderCell: (params: GridRenderCellParams<BrokerTopicRow>) => (
                    <Chip
                      icon={params.row.delivery === 'Reliable' ? <CheckCircleOutlinedIcon fontSize="small" /> : <WarningAmberOutlinedIcon fontSize="small" />}
                      label={params.row.delivery === 'Reliable' ? 'Reliable' : 'NonReliable'}
                      color={params.row.delivery === 'Reliable' ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                { field: 'producers', headerName: 'Producers', width: 130, type: 'number' },
                { field: 'subscriptions', headerName: 'Subscriptions', width: 150, type: 'number' },
                { field: 'consumers', headerName: 'Consumers', width: 130, type: 'number' },
                {
                  field: 'move',
                  headerName: 'Move',
                  width: 80,
                  sortable: false,
                  filterable: false,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params: GridRenderCellParams<BrokerTopicRow>) => (
                    <Tooltip title="Move to another broker">
                      <IconButton
                        color="primary"
                        aria-label="move topic"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openUnloadDialog(String(params.row.name));
                        }}
                        size="small"
                      >
                        <MoveIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                },
                {
                  field: 'delete',
                  headerName: 'Delete',
                  width: 90,
                  sortable: false,
                  filterable: false,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params: GridRenderCellParams<BrokerTopicRow>) => (
                    <Tooltip title="Delete topic">
                      <IconButton
                        color="error"
                        aria-label="delete topic"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openDeleteDialog(String(params.row.name));
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                },
              ]) as GridColDef<BrokerTopicRow>[]}
              disableRowSelectionOnClick
              onRowClick={(params: GridRowParams<BrokerTopicRow>) => handleTopicClick(String(params.id))}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              pageSizeOptions={[10, 25, 50]}
              slots={{ toolbar: QuickToolbar }}
              autoHeight
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  fontWeight: 600,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  color: 'text.secondary',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  color: 'text.secondary',
                },
                '& .MuiDataGrid-toolbarContainer': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                },
                borderColor: 'divider',
                '& .MuiDataGrid-row': { borderColor: 'divider' },
                '& .MuiDataGrid-cell': { borderColor: 'divider' },
              }}
            />
          </Box>
          {Dialogs}
        </>
      )}
    </Box>
  );
};
