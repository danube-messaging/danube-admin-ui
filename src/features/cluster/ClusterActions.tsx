import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, Snackbar, Typography, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { postJson } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export interface UseClusterActionsOptions {
  invalidateKeys?: Array<unknown>;
}

export const useClusterActions = (options?: UseClusterActionsOptions) => {
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openUnload, setOpenUnload] = React.useState<{ open: boolean; broker_id: string } | null>(null);
  const [openActivate, setOpenActivate] = React.useState<{ open: boolean; broker_id: string } | null>(null);

  const [form, setForm] = React.useState<any>({
    max_parallel: '',
    namespaces_include: '',
    namespaces_exclude: '',
    dry_run: false,
    timeout_seconds: '60',
    reason: 'admin_activate',
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['clusterPage'] });
    for (const k of options?.invalidateKeys || []) {
      await queryClient.invalidateQueries({ queryKey: k as any });
    }
  };

  const UnloadDialog = (
    <Dialog open={!!openUnload?.open} onClose={() => setOpenUnload(null)} maxWidth="sm" fullWidth>
      <DialogTitle>Unload Broker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>Mark broker as draining and move its topics to available brokers.</Typography>
          <TextField label="Broker ID" value={openUnload?.broker_id || ''} InputProps={{ readOnly: true }} fullWidth />
          <TextField
            label="Max Parallel (optional)"
            type="number"
            inputProps={{ min: 1 }}
            value={form.max_parallel}
            onChange={(e) => setForm((s: any) => ({ ...s, max_parallel: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Namespaces Include (comma separated)"
            value={form.namespaces_include}
            onChange={(e) => setForm((s: any) => ({ ...s, namespaces_include: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Namespaces Exclude (comma separated)"
            value={form.namespaces_exclude}
            onChange={(e) => setForm((s: any) => ({ ...s, namespaces_exclude: e.target.value }))}
            fullWidth
          />
          <FormControlLabel
            control={<Checkbox checked={!!form.dry_run} onChange={(e) => setForm((s: any) => ({ ...s, dry_run: e.target.checked }))} />}
            label="Dry Run"
          />
          <TextField
            label="Timeout Seconds"
            type="number"
            inputProps={{ min: 1 }}
            value={form.timeout_seconds}
            onChange={(e) => setForm((s: any) => ({ ...s, timeout_seconds: e.target.value }))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenUnload(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={async () => {
            try {
              const body: any = {
                action: 'unload',
                broker_id: openUnload?.broker_id,
              };
              if (form.max_parallel) body.max_parallel = Number(form.max_parallel);
              if (String(form.namespaces_include || '').trim().length > 0) body.namespaces_include = String(form.namespaces_include).split(',').map((s: string) => s.trim()).filter(Boolean);
              if (String(form.namespaces_exclude || '').trim().length > 0) body.namespaces_exclude = String(form.namespaces_exclude).split(',').map((s: string) => s.trim()).filter(Boolean);
              if (form.dry_run) body.dry_run = true;
              if (form.timeout_seconds) body.timeout_seconds = Number(form.timeout_seconds);
              const resp = await postJson<{ success: boolean; message: string }>(
                '/ui/v1/cluster/actions',
                body,
              );
              setSnackbar({ open: true, message: resp.message || 'Unload started', severity: 'success' });
              setOpenUnload(null);
              await invalidate();
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Failed to unload broker', severity: 'error' });
            }
          }}
        >
          Unload
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ActivateDialog = (
    <Dialog open={!!openActivate?.open} onClose={() => setOpenActivate(null)} maxWidth="xs" fullWidth>
      <DialogTitle>Activate Broker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Broker ID" value={openActivate?.broker_id || ''} InputProps={{ readOnly: true }} fullWidth />
          <TextField label="Reason" value={form.reason} onChange={(e) => setForm((s: any) => ({ ...s, reason: e.target.value }))} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenActivate(null)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const body: any = {
                action: 'activate',
                broker_id: openActivate?.broker_id,
                reason: form.reason || 'admin_activate',
              };
              const resp = await postJson<{ success: boolean; message: string }>(
                '/ui/v1/cluster/actions',
                body,
              );
              setSnackbar({ open: true, message: resp.message || 'Broker activated', severity: 'success' });
              setOpenActivate(null);
              await invalidate();
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Failed to activate broker', severity: 'error' });
            }
          }}
        >
          Activate
        </Button>
      </DialogActions>
    </Dialog>
  );

  const Dialogs = (
    <>
      {UnloadDialog}
      {ActivateDialog}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </>
  );

  return {
    openUnloadDialog: (broker_id: string) => setOpenUnload({ open: true, broker_id }),
    openActivateDialog: (broker_id: string) => setOpenActivate({ open: true, broker_id }),
    Dialogs,
  } as const;
};
