import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface Topic {
  name: string;
  type_schema: string;
  schema_data: string; // base64 encoded
  subscriptions: string[];
}

export interface TopicMetrics {
  msg_in_total: number;
  msg_out_total: number;
  msg_backlog: number;
  storage_bytes: number;
  producers: number;
  consumers: number;
  publish_rate_1m: number;
  dispatch_rate_1m: number;
}

export interface TopicPageData {
  timestamp: string;
  topic: Topic;
  metrics: TopicMetrics;
  errors: string[];
}

export const useTopicPage = (topicName: string | undefined) => {
  return useQuery<TopicPageData>({
    queryKey: ['topic', topicName],
    queryFn: () => {
      if (!topicName) {
        return Promise.reject(new Error('Topic name is required'));
      }
      return fetcher<TopicPageData>(`/ui/v1/topics/${encodeURIComponent(topicName)}`);
    },
    enabled: !!topicName,
    refetchInterval: 5000,
    staleTime: 3000,
  });
};
