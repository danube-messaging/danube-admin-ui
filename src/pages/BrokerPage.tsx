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
import { useNavigate, useParams } from 'react-router-dom';
import { useBrokerPage } from '../features/broker/api';

export const BrokerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useBrokerPage(id);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load broker data: {error.message}</Alert>;
  }

  const { broker, metrics, topics, errors } = data || {};

  const handleTopicClick = (topicName: string) => {
    navigate(`/topics/${encodeURIComponent(topicName)}`);
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
          <Box mb={3}>
            <Typography variant="h4" gutterBottom>
              Broker {broker?.broker_id}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {broker?.broker_role} - {broker?.broker_addr}
            </Typography>
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Topics Owned
                  </Typography>
                  <Typography variant="h5">{metrics?.topics_owned}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total RPCs
                  </Typography>
                  <Typography variant="h5">{metrics?.rpc_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Producers
                  </Typography>
                  <Typography variant="h5">{metrics?.producers_connected}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Consumers
                  </Typography>
                  <Typography variant="h5">{metrics?.consumers_connected}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Topics
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Producers</TableCell>
                  <TableCell>Consumers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics?.map((topic) => (
                  <TableRow
                    key={topic.name}
                    hover
                    onClick={() => handleTopicClick(topic.name)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{topic.name}</TableCell>
                    <TableCell>{topic.producers_connected}</TableCell>
                    <TableCell>{topic.consumers_connected}</TableCell>
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
