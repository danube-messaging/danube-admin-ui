import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface SubscriptionFailurePolicy {
  max_redelivery_count: number;
  ack_timeout_ms: number;
  base_redelivery_delay_ms: number;
  max_redelivery_delay_ms: number;
  backoff_strategy: string; // "fixed" | "exponential"
  dead_letter_topic?: string;
  poison_policy: string; // "dead_letter" | "block" | "drop"
}

export interface SubscriptionDetail {
  name: string;
  subscription_type: string;
  failure_policy?: SubscriptionFailurePolicy | null;
}

export interface Topic {
  name: string;
  schema_subject?: string;
  schema_id?: number;
  schema_version?: number;
  schema_type?: string;
  compatibility_mode?: string;
  subscriptions: SubscriptionDetail[];
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
