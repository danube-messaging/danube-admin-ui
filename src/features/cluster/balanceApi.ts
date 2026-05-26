import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, postJson } from '../../lib/api';

export interface BrokerLoadInfo {
  broker_id: string;
  load: number;
  topic_count: number;
  is_overloaded: boolean;
  is_underloaded: boolean;
}

export interface ClusterBalanceInfo {
  coefficient_of_variation: number;
  mean_load: number;
  max_load: number;
  min_load: number;
  std_deviation: number;
  broker_count: number;
  assignment_strategy: string;
  brokers: BrokerLoadInfo[];
}

export interface ProposedMove {
  topic_name: string;
  from_broker: string;
  to_broker: string;
  estimated_load: number;
  reason: string;
}

export interface RebalanceResponse {
  success: boolean;
  moves_executed: number;
  proposed_moves: ProposedMove[];
  error_message: string;
}

export interface RebalanceRequest {
  dry_run?: boolean;
  max_moves?: number;
}

export function useClusterBalance() {
  return useQuery<ClusterBalanceInfo>({
    queryKey: ['cluster-balance'],
    queryFn: () => fetcher('/ui/v1/cluster/balance'),
    refetchInterval: 10000,
  });
}

export function useTriggerRebalance() {
  const queryClient = useQueryClient();
  return useMutation<RebalanceResponse, Error, RebalanceRequest>({
    mutationFn: (body) => postJson<RebalanceResponse>('/ui/v1/cluster/rebalance', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster-balance'] });
      queryClient.invalidateQueries({ queryKey: ['cluster-page'] });
    },
  });
}
