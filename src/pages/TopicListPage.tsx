import { Alert, Box, Tooltip, Typography, Chip, IconButton, Button } from '@mui/material';
import { DataGrid, type GridColDef, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton, type GridRenderCellParams, type GridRowParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import TopicIcon from '@mui/icons-material/TopicOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useNavigate } from 'react-router-dom';
import { useTopicsList, type TopicRow } from '../features/topics/api';
import { useTopicActions } from '../features/topics/TopicsActions';

import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const TopicListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useTopicsList();
  const { openCreateDialog, openUnloadDialog, openDeleteDialog, Dialogs } = useTopicActions();

  if (isLoading) {
    return <SkeletonTable rowsCount={10} />;
  }

  if (error) {
    return <ErrorFallback message={String(error.message || error)} onRetry={refetch} />;
  }

  const rows = data?.rows || [];

  const QuickToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarQuickFilter debounceMs={300} />
    </GridToolbarContainer>
  );

  const handleTopicClick = (topicName: string) => {
    navigate(`/topics/${encodeURIComponent(topicName)}`);
  };

  const columns: GridColDef<TopicRow>[] = [
    { field: 'broker_id', headerName: 'Broker ID', flex: 1, minWidth: 220 },
    { field: 'name', headerName: 'Topic Name', flex: 1, minWidth: 260 },
    {
      field: 'delivery',
      headerName: 'Delivery',
      width: 150,
      sortable: true,
      renderCell: (params: GridRenderCellParams<TopicRow>) => (
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
      width: 90,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<TopicRow>) => (
        <Tooltip title="Move to another broker">
          <IconButton
            size="small"
            color="primary"
            aria-label="move topic"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openUnloadDialog(String(params.row.name));
            }}
          >
            <MoveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<TopicRow>) => (
        <Tooltip title="Delete topic">
          <IconButton
            size="small"
            color="error"
            aria-label="delete topic"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              openDeleteDialog(String(params.row.name));
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <TopicIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            Topics
          </Typography>
        </Box>
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
        <DataGrid<TopicRow>
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(params: GridRowParams<TopicRow>) => handleTopicClick(String(params.row.name))}
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
    </Box>
  );
};
