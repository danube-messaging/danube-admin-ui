import React from 'react';
import { Alert, Box, Grid, LinearProgress, Typography, Chip, Tooltip, Fab } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CachedIcon from '@mui/icons-material/Cached';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { useClusterPage } from '../features/cluster/api';
import { KpiCard } from '../components/common/KpiCard';
import { useClusterActions } from '../features/cluster/ClusterActions';

export const ClusterPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useClusterPage();
  const { openUnloadDialog, openActivateDialog, Dialogs } = useClusterActions();

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load cluster data: {error.message}</Alert>;
  }

  const { totals, brokers, errors } = data || {};

  const handleBrokerClick = (id: string) => {
    navigate(`/brokers/${id}`);
  };

  type BrokerRow = { id: string; status: string; address: string; role: string; topics: number; rpcs: number };

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
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4">Danube Cluster</Typography>
            <Typography variant="caption" color="text.secondary">
              Updated at {new Date(data.timestamp).toLocaleString()}
            </Typography>
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Brokers" value={totals?.broker_count ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Topics" value={totals?.topics_total ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Total RPCs" value={totals?.rpc_total ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Active Connections" value={totals?.active_connections ?? 0} />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Brokers
          </Typography>
          <Box sx={{ width: '100%' }}>
            <DataGrid<BrokerRow>
              rows={(brokers || []).map((b) => ({
                id: b.broker_id,
                status: b.broker_status,
                address: b.broker_addr,
                role: b.broker_role,
                topics: b.stats.topics_owned,
                rpcs: b.stats.rpc_total,
              }))}
              columns={([
                { field: 'id', headerName: 'ID', flex: 1, minWidth: 220 },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 140,
                  renderCell: (params: GridRenderCellParams<BrokerRow, string>) => {
                    const v = String(params.value ?? '').toLowerCase();
                    if (v === 'active') {
                      return (
                        <Chip
                          icon={<CheckIcon fontSize="small" />}
                          label="Active"
                          color="success"
                          size="small"
                          variant="filled"
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      );
                    }
                    if (v === 'draining') {
                      return (
                        <Chip
                          icon={<CachedIcon fontSize="small" />}
                          label="Draining"
                          color="warning"
                          size="small"
                          variant="filled"
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      );
                    }
                    return (
                      <Chip
                        icon={<WarningIcon fontSize="small" />}
                        label="Drained"
                        color="error"
                        size="small"
                        variant="filled"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      />
                    );
                  },
                },
                {
                  field: 'role',
                  headerName: 'Role',
                  width: 160,
                  renderCell: (params: GridRenderCellParams<BrokerRow, string>) => (
                    <Chip
                      label={(String(params.value) || '').replace('_', ' ')}
                      size="small"
                      color={params.value === 'Cluster_Leader' ? 'primary' : 'default'}
                      variant={params.value === 'Cluster_Leader' ? 'filled' : 'outlined'}
                    />
                  ),
                },
                { field: 'address', headerName: 'Address', flex: 1, minWidth: 200 },
                { field: 'topics', headerName: 'Topics', width: 120, type: 'number' },
                { field: 'rpcs', headerName: 'RPCs', width: 120, type: 'number' },
                {
                  field: 'action',
                  headerName: 'Action',
                  width: 110,
                  sortable: false,
                  filterable: false,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params: GridRenderCellParams<BrokerRow>) => {
                    const status = String(params.row.status || '').toLowerCase();
                    if (status === 'drained') {
                      return (
                        <Tooltip title="Activate broker">
                          <Fab
                            size="small"
                            color="primary"
                            aria-label="activate broker"
                            onClick={(e) => {
                              e.stopPropagation();
                              openActivateDialog(String(params.id));
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </Fab>
                        </Tooltip>
                      );
                    }
                    return (
                      <Tooltip title="Move all topics from the broker">
                        <Fab
                          size="small"
                          color="error"
                          aria-label="unload broker"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUnloadDialog(String(params.id));
                          }}
                        >
                          <MoveIcon fontSize="small" />
                        </Fab>
                      </Tooltip>
                    );
                  },
                },
              ]) as GridColDef<BrokerRow>[]}
              disableRowSelectionOnClick
              onRowClick={(params: GridRowParams<BrokerRow>) => handleBrokerClick(String(params.id))}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              pageSizeOptions={[10, 25, 50]}
              autoHeight
              slots={{
                toolbar: () => (
                  <GridToolbarContainer>
                    <GridToolbarColumnsButton />
                    <GridToolbarQuickFilter debounceMs={300} />
                  </GridToolbarContainer>
                ),
              }}
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

