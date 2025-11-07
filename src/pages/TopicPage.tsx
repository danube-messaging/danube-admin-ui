import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTopicPage } from '../features/topic/api';

// Helper to safely decode base64
const decodeBase64 = (str: string): string => {
  try {
    return atob(str);
  } catch (e) {
    return 'Invalid base64 string';
  }
};

export const TopicPage: React.FC = () => {
  const { topic: topicName } = useParams<{ topic: string }>();
  const { data, isLoading, error } = useTopicPage(topicName);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load topic data: {error.message}</Alert>;
  }

  const { topic, metrics, errors } = data || {};
  const decodedSchema = topic ? decodeBase64(topic.schema_data) : '';

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
              Topic: {topic?.name}
            </Typography>
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Messages In
                  </Typography>
                  <Typography variant="h5">{metrics?.msg_in_total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Producers
                  </Typography>
                  <Typography variant="h5">{metrics?.producers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Consumers
                  </Typography>
                  <Typography variant="h5">{metrics?.consumers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Schema
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Type: {topic?.type_schema}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {decodedSchema}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Subscriptions
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {topic?.subscriptions.map((sub) => (
                    <Chip key={sub} label={sub} />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
