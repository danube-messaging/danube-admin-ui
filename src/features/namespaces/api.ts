import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/api';

export interface NamespaceInfo {
  name: string;
  topics: string[];
  policies: string; // JSON string
}

export interface NamespacesResponse {
  timestamp: string;
  namespaces: NamespaceInfo[];
  errors: string[];
}

const NAMESPACES_KEY = 'namespacesList';

export const useNamespaces = () => {
  return useQuery<NamespacesResponse>({
    queryKey: [NAMESPACES_KEY],
    queryFn: () => fetcher<NamespacesResponse>('/ui/v1/namespaces'),
    refetchInterval: 10000,
    staleTime: 5000,
  });
};
