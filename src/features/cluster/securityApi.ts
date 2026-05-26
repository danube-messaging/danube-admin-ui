import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, postJson } from '../../lib/api';

export interface Role {
  name: string;
  permissions: string[];
  system: boolean;
}

export interface RolesResponse {
  roles: Role[];
}

export interface Binding {
  id: string;
  principal_type: string;
  principal_name: string;
  role_names: string[];
  scope: string;
  resource_name: string;
}

export interface BindingsResponse {
  bindings: Binding[];
}

export function useRoles() {
  return useQuery<RolesResponse>({
    queryKey: ['security-roles'],
    queryFn: () => fetcher('/ui/v1/security/roles'),
    refetchInterval: 30000,
  });
}

export function useBindings() {
  return useQuery<BindingsResponse>({
    queryKey: ['security-bindings'],
    queryFn: () => fetcher('/ui/v1/security/bindings'),
    refetchInterval: 30000,
  });
}

export function useRoleAction() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { action: 'create' | 'delete'; name: string; permissions?: string[] }>({
    mutationFn: (body) => postJson<{ success: boolean }>('/ui/v1/security/roles/actions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-roles'] });
    },
  });
}

export function useBindingAction() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, {
    action: 'create' | 'delete';
    id: string;
    principal_type?: string;
    principal_name?: string;
    roles?: string[];
    scope: string;
    resource?: string;
  }>({
    mutationFn: (body) => postJson<{ success: boolean }>('/ui/v1/security/bindings/actions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-bindings'] });
    },
  });
}
