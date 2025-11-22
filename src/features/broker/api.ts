import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface BrokerIdentity {
  broker_id: string;
  broker_addr: string;
  broker_role: string;
}

export interface BrokerMetrics {
  rpc_total: number;
  rpc_rate_1m: number;
  topics_owned: number;
  producers_connected: number;
  consumers_connected: number;
  inbound_bytes_total: number;
  outbound_bytes_total: number;
  errors_5xx_total: number;
}

export interface BrokerTopic {
  name: string;
  delivery: string;
  producers_connected: number;
  consumers_connected: number;
  subscriptions: number;
}

export interface BrokerPageData {
  timestamp: string;
  broker: BrokerIdentity;
  metrics: BrokerMetrics;
  topics: BrokerTopic[];
  errors: string[];
}

export const useBrokerPage = (brokerId: string | undefined) => {
  return useQuery<BrokerPageData>({
    queryKey: ['broker', brokerId],
    queryFn: () => fetcher<BrokerPageData>(`/ui/v1/brokers/${brokerId}`),
    enabled: !!brokerId,
  });
};
