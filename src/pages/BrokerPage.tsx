import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  Tooltip,
  Fab,
  Chip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton, type GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate, useParams } from 'react-router-dom';
import { useBrokerPage, type BrokerTopic } from '../features/broker/api';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import { useTopicActions } from '../features/topics/TopicsActions';
import ReliableIcon from '@mui/icons-material/GppGood';
import NonReliableIcon from '@mui/icons-material/GppBad';

export const BrokerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useBrokerPage(id);
  const { openCreateDialog, openUnloadDialog, openDeleteDialog, Dialogs } = useTopicActions({ invalidateKeys: [['broker', id]] });

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load broker data: {error.message}</Alert>;
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
          <Box mb={3}>
            <Typography variant="h4" gutterBottom>
              Broker {broker?.broker_id}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {broker?.broker_role} - {broker?.broker_addr}
            </Typography>
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Topics Owned
                  </Typography>
                  <Typography variant="h5">{metrics?.topics_owned}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total RPCs
                  </Typography>
                  <Typography variant="h5">{metrics?.rpc_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Inbound Bytes
                  </Typography>
                  <Typography variant="h5">{metrics?.inbound_bytes_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Outbound Bytes
                  </Typography>
                  <Typography variant="h5">{metrics?.outbound_bytes_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Topics</Typography>
            <Fab variant="extended" size="medium" color="primary" onClick={() => openCreateDialog()}>
              <AddIcon sx={{ mr: 1 }} />
              Create
            </Fab>
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
                      icon={params.row.delivery === 'Reliable' ? <ReliableIcon fontSize="small" /> : <NonReliableIcon fontSize="small" />}
                      label={params.row.delivery === 'Reliable' ? 'Reliable' : 'NonReliable'}
                      color={params.row.delivery === 'Reliable' ? 'success' : 'warning'}
                      size="small"
                      variant="filled"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
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
                      <Fab
                        size="small"
                        color="primary"
                        aria-label="move topic"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openUnloadDialog(String(params.row.name));
                        }}
                      >
                        <MoveIcon fontSize="small" />
                      </Fab>
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
                      <Fab
                        size="small"
                        color="error"
                        aria-label="delete topic"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openDeleteDialog(String(params.row.name));
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Fab>
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
