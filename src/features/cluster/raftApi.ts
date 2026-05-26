import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, postJson } from '../../lib/api';

export interface RaftStatus {
  leader_id: string;
  current_term: number;
  last_applied: number;
  voters: string[];
  learners: string[];
  self_node_id: string;
  raft_addr: string;
}

export function useRaftStatus() {
  return useQuery<RaftStatus>({
    queryKey: ['raft-status'],
    queryFn: () => fetcher('/ui/v1/cluster/raft'),
    refetchInterval: 5000,
  });
}

export interface RaftActionResponse {
  success: boolean;
  message: string;
}

export function useRaftAction() {
  const queryClient = useQueryClient();
  return useMutation<RaftActionResponse, Error, { action: 'promote_node' | 'remove_node'; node_id: string }>({
    mutationFn: (body) =>
      postJson<RaftActionResponse>('/ui/v1/cluster/raft/actions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raft-status'] });
      queryClient.invalidateQueries({ queryKey: ['cluster-page'] });
    },
  });
}


