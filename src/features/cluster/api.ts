import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface ClusterBrokerStats {
  topics_owned: number;
  rpc_total: number;
  rpc_rate_1m: number;
  active_connections: number;
  errors_5xx_total: number;
}

export interface ClusterBroker {
  broker_id: string;
  broker_addr: string;
  broker_role: string;
  stats: ClusterBrokerStats;
}

export interface ClusterTotals {
  broker_count: number;
  topics_total: number;
  rpc_total: number;
  active_connections: number;
}

export interface ClusterPageData {
  timestamp: string;
  brokers: ClusterBroker[];
  totals: ClusterTotals;
  errors: string[];
}

const CLUSTER_PAGE_KEY = 'clusterPage';

export const useClusterPage = () => {
  return useQuery<ClusterPageData>({
    queryKey: [CLUSTER_PAGE_KEY],
    queryFn: () => fetcher<ClusterPageData>('/ui/v1/cluster'),
  });
};
