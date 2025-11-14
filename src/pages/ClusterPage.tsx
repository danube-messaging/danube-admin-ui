import React from 'react';
import {
  Alert,
  Box,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useClusterPage } from '../features/cluster/api';
import { KpiCard } from '../components/common/KpiCard';

export const ClusterPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useClusterPage();

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Topics</TableCell>
                  <TableCell>RPCs</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brokers?.map((broker) => (
                  <TableRow
                    key={broker.broker_id}
                    hover
                    onClick={() => handleBrokerClick(broker.broker_id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{broker.broker_id}</TableCell>
                    <TableCell>{broker.broker_addr}</TableCell>
                    <TableCell>
                      <Chip
                        label={broker.broker_role.replace('_', ' ')}
                        size="small"
                        color={broker.broker_role === 'Cluster_Leader' ? 'primary' : 'default'}
                        variant={broker.broker_role === 'Cluster_Leader' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{broker.stats.topics_owned}</TableCell>
                    <TableCell>{broker.stats.rpc_total}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Unload
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

