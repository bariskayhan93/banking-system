export enum GraphLabel {
  // Vertex labels
  PERSON = 'person',
}

export enum GraphEdge {
  // Edge labels
  HAS_FRIEND = 'has_friend',
}

/**
 * Options for Gremlin query execution
 */
export interface QueryOptions {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Result from a Gremlin query
 */
export interface QueryResult<T = any> {
  data: T[];
  meta?: {
    executionTime: number;
    count: number;
  };
}

/**
 * Vertex identifier for graph operations
 */
export interface VertexIdentifier {
  label: string;
  property: string;
  value: any;
}
