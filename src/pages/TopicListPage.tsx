import React from 'react';
import { Alert, Box, Fab, LinearProgress, Tooltip, Typography } from '@mui/material';
import { DataGrid, type GridColDef, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import { useNavigate } from 'react-router-dom';
import { useTopicsList } from '../features/topics/api';

export const TopicListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useTopicsList();

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load topics: {String((error as Error)?.message || error)}</Alert>;
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

  const columns: GridColDef[] = [
    { field: 'broker_id', headerName: 'Broker ID', flex: 1, minWidth: 220 },
    { field: 'name', headerName: 'Topic Name', flex: 1, minWidth: 260 },
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
      renderCell: () => (
        <Tooltip title="Move to another broker">
          <Fab
            size="small"
            color="primary"
            aria-label="move topic"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <MoveIcon fontSize="small" />
          </Fab>
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
      renderCell: () => (
        <Tooltip title="Delete topic">
          <Fab
            size="small"
            color="error"
            aria-label="delete topic"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <DeleteIcon fontSize="small" />
          </Fab>
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

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Topics</Typography>
        <Fab variant="extended" size="medium" color="primary" onClick={() => {}}>
          <AddIcon sx={{ mr: 1 }} />
          Create
        </Fab>
      </Box>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(params) => handleTopicClick(String(params.row.name))}
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
    </Box>
  );
};
