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
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useBrokerPage } from '../features/broker/api';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';

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
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {}}
            >
              Create
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Producers</TableCell>
                  <TableCell>Subscriptions</TableCell>
                  <TableCell>Consumers</TableCell>
                  <TableCell align="right">Actions</TableCell>
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
                    <TableCell>-</TableCell>
                    <TableCell>{topic.consumers_connected}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Move to another broker">
                        <IconButton size="small" aria-label="move topic">
                          <MoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete topic">
                        <IconButton size="small" color="error" aria-label="delete topic">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
