import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface BrokerIdentity {
  broker_id: string;
  broker_addr: string;
  broker_role: string;
  broker_status: string;
}

export interface BrokerTopicMini {
  name: string;
  delivery: string;
  producers_connected: number;
  consumers_connected: number;
  subscriptions: number;
}

export interface BrokerWithTopics {
  broker: BrokerIdentity;
  topics: BrokerTopicMini[];
}

export interface TopicsResponse {
  timestamp: string;
  brokers: BrokerWithTopics[];
  errors: string[];
}

export interface TopicRow {
  id: string;
  broker_id: string;
  name: string;
  delivery: string;
  producers: number;
  subscriptions: number;
  consumers: number;
}

const TOPICS_LIST_KEY = 'topicsList';

export const useTopicsList = () => {
  return useQuery<{ rows: TopicRow[]; errors: string[]; timestamp: string }>({
    queryKey: [TOPICS_LIST_KEY],
    queryFn: async () => {
      const data = await fetcher<TopicsResponse>('/ui/v1/topics');
      const rows: TopicRow[] = [];
      for (const b of data.brokers || []) {
        for (const t of b.topics || []) {
          rows.push({
            id: `${b.broker.broker_id}:${t.name}`,
            broker_id: b.broker.broker_id,
            name: t.name,
            delivery: t.delivery,
            producers: t.producers_connected,
            subscriptions: t.subscriptions,
            consumers: t.consumers_connected,
          });
        }
      }
      return { rows, errors: data.errors || [], timestamp: data.timestamp };
    },
    refetchInterval: 5000,
    staleTime: 3000,
  });
};
