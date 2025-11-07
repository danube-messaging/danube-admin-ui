import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useClusterPage } from '../features/cluster/api';

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
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Brokers
                  </Typography>
                  <Typography variant="h5">{totals?.broker_count}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Topics
                  </Typography>
                  <Typography variant="h5">{totals?.topics_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total RPCs
                  </Typography>
                  <Typography variant="h5">{totals?.rpc_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Connections
                  </Typography>
                  <Typography variant="h5">{totals?.active_connections}</Typography>
                </CardContent>
              </Card>
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
                    <TableCell>{broker.broker_role}</TableCell>
                    <TableCell>{broker.stats.topics_owned}</TableCell>
                    <TableCell>{broker.stats.rpc_total}</TableCell>
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
