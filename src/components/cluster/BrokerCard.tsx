import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Button,
  Divider,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import MoveIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import HubIcon from '@mui/icons-material/Hub';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface BrokerStats {
  topics_owned: number;
  rpc_total: number;
  rpc_rate_1m: number;
  active_connections: number;
  errors_5xx_total: number;
}

interface BrokerInfo {
  broker_id: string;
  broker_addr: string;
  broker_status?: string;
  broker_role: string;
  stats: BrokerStats;
}

interface BrokerCardProps {
  nodeId: string;
  broker?: BrokerInfo;
  isLeader: boolean;
  raftRole: 'voter' | 'learner' | 'none';
  onActivate: (id: string) => void;
  onUnload: (id: string) => void;
  onPromote: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export const BrokerCard: React.FC<BrokerCardProps> = ({
  nodeId,
  broker,
  isLeader,
  raftRole,
  onActivate,
  onUnload,
  onPromote,
  onRemove,
  onNavigate,
}) => {
  const loadStatus = broker?.broker_status?.toLowerCase() || 'unregistered';
  const isBrokerActive = broker && (loadStatus === 'active' || loadStatus === 'draining');

  // Activate Button rules
  const canActivate = broker && (loadStatus === 'drained' || loadStatus === 'draining');
  const activateTooltip = !broker
    ? 'Cannot activate unregistered node'
    : loadStatus === 'active'
    ? 'Broker is already active'
    : 'Activate broker to receive topic assignments';

  // Deactivate/Unload Button rules
  const canDeactivate = broker && loadStatus === 'active';
  const deactivateTooltip = !broker
    ? 'Cannot deactivate unregistered node'
    : loadStatus === 'active'
    ? 'Migrate topics off this broker and set state to drained'
    : 'Unload is only available for Active brokers';

  // Promote Button rules
  const canPromote = raftRole === 'learner';
  const promoteTooltip =
    raftRole === 'voter'
      ? 'Node is already a voting member'
      : raftRole === 'learner'
      ? 'Promote learner to a full voting member'
      : 'Node is not part of the Raft consensus';

  // Remove Button rules
  const disableRemove = isBrokerActive || raftRole === 'none';
  const removeTooltip =
    raftRole === 'none'
      ? 'Node is not in the Raft consensus group'
      : isBrokerActive
      ? 'Cannot remove an Active or Draining broker. Migrate topics off this broker first.'
      : isLeader
      ? 'Removing the Leader is permitted but will trigger a cluster-wide election.'
      : 'Remove this node from Raft consensus';

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: 'success.main',
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
          <Typography
            variant="subtitle1"
            onClick={() => broker && onNavigate && onNavigate(nodeId)}
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              color: broker ? 'primary.main' : 'text.primary',
              cursor: broker ? 'pointer' : 'default',
              textDecoration: broker ? 'underline' : 'none',
              wordBreak: 'break-all',
              mr: 1,
              '&:hover': {
                color: broker ? 'primary.dark' : 'text.primary',
              },
            }}
          >
            {nodeId}
          </Typography>

          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {/* Load State Badge */}
            {loadStatus === 'active' && (
              <Chip label="Active" color="success" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, height: 20, fontSize: '0.72rem' }} />
            )}
            {loadStatus === 'draining' && (
              <Chip label="Draining" color="warning" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, height: 20, fontSize: '0.72rem' }} />
            )}
            {loadStatus === 'drained' && (
              <Chip label="Drained" color="error" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, height: 20, fontSize: '0.72rem' }} />
            )}
            {loadStatus === 'unregistered' && (
              <Chip label="Unregistered" variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 500, height: 20, fontSize: '0.72rem' }} />
            )}

            {/* Raft Role Badge */}
            {isLeader && (
              <Chip
                icon={<StarIcon sx={{ fontSize: '0.85rem !important', color: '#ffb300' }} />}
                label="Leader"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 179, 0, 0.1)',
                  color: '#ffb300',
                  border: '1px solid rgba(255, 179, 0, 0.2)',
                  borderRadius: 1.5,
                }}
              />
            )}
            {!isLeader && raftRole === 'voter' && (
              <Chip
                label="Voter"
                color="primary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5, fontWeight: 600, height: 20, fontSize: '0.72rem' }}
              />
            )}
            {raftRole === 'learner' && (
              <Chip
                label="Learner"
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5, fontWeight: 600, height: 20, fontSize: '0.72rem' }}
              />
            )}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={2.5}>
          <HubIcon sx={{ fontSize: 16, opacity: 0.6 }} />
          {broker ? broker.broker_addr : 'Raft node only (not registered as broker)'}
        </Typography>

        {broker ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Topics Owned
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {broker.stats?.topics_owned ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Connections
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {broker.stats?.active_connections ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total RPCs (Rate)
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {broker.stats?.rpc_total ?? 0} ({(broker.stats?.rpc_rate_1m ?? 0).toFixed(1)}/s)
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: (broker.stats?.errors_5xx_total ?? 0) > 0 ? 'rgba(239, 83, 80, 0.08)' : 'action.hover',
                  borderRadius: '8px',
                  border: (broker.stats?.errors_5xx_total ?? 0) > 0 ? '1px solid rgba(239, 83, 80, 0.2)' : 'none',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  5xx Errors
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {(broker.stats?.errors_5xx_total ?? 0) > 0 && <ErrorOutlineIcon color="error" sx={{ fontSize: 16 }} />}
                  <Typography variant="body1" fontWeight="700" color={(broker.stats?.errors_5xx_total ?? 0) > 0 ? 'error.main' : 'inherit'}>
                    {broker.stats?.errors_5xx_total ?? 0}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '8px' }}>
            <Typography variant="caption" color="text.secondary">
              No load statistics available
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider />

      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: '0 0 12px 12px' }}>
        <Stack direction="row" justifyContent="space-between" gap={1}>
          {/* Load Manager Actions */}
          <Stack direction="row" gap={1}>
            <Tooltip title={activateTooltip}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<CheckIcon />}
                  disabled={!canActivate}
                  onClick={() => onActivate(nodeId)}
                  sx={{ borderRadius: '6px', px: 1.5 }}
                >
                  Activate
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={deactivateTooltip}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<MoveIcon />}
                  disabled={!canDeactivate}
                  onClick={() => onUnload(nodeId)}
                  sx={{ borderRadius: '6px', px: 1.5 }}
                >
                  Unload
                </Button>
              </span>
            </Tooltip>
          </Stack>

          {/* Raft Actions */}
          <Stack direction="row" gap={1}>
            {raftRole === 'learner' && (
              <Tooltip title={promoteTooltip}>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<ArrowUpwardIcon />}
                    disabled={!canPromote}
                    onClick={() => onPromote(nodeId)}
                    sx={{ borderRadius: '6px', px: 1.5 }}
                  >
                    Promote
                  </Button>
                </span>
              </Tooltip>
            )}

            {raftRole !== 'none' && (
              <Tooltip title={removeTooltip}>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={disableRemove}
                    onClick={() => onRemove(nodeId)}
                    sx={{ borderRadius: '6px', px: 1.5 }}
                  >
                    Remove
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
