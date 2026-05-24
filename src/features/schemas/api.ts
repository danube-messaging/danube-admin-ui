import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, postJson } from '../../lib/api';

export interface SchemaSummary {
  subject: string;
  schema_type: string;
  latest_version: number;
  compatibility_mode: string;
  schema_id: number;
  tags: string[];
}

export interface SchemasListResponse {
  timestamp: string;
  subjects: SchemaSummary[];
}

export interface SchemaVersionInfo {
  version: number;
  created_at: number;
  created_by: string;
  description: string;
  fingerprint: string;
  schema_id: number;
}

export interface SchemaDetail {
  schema_id: number;
  version: number;
  subject: string;
  schema_type: string;
  schema_definition: string;
  description: string;
  created_at: number;
  created_by: string;
  tags: string[];
  fingerprint: string;
  compatibility_mode: string;
}

export interface SchemaDetailPageResponse {
  timestamp: string;
  subject: string;
  schema_type: string;
  compatibility_mode: string;
  latest: SchemaDetail | null;
  versions: SchemaVersionInfo[];
}

export interface SchemaActionRequest {
  action: 'set_compatibility' | 'delete_version';
  subject: string;
  compatibility_mode?: string;
  version?: number;
}

export interface SchemaActionResponse {
  success: boolean;
  message: string;
}

const SCHEMAS_KEY = 'schemasList';
const SCHEMA_DETAIL_KEY = 'schemaDetail';

export const useSchemasList = () => {
  return useQuery<SchemasListResponse>({
    queryKey: [SCHEMAS_KEY],
    queryFn: () => fetcher<SchemasListResponse>('/ui/v1/schemas'),
    refetchInterval: 10000,
    staleTime: 5000,
  });
};

export const useSchemaDetail = (subject: string | undefined) => {
  return useQuery<SchemaDetailPageResponse>({
    queryKey: [SCHEMA_DETAIL_KEY, subject],
    queryFn: () => {
      if (!subject) {
        return Promise.reject(new Error('Subject is required'));
      }
      return fetcher<SchemaDetailPageResponse>(`/ui/v1/schemas/${encodeURIComponent(subject)}`);
    },
    enabled: !!subject,
    refetchInterval: 10000,
    staleTime: 5000,
  });
};

export const useSchemaAction = () => {
  const queryClient = useQueryClient();
  return useMutation<SchemaActionResponse, Error, SchemaActionRequest>({
    mutationFn: (body) => postJson<SchemaActionResponse, SchemaActionRequest>('/ui/v1/schemas/actions', body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SCHEMAS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SCHEMA_DETAIL_KEY, variables.subject] });
    },
  });
};
