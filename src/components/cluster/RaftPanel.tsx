import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider,
  Alert,
  Link,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import HubIcon from '@mui/icons-material/Hub';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useRaftStatus, useRaftAction } from '../../features/cluster/raftApi';
import type { RaftActionResponse } from '../../features/cluster/raftApi';
import { useToast } from '../common/ToastContext';

interface BrokerInfo {
  broker_id: string;
  broker_addr: string;
  broker_status?: string;
  broker_role: string;
}

interface RaftPanelProps {
  brokers: BrokerInfo[];
}

export const RaftPanel: React.FC<RaftPanelProps> = ({ brokers }) => {
  const { data: raft, isLoading, error } = useRaftStatus();
  const actionMutation = useRaftAction();
  const { showToast } = useToast();

  // Confirmation states
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
        <CircularProgress size={30} />
      </Paper>
    );
  }

  if (error || !raft) {
    return null; // hide panel silently if not supported or error
  }

  const handlePromote = async () => {
    if (!promoteId) return;
    actionMutation.mutate(
      { action: 'promote_node', node_id: promoteId },
      {
        onSuccess: (res: RaftActionResponse) => {
          if (res.success) {
            showToast(`Node ${promoteId} promoted to Voter successfully`, 'success');
          } else {
            showToast(`Failed to promote node: ${res.message}`, 'error');
          }
          setPromoteId(null);
        },
        onError: (err: Error) => {
          showToast(`Error promoting node: ${err.message}`, 'error');
          setPromoteId(null);
        },
      }
    );
  };

  const handleRemove = async () => {
    if (!removeId) return;
    actionMutation.mutate(
      { action: 'remove_node', node_id: removeId },
      {
        onSuccess: (res: RaftActionResponse) => {
          if (res.success) {
            showToast(`Node ${removeId} removed from cluster successfully`, 'success');
          } else {
            showToast(`Failed to remove node: ${res.message}`, 'error');
          }
          setRemoveId(null);
        },
        onError: (err: Error) => {
          showToast(`Error removing node: ${err.message}`, 'error');
          setRemoveId(null);
        },
      }
    );
  };

  // Truncate long IDs for cleaner display
  const truncateId = (id: string) => {
    return id;
  };

  // Helper to cross-reference with active brokers list
  const getBrokerMatch = (nodeId: string) => {
    return brokers.find((b) => b.broker_id === nodeId);
  };

  // Render a single member row
  const renderMemberRow = (nodeId: string, isLearner: boolean) => {
    const isLeader = raft.leader_id === nodeId;
    const isSelf = raft.self_node_id === nodeId;
    const broker = getBrokerMatch(nodeId);

    // Safety checks for removal:
    // Can only remove if the broker matches and its state is "drained" OR if it doesn't exist in the active brokers list (unregistered learner/offline node)
    const isBrokerActive = broker && broker.broker_status && (broker.broker_status.toLowerCase() === 'active' || broker.broker_status.toLowerCase() === 'draining');
    const disableRemove = isBrokerActive;
    const removeTooltip = isBrokerActive
      ? 'Cannot remove an Active or Draining broker. Migrate topics off this broker first.'
      : isLeader
      ? 'Removing the Leader is permitted but will trigger a cluster-wide election.'
      : 'Remove this node from Raft consensus';

    return (
      <Paper
        key={nodeId}
        variant="outlined"
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: '8px',
          borderColor: isLeader ? 'primary.main' : 'divider',
          borderLeft: isLeader ? '4px solid' : '1px solid',
          borderLeftColor: isLeader ? 'primary.main' : 'divider',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="subtitle2" fontWeight="700" fontFamily="monospace">
                {truncateId(nodeId)}
              </Typography>
              {isLeader && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.9rem', color: '#ffb300' }} />}
                  label="Leader"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 179, 0, 0.1)',
                    color: '#ffb300',
                    border: '1px solid rgba(255, 179, 0, 0.2)',
                  }}
                />
              )}
              {isSelf && (
                <Chip
                  label="Self"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                />
              )}
              {!broker && (
                <Chip
                  label="Unregistered"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: 'action.selected',
                    color: 'text.secondary',
                  }}
                />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {broker ? `Address: ${broker.broker_addr}` : `Raft Node ID: ${nodeId}`}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" gap={1.5}>
            {broker && broker.broker_status && (
              <Chip
                label={broker.broker_status}
                color={
                  broker.broker_status.toLowerCase() === 'active'
                    ? 'success'
                    : broker.broker_status.toLowerCase() === 'draining'
                    ? 'warning'
                    : 'error'
                }
                size="small"
                variant="filled"
                sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'capitalize' }}
              />
            )}

            <Stack direction="row" gap={0.5}>
              {isLearner && (
                <Tooltip title="Promote learner to a full voting member">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setPromoteId(nodeId)}
                    sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '6px' }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title={removeTooltip}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={!!disableRemove}
                    onClick={() => setRemoveId(nodeId)}
                    sx={{ border: '1px solid', borderColor: disableRemove ? 'action.disabledBackground' : 'error.main', borderRadius: '6px' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: '12px' }}>
      <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
        <HubIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight="700">
            Raft Consensus
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Consensus and cluster membership management
          </Typography>
        </Box>
      </Stack>

      <Alert 
        severity="info" 
        icon={<InfoIcon fontSize="small" />}
        sx={{ 
          mb: 3, 
          borderRadius: '8px',
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Review the{' '}
          <Link 
            href="https://danube-messaging.com/concepts/scaling/" 
            target="_blank" 
            rel="noopener" 
            sx={{ fontWeight: 600, textDecoration: 'underline' }}
          >
            Cluster Scaling Guide
          </Link>{' '}
          for cluster membership workflows:
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, mt: 1, mb: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
          <li>promoted nodes start in a <strong>drained</strong> state and must be manually activated/enabled</li>
          <li>removed nodes must be clean started to rejoin</li>
        </Box>
      </Alert>

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '8px' }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Election Term
            </Typography>
            <Typography variant="h5" fontWeight="700">
              {raft.current_term}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '8px' }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Last Applied Log Index
            </Typography>
            <Typography variant="h5" fontWeight="700">
              {raft.last_applied}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '8px' }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Cluster Leader
            </Typography>
            <Typography variant="h6" fontWeight="700" sx={{ fontFamily: 'monospace' }}>
              {truncateId(raft.leader_id)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
            Voters
            <Chip label={raft.voters.length} size="small" variant="outlined" sx={{ height: 20 }} />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {raft.voters.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No voting members found.
            </Typography>
          ) : (
            raft.voters.map((id) => renderMemberRow(id, false))
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
            Learners (Non-Voting)
            <Chip label={raft.learners.length} size="small" variant="outlined" sx={{ height: 20 }} />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {raft.learners.length === 0 ? (
            <Stack gap={1} justifyContent="center" alignItems="center" sx={{ minHeight: 100, border: '1px dashed', borderColor: 'divider', borderRadius: '8px', p: 2 }}>
              <InfoIcon sx={{ opacity: 0.4, fontSize: 24 }} />
              <Typography variant="caption" color="text.secondary">
                No learner nodes active in join mode
              </Typography>
            </Stack>
          ) : (
            raft.learners.map((id) => renderMemberRow(id, true))
          )}
        </Grid>
      </Grid>

      {/* Confirmation Dialog: Promote */}
      <Dialog open={!!promoteId} onClose={() => setPromoteId(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" /> Promote Node to Voter
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to promote node <strong style={{ fontFamily: 'monospace' }}>{promoteId}</strong> from Learner to Voter?
          </DialogContentText>
          <DialogContentText mt={1.5} variant="body2" color="text.secondary">
            Promoting a node adds it to the voting quorum. The load manager registers it in the <strong>drained</strong> state, and it will require manual activation to begin accepting topic allocations.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPromoteId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handlePromote} variant="contained" color="primary" disabled={actionMutation.isPending}>
            {actionMutation.isPending ? 'Promoting...' : 'Promote'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog: Remove */}
      <Dialog open={!!removeId} onClose={() => setRemoveId(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" /> Remove Node from Cluster
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently remove node <strong style={{ fontFamily: 'monospace' }}>{removeId}</strong> from the cluster?
          </DialogContentText>
          {removeId === raft.leader_id && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(239, 83, 80, 0.08)', borderRadius: 1, border: '1px solid rgba(239, 83, 80, 0.2)' }}>
              <Typography variant="caption" color="error" fontWeight="600" display="block">
                WARNING: Removing the current Leader will immediately trigger an election term restart and may temporarily disrupt cluster consensus operations.
              </Typography>
            </Box>
          )}
          <DialogContentText mt={1.5} variant="body2" color="text.secondary">
            This operation alters the Raft consensus group membership. Ensure you are not violating the minimum quorum requirements (e.g. 2 nodes for a 3-node cluster).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoveId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRemove} variant="contained" color="error" disabled={actionMutation.isPending}>
            {actionMutation.isPending ? 'Removing...' : 'Remove Node'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
