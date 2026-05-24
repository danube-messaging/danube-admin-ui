import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Typography, Stack } from '@mui/material';
import { DataGrid, type GridColDef, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton, type GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import SchemaIcon from '@mui/icons-material/SchemaOutlined';
import CompatibilityIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import TagIcon from '@mui/icons-material/LocalOfferOutlined';
import { useSchemasList, type SchemaSummary } from '../features/schemas/api';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const SchemasPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useSchemasList();

  const subjects = useMemo(
    () => [...(data?.subjects || [])].sort((a, b) => a.schema_id - b.schema_id),
    [data]
  );

  if (isLoading) {
    return <SkeletonTable rowsCount={8} />;
  }

  if (error) {
    return <ErrorFallback message={String(error.message || error)} onRetry={refetch} />;
  }

  const QuickToolbar = () => (
    <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
      <GridToolbarColumnsButton />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter debounceMs={300} />
    </GridToolbarContainer>
  );

  const columns: GridColDef<SchemaSummary>[] = [
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => (
        <Stack direction="row" alignItems="center" gap={1.5}>
          <SchemaIcon color="primary" fontSize="small" />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              color: 'text.primary',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate(`/schemas/${encodeURIComponent(params.row.subject)}`)}
          >
            {params.row.subject}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'schema_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => {
        const type = params.row.schema_type.toLowerCase();
        let color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default' = 'default';
        if (type === 'avro') color = 'primary';
        else if (type === 'protobuf') color = 'secondary';
        else if (type === 'jsonschema' || type === 'json_schema') color = 'info';
        else if (type === 'string') color = 'success';
        else if (type === 'bytes') color = 'warning';

        return (
          <Chip
            label={params.row.schema_type.toUpperCase()}
            color={color}
            size="small"
            variant="filled"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        );
      }
    },
    {
      field: 'latest_version',
      headerName: 'Latest Version',
      width: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => (
        <Chip
          label={`v${params.row.latest_version}`}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      field: 'compatibility_mode',
      headerName: 'Compatibility',
      width: 160,
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => {
        const mode = params.row.compatibility_mode.toUpperCase();
        let color: 'success' | 'info' | 'warning' | 'default' = 'default';
        if (mode === 'FULL') color = 'success';
        else if (mode === 'BACKWARD') color = 'info';
        else if (mode === 'FORWARD') color = 'warning';

        return (
          <Chip
            icon={<CompatibilityIcon fontSize="small" />}
            label={mode}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: 'schema_id',
      headerName: 'Schema ID',
      width: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => (
        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
          ID: {params.row.schema_id}
        </Typography>
      )
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1.5,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<SchemaSummary>) => (
        <Stack direction="row" flexWrap="wrap" gap={0.5} alignContent="center" sx={{ height: '100%' }}>
          {params.row.tags && params.row.tags.length > 0 ? (
            params.row.tags.map((tag) => (
              <Chip
                key={tag}
                icon={<TagIcon fontSize="inherit" />}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.disabled">no tags</Typography>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <SchemaIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="600">Schema Registry</Typography>
      </Box>

      <Card variant="outlined" sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.01) 100%)' }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="body1" color="text.secondary">
            Danube Schema Registry provides centralized management of schemas. Enforce schemas on your topic payloads to prevent downstream message decoding issues. Supports schema evolution checks using compatibility rules.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={subjects}
            getRowId={(row) => row.subject}
            columns={columns}
            slots={{ toolbar: QuickToolbar }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            onRowClick={(params) => navigate(`/schemas/${encodeURIComponent(params.row.subject)}`)}
            sx={{
              border: 0,
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-cell:focus': { outline: 'none' }
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};
