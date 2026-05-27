import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import SecurityIcon from '@mui/icons-material/ShieldOutlined';
import { useRoles, useBindings, useRoleAction, useBindingAction } from '../features/cluster/securityApi';
import { SkeletonNamespacesPage } from '../components/common/SkeletonLoader';
import { ErrorFallback } from '../components/common/ErrorFallback';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AVAILABLE_PERMISSIONS = [
  'Lookup',
  'Produce',
  'Consume',
  'Replicate',
  'ManageNamespace',
  'ManageTopic',
  'ManageSchema',
  'ManageBroker',
  'ManageCluster',
];

export const SecurityPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Queries
  const { data: rolesData, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles();
  const { data: bindingsData, isLoading: bindingsLoading, error: bindingsError, refetch: refetchBindings } = useBindings();

  // Mutations
  const createRoleMutation = useRoleAction();
  const createBindingMutation = useBindingAction();

  // Modals state
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createBindingOpen, setCreateBindingOpen] = useState(false);

  // Role Form State
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleFormError, setRoleFormError] = useState('');

  // Binding Form State
  const [bindingId, setBindingId] = useState('');
  const [principalType, setPrincipalType] = useState('service_account');
  const [principalName, setPrincipalName] = useState('');
  const [bindingScope, setBindingScope] = useState('cluster');
  const [bindingResource, setBindingResource] = useState('');
  const [bindingRoles, setBindingRoles] = useState<string[]>([]);
  const [bindingFormError, setBindingFormError] = useState('');

  // Delete Confirmations State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'role' | 'binding'; id: string; scope?: string; resource?: string } | null>(null);

  if (rolesLoading || bindingsLoading) {
    return <SkeletonNamespacesPage />;
  }

  if (rolesError || bindingsError) {
    const errMessage = String(rolesError?.message || bindingsError?.message || 'Failed to fetch security information.');
    return (
      <ErrorFallback
        message={errMessage}
        onRetry={() => {
          refetchRoles();
          refetchBindings();
        }}
      />
    );
  }

  const roles = rolesData?.roles || [];
  const bindings = bindingsData?.bindings || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Permission chips colors
  const getPermissionColor = (perm: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (perm === 'Produce' || perm === 'Consume') return 'success';
    if (perm === 'Lookup' || perm === 'Replicate') return 'info';
    if (perm.startsWith('ManageNamespace') || perm.startsWith('ManageTopic')) return 'warning';
    if (perm.startsWith('ManageSchema')) return 'secondary';
    return 'primary';
  };

  // Scope chips colors
  const getScopeColor = (scope: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (scope === 'cluster') return 'primary';
    if (scope === 'namespace') return 'success';
    return 'warning';
  };

  // Handle Role Creation
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError('');
    if (!roleName.trim()) {
      setRoleFormError('Role name is required.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setRoleFormError('At least one permission must be selected.');
      return;
    }

    try {
      await createRoleMutation.mutateAsync({
        action: 'create',
        name: roleName.trim(),
        permissions: selectedPermissions,
      });
      setCreateRoleOpen(false);
      setRoleName('');
      setSelectedPermissions([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRoleFormError(msg);
    }
  };

  // Handle Binding Creation
  const handleCreateBinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBindingFormError('');
    if (!bindingId.trim()) {
      setBindingFormError('Binding ID is required.');
      return;
    }
    if (!principalName.trim()) {
      setBindingFormError('Principal name is required.');
      return;
    }
    if (bindingRoles.length === 0) {
      setBindingFormError('At least one role must be selected.');
      return;
    }
    if (bindingScope !== 'cluster' && !bindingResource.trim()) {
      setBindingFormError(`Resource name is required for ${bindingScope} scope.`);
      return;
    }

    try {
      await createBindingMutation.mutateAsync({
        action: 'create',
        id: bindingId.trim(),
        principal_type: principalType,
        principal_name: principalName.trim(),
        roles: bindingRoles,
        scope: bindingScope,
        resource: bindingScope === 'cluster' ? '' : bindingResource.trim(),
      });
      setCreateBindingOpen(false);
      setBindingId('');
      setPrincipalName('');
      setBindingResource('');
      setBindingRoles([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setBindingFormError(msg);
    }
  };

  // Trigger Delete Confirmation
  const confirmDelete = (type: 'role' | 'binding', id: string, scope?: string, resource?: string) => {
    setDeleteTarget({ type, id, scope, resource });
    setDeleteConfirmOpen(true);
  };

  // Execute Delete
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'role') {
        await createRoleMutation.mutateAsync({
          action: 'delete',
          name: deleteTarget.id,
        });
      } else {
        await createBindingMutation.mutateAsync({
          action: 'delete',
          id: deleteTarget.id,
          scope: deleteTarget.scope || 'cluster',
          resource: deleteTarget.resource,
        });
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handlePermissionToggle = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            Security & RBAC
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (tabValue === 0) {
              setCreateRoleOpen(true);
            } else {
              setCreateBindingOpen(true);
            }
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
        >
          {tabValue === 0 ? 'Create Role' : 'Create Binding'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="security tabs">
          <Tab
            label="Roles"
            id="security-tab-0"
            aria-controls="security-tabpanel-0"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label="Bindings"
            id="security-tab-1"
            aria-controls="security-tabpanel-1"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Panel 1: Roles */}
      <TabPanel value={tabValue} index={0}>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">System</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No roles found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.name} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{role.name}</TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.75}>
                            {role.permissions.map((p) => (
                              <Chip
                                key={p}
                                label={p}
                                size="small"
                                color={getPermissionColor(p)}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {role.system ? (
                            <Chip label="System" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            disabled={role.system}
                            onClick={() => confirmDelete('role', role.name)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab Panel 2: Bindings */}
      <TabPanel value={tabValue} index={1}>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Binding ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Principal</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Granted Roles</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Resource Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bindings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No bindings found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bindings.map((b) => (
                      <TableRow key={b.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{b.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {b.principal_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {b.principal_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={b.scope.toUpperCase()}
                            size="small"
                            color={getScopeColor(b.scope)}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.75}>
                            {b.role_names.map((r) => (
                              <Chip key={r} label={r} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                          {b.resource_name || <Typography variant="caption" color="text.secondary">—</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => confirmDelete('binding', b.id, b.scope, b.resource_name)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog: Create Role */}
      <Dialog open={createRoleOpen} onClose={() => setCreateRoleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New RBAC Role</DialogTitle>
        <form onSubmit={handleCreateRole}>
          <DialogContent>
            {roleFormError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {roleFormError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Role Name"
              type="text"
              fullWidth
              variant="outlined"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              sx={{ mb: 3 }}
            />
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Permissions
              </FormLabel>
              <FormGroup>
                <Grid container spacing={1}>
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <Grid size={{ xs: 6 }} key={perm}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(perm)}
                            onChange={() => handlePermissionToggle(perm)}
                          />
                        }
                        label={perm}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateRoleOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={createRoleMutation.isPending}>
              Create Role
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Create Binding */}
      <Dialog open={createBindingOpen} onClose={() => setCreateBindingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create Role Binding</DialogTitle>
        <form onSubmit={handleCreateBinding}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {bindingFormError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {bindingFormError}
              </Alert>
            )}
            <TextField
              autoFocus
              label="Binding ID"
              variant="outlined"
              fullWidth
              value={bindingId}
              onChange={(e) => setBindingId(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Principal Type</InputLabel>
                  <Select
                    value={principalType}
                    label="Principal Type"
                    onChange={(e) => setPrincipalType(e.target.value)}
                  >
                    <MenuItem value="service_account">Service Account</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Principal Name"
                  variant="outlined"
                  fullWidth
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Scope</InputLabel>
              <Select
                value={bindingScope}
                label="Scope"
                onChange={(e) => setBindingScope(e.target.value)}
              >
                <MenuItem value="cluster">Cluster</MenuItem>
                <MenuItem value="namespace">Namespace</MenuItem>
                <MenuItem value="topic">Topic</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Resource Name"
              variant="outlined"
              fullWidth
              disabled={bindingScope === 'cluster'}
              placeholder={
                bindingScope === 'cluster'
                  ? 'N/A (Cluster Scope)'
                  : bindingScope === 'namespace'
                  ? 'e.g. default'
                  : 'e.g. /default/my-topic'
              }
              value={bindingScope === 'cluster' ? '' : bindingResource}
              onChange={(e) => setBindingResource(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={bindingRoles}
                label="Roles"
                onChange={(e) => setBindingRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.name} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateBindingOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={createBindingMutation.isPending}>
              Create Binding
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {deleteTarget?.type} <strong>{deleteTarget?.id}</strong>?
            This action is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteExecute} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
