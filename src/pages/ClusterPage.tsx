import React, { useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Link,
  Checkbox,
  FormControlLabel,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import SyncIcon from '@mui/icons-material/Sync';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TrafficIcon from '@mui/icons-material/SwapCallsOutlined';
import { useNavigate } from 'react-router-dom';
import { useClusterPage } from '../features/cluster/api';
import { useClusterActions } from '../features/cluster/ClusterActions';
import { useRaftStatus, useRaftAction } from '../features/cluster/raftApi';
import { useClusterBalance, useTriggerRebalance } from '../features/cluster/balanceApi';
import type { RebalanceResponse } from '../features/cluster/balanceApi';
import { useToast } from '../components/common/ToastContext';
import { SkeletonClusterPage } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';
import danubeLogo from '../assets/danube.png';
import { BrokerCard } from '../components/cluster/BrokerCard';

export const ClusterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useClusterPage();
  const { data: raft, isLoading: isRaftLoading, error: raftError } = useRaftStatus();

  const { openUnloadDialog, openActivateDialog, Dialogs } = useClusterActions();
  const raftActionMutation = useRaftAction();
  const { data: balance, error: balanceError } = useClusterBalance();
  const rebalanceMutation = useTriggerRebalance();

  const [isRebalanceDialogOpen, setIsRebalanceDialogOpen] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [maxMoves, setMaxMoves] = useState<number | ''>('');
  const [rebalanceResult, setRebalanceResult] = useState<RebalanceResponse | null>(null);
  const [isRebalanceExecuted, setIsRebalanceExecuted] = useState(false);

  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  if (isLoading || isRaftLoading) {
    return <SkeletonClusterPage />;
  }

  if (error || raftError) {
    const err = error || raftError;
    return <ErrorFallback message={err ? err.message : 'Error loading cluster state'} onRetry={refetch} />;
  }

  const { totals, brokers, errors } = data || {};

  const handlePromote = () => {
    if (!promoteId) return;
    raftActionMutation.mutate(
      { action: 'promote_node', node_id: promoteId },
      {
        onSuccess: (res) => {
          showToast(res.message || 'Node promoted successfully', 'success');
          setPromoteId(null);
        },
        onError: (err) => {
          showToast(`Error promoting node: ${err.message}`, 'error');
          setPromoteId(null);
        },
      }
    );
  };

  const handleRemove = () => {
    if (!removeId) return;
    raftActionMutation.mutate(
      { action: 'remove_node', node_id: removeId },
      {
        onSuccess: (res) => {
          showToast(res.message || 'Node removed successfully', 'success');
          setRemoveId(null);
        },
        onError: (err) => {
          showToast(`Error removing node: ${err.message}`, 'error');
          setRemoveId(null);
        },
      }
    );
  };

  const handleRebalance = () => {
    setIsRebalanceExecuted(false);
    setRebalanceResult(null);
    rebalanceMutation.mutate(
      {
        dry_run: dryRun,
        max_moves: maxMoves === '' ? undefined : Number(maxMoves),
      },
      {
        onSuccess: (res) => {
          setRebalanceResult(res);
          setIsRebalanceExecuted(true);
          if (res.success) {
            showToast(
              dryRun
                ? 'Dry run rebalance calculated successfully'
                : `Cluster rebalanced successfully: ${res.moves_executed} moves executed`,
              'success'
            );
          } else {
            showToast(`Rebalance failed: ${res.error_message}`, 'error');
          }
        },
        onError: (err) => {
          showToast(`Error during rebalancing: ${err.message}`, 'error');
        },
      }
    );
  };

  // Get list of all unique Node IDs present in either active brokers list or Raft consensus list
  const allNodeIds = Array.from(
    new Set([
      ...(brokers || []).map((b) => b.broker_id),
      ...(raft?.voters || []),
      ...(raft?.learners || []),
    ])
  );

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
          {/* Header section with Logo & Title */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              component="img"
              src={danubeLogo}
              alt="Danube Logo"
              sx={{
                height: 40,
                width: 40,
                borderRadius: '8px',
                filter: 'drop-shadow(0 0 12px var(--danube-palette-primary-main))',
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Danube Cluster
            </Typography>
          </Box>

          {/* Consolidated General Info Panels */}
          <Grid container spacing={3} mb={3}>
            {/* Card 1: Load Manager Info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                    <EqualizerIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Load Manager Info
                    </Typography>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Brokers Count
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {totals?.broker_count ?? 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Total Topics
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {totals?.topics_total ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Traffic & Connectivity */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                    <TrafficIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Traffic & Connectivity
                    </Typography>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Total RPCs
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {totals?.rpc_total ?? 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Active Connections
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {totals?.active_connections ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: Raft Consensus */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', boxSizing: 'border-box' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                    <SyncIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      Raft Consensus Health
                    </Typography>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Election Term
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {raft?.current_term ?? 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last Applied Index
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {raft?.last_applied ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Scaling Information Alert Banner */}
          {/* Cluster Nodes Section */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Cluster Nodes
          </Typography>

          <Grid container spacing={3} mb={4}>
            {allNodeIds.map((id) => {
              const broker = brokers?.find((b) => b.broker_id === id);
              const isLeader = id === raft?.leader_id;
              const raftRole = raft?.voters.includes(id)
                ? 'voter'
                : raft?.learners.includes(id)
                  ? 'learner'
                  : 'none';

              return (
                <Grid size={{ xs: 12, md: 6 }} key={id}>
                  <BrokerCard
                    nodeId={id}
                    broker={broker}
                    isLeader={isLeader}
                    raftRole={raftRole}
                    onActivate={openActivateDialog}
                    onUnload={openUnloadDialog}
                    onPromote={(nodeId) => setPromoteId(nodeId)}
                    onRemove={(nodeId) => setRemoveId(nodeId)}
                    onNavigate={(nodeId) => navigate(`/brokers/${nodeId}`)}
                  />
                </Grid>
              );
            })}
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
              <Button onClick={handlePromote} variant="contained" color="primary" disabled={raftActionMutation.isPending}>
                {raftActionMutation.isPending ? 'Promoting...' : 'Promote'}
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
              {removeId === raft?.leader_id && (
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
              <Button onClick={handleRemove} variant="contained" color="error" disabled={raftActionMutation.isPending}>
                {raftActionMutation.isPending ? 'Removing...' : 'Remove Node'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Scaling Information Alert Banner */}
          <Alert
            severity="info"
            icon={<InfoIcon fontSize="small" />}
            sx={{
              mt: 2,
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

          {/* Load Balancing & Rebalancing Section */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 4, mb: 3 }}>
            Load Balancing & Traffic Distribution
          </Typography>

          {balanceError ? (
            <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
              Error loading cluster balance metrics: {balanceError.message}
            </Alert>
          ) : !balance ? (
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={30} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Scraping cluster balance metrics...
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="subtitle1" fontWeight="700" mb={1.5} display="flex" alignItems="center" gap={1}>
                      <EqualizerIcon color="primary" /> Balance Health Score
                    </Typography>

                    <Box sx={{ mb: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="500">
                          Imbalance Index (CV)
                        </Typography>
                        <Chip
                          label={
                            balance.coefficient_of_variation < 0.15
                              ? 'Well Balanced'
                              : balance.coefficient_of_variation < 0.4
                                ? 'Moderately Imbalanced'
                                : 'Highly Imbalanced'
                          }
                          color={
                            balance.coefficient_of_variation < 0.15
                              ? 'success'
                              : balance.coefficient_of_variation < 0.4
                                ? 'warning'
                                : 'error'
                          }
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, balance.coefficient_of_variation * 100)}
                        color={
                          balance.coefficient_of_variation < 0.15
                            ? 'success'
                            : balance.coefficient_of_variation < 0.4
                              ? 'warning'
                              : 'error'
                        }
                        sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Coefficient of Variation: <strong>{balance.coefficient_of_variation.toFixed(3)}</strong> (0.0 = perfect balance)
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Active Assignment Strategy</Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ textTransform: 'capitalize' }}>
                          {balance.assignment_strategy || 'Balanced'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Mean Load (topics/broker)</Typography>
                        <Typography variant="body2" fontWeight="700">{balance.mean_load.toFixed(1)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Standard Deviation</Typography>
                        <Typography variant="body2" fontWeight="700">{balance.std_deviation.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Min / Max Load</Typography>
                        <Typography variant="body2" fontWeight="700">{balance.min_load} / {balance.max_load} topics</Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SyncIcon />}
                        fullWidth
                        onClick={() => {
                          setDryRun(true);
                          setMaxMoves('');
                          setRebalanceResult(null);
                          setIsRebalanceExecuted(false);
                          setIsRebalanceDialogOpen(true);
                        }}
                      >
                        Trigger Cluster Rebalance
                      </Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle1" fontWeight="700" mb={2}>
                      Broker Load Distribution
                    </Typography>
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', maxHeight: 250 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Broker ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Topics (Load)</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Relative Load</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {balance.brokers.map((br) => {
                            const maxLoad = Math.max(1, balance.max_load);
                            const percentage = (br.topic_count / maxLoad) * 100;
                            return (
                              <TableRow key={br.broker_id}>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{br.broker_id}</TableCell>
                                <TableCell align="right">{br.topic_count}</TableCell>
                                <TableCell align="right" sx={{ width: '40%' }}>
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <LinearProgress variant="determinate" value={percentage} sx={{ height: 6, borderRadius: 3 }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ minWidth: 24 }}>
                                      {Math.round(percentage)}%
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">
                                  {br.is_overloaded ? (
                                    <Chip label="Overloaded" color="error" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                                  ) : br.is_underloaded ? (
                                    <Chip label="Underloaded" color="warning" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                                  ) : (
                                    <Chip label="Normal" color="success" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Dialog: Trigger Rebalance */}
          <Dialog open={isRebalanceDialogOpen} onClose={() => setIsRebalanceDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SyncIcon color="primary" /> Trigger Cluster Rebalance
            </DialogTitle>
            <DialogContent>
              {!isRebalanceExecuted ? (
                <>
                  <DialogContentText>
                    Rebalancing distributes topics/partitions evenly across active brokers based on the current balancing metrics.
                  </DialogContentText>
                  <Stack spacing={2.5} sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dryRun}
                          onChange={(e) => setDryRun(e.target.checked)}
                        />
                      }
                      label="Dry Run (only preview proposed topic moves without executing them)"
                    />
                    <TextField
                      label="Max Topic Moves (Optional)"
                      type="number"
                      value={maxMoves}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMaxMoves(val === '' ? '' : Number(val));
                      }}
                      helperText="Limit the number of topic partitions migrated in this operation"
                      fullWidth
                      size="small"
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Stack>
                </>
              ) : (
                <Box>
                  {rebalanceResult?.success ? (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {dryRun
                        ? 'Dry run completed. Review the proposed topic moves below:'
                        : `Rebalance executed successfully! Moves completed: ${rebalanceResult.moves_executed}`}
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Rebalance failed: {rebalanceResult?.error_message || 'Unknown error'}
                    </Alert>
                  )}

                  <Typography variant="subtitle2" fontWeight="700" mb={1}>
                    Proposed Topic Moves ({rebalanceResult?.proposed_moves.length || 0})
                  </Typography>

                  {rebalanceResult && rebalanceResult.proposed_moves.length > 0 ? (
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', maxHeight: 250 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Topic Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Source Broker</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Destination Broker</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Est. Load</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rebalanceResult.proposed_moves.map((move, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{move.topic_name}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{move.from_broker}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{move.to_broker}</TableCell>
                              <TableCell align="right">{move.estimated_load.toFixed(1)}</TableCell>
                              <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{move.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No topic moves are proposed. The cluster is already balanced.
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setIsRebalanceDialogOpen(false)} color="inherit">
                Close
              </Button>
              {!isRebalanceExecuted && (
                <Button
                  onClick={handleRebalance}
                  variant="contained"
                  color={dryRun ? 'primary' : 'warning'}
                  disabled={rebalanceMutation.isPending}
                >
                  {rebalanceMutation.isPending
                    ? 'Processing...'
                    : dryRun
                      ? 'Calculate Proposed Moves'
                      : 'Execute Rebalance'}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {Dialogs}
        </>
      )}
    </Box>
  );
};
