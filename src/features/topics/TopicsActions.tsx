import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Button,
  Snackbar,
  Typography,
} from '@mui/material';
import { postJson } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export interface UseTopicActionsOptions {
  invalidateKeys?: Array<unknown>;
}

export const useTopicActions = (options?: UseTopicActionsOptions) => {
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openUnload, setOpenUnload] = React.useState<{ open: boolean; topic: string } | null>(null);
  const [openDelete, setOpenDelete] = React.useState<{ open: boolean; topic: string } | null>(null);

  const [form, setForm] = React.useState<any>({
    topic: '',
    namespace: '',
    partitions: '',
    schema_type: 'String',
    schema_data: '{}',
    dispatch_strategy: 'non_reliable',
    _tmpUnloadNs: '',
    _tmpDeleteNs: '',
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['topicsList'] });
    for (const k of options?.invalidateKeys || []) {
      await queryClient.invalidateQueries({ queryKey: k as any });
    }
  };

  const CreateDialog = (
    <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Create Topic</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Topic"
            value={form.topic}
            onChange={(e) => setForm((s: any) => ({ ...s, topic: e.target.value }))}
            helperText="Use '/namespace/topic' or provide Namespace below"
            fullWidth
          />
          <TextField
            label="Namespace (optional)"
            value={form.namespace}
            onChange={(e) => setForm((s: any) => ({ ...s, namespace: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Partitions (optional)"
            type="number"
            inputProps={{ min: 0 }}
            value={form.partitions}
            onChange={(e) => setForm((s: any) => ({ ...s, partitions: e.target.value }))}
            fullWidth
          />
          <TextField
            select
            label="Dispatch Strategy"
            value={form.dispatch_strategy}
            onChange={(e) => setForm((s: any) => ({ ...s, dispatch_strategy: e.target.value }))}
            fullWidth
          >
            <MenuItem value="non_reliable">non_reliable</MenuItem>
            <MenuItem value="reliable">reliable</MenuItem>
          </TextField>
          <TextField
            select
            label="Schema Type"
            value={form.schema_type}
            onChange={(e) => setForm((s: any) => ({ ...s, schema_type: e.target.value }))}
            fullWidth
          >
            <MenuItem value="String">String</MenuItem>
            <MenuItem value="Bytes">Bytes</MenuItem>
            <MenuItem value="Int64">Int64</MenuItem>
            <MenuItem value="Json">Json</MenuItem>
          </TextField>
          <TextField
            label="Schema Data (JSON)"
            value={form.schema_data}
            onChange={(e) => setForm((s: any) => ({ ...s, schema_data: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const body: any = {
                action: 'create',
                topic: form.topic,
                schema_type: form.schema_type,
                dispatch_strategy: form.dispatch_strategy,
              };
              if (form.namespace) body.namespace = form.namespace;
              if (form.partitions) body.partitions = Number(form.partitions);
              if (form.schema_data) body.schema_data = form.schema_data;
              const resp = await postJson<{ success: boolean; message: string }>(
                '/ui/v1/topics/actions',
                body,
              );
              setSnackbar({ open: true, message: resp.message || 'Created', severity: 'success' });
              setOpenCreate(false);
              await invalidate();
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Failed to create topic', severity: 'error' });
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );

  const UnloadDialog = (
    <Dialog open={!!openUnload?.open} onClose={() => setOpenUnload(null)} maxWidth="xs" fullWidth>
      <DialogTitle>Move Topic</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>Are you sure you want to move this topic to another broker?</Typography>
          <TextField label="Topic" value={openUnload?.topic || ''} InputProps={{ readOnly: true }} fullWidth />
          {!String(openUnload?.topic || '').startsWith('/') && (
            <TextField
              label="Namespace"
              value={form._tmpUnloadNs || ''}
              onChange={(e) => setForm((s: any) => ({ ...s, _tmpUnloadNs: e.target.value }))}
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenUnload(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={async () => {
            try {
              const needsNs = !String(openUnload?.topic || '').startsWith('/');
              const body: any = {
                action: 'unload',
                topic: openUnload?.topic,
              };
              if (needsNs && form._tmpUnloadNs) body.namespace = form._tmpUnloadNs;
              const resp = await postJson<{ success: boolean; message: string }>(
                '/ui/v1/topics/actions',
                body,
              );
              setSnackbar({ open: true, message: resp.message || 'Moved', severity: 'success' });
              setOpenUnload(null);
              await invalidate();
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Failed to move topic', severity: 'error' });
            }
          }}
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );

  const DeleteDialog = (
    <Dialog open={!!openDelete?.open} onClose={() => setOpenDelete(null)} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Topic</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>Are you sure you want to permanently delete this topic?</Typography>
          <TextField label="Topic" value={openDelete?.topic || ''} InputProps={{ readOnly: true }} fullWidth />
          {!String(openDelete?.topic || '').startsWith('/') && (
            <TextField
              label="Namespace"
              value={form._tmpDeleteNs || ''}
              onChange={(e) => setForm((s: any) => ({ ...s, _tmpDeleteNs: e.target.value }))}
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDelete(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            try {
              const needsNs = !String(openDelete?.topic || '').startsWith('/');
              const body: any = {
                action: 'delete',
                topic: openDelete?.topic,
              };
              if (needsNs && form._tmpDeleteNs) body.namespace = form._tmpDeleteNs;
              const resp = await postJson<{ success: boolean; message: string }>(
                '/ui/v1/topics/actions',
                body,
              );
              setSnackbar({ open: true, message: resp.message || 'Deleted', severity: 'success' });
              setOpenDelete(null);
              await invalidate();
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Failed to delete topic', severity: 'error' });
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const Dialogs = (
    <>
      {CreateDialog}
      {UnloadDialog}
      {DeleteDialog}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </>
  );

  return {
    openCreateDialog: () => setOpenCreate(true),
    openUnloadDialog: (topic: string) => setOpenUnload({ open: true, topic }),
    openDeleteDialog: (topic: string) => setOpenDelete({ open: true, topic }),
    Dialogs,
  } as const;
};
