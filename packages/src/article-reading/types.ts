export interface ArticleReading {
  spec?: ArticleReadingSpec;
}

export interface ArticleReadingSpec {
  postMetadataName?: string;
  postTitle?: string;
  postUrl?: string;
  contentHash?: string;
  schemaVersion?: number;
  modelName?: string;
  generatedAt?: string;
  root?: InsightNode;
  nodes?: InsightNode[];
  edges?: InsightEdge[];
}

export interface InsightGraph {
  root: InsightNode;
  nodes: InsightNode[];
  edges: InsightEdge[];
}

export type InsightNodeKind = 'root' | 'tl' | 'dl';
export type InsightEdgeType = 'contains' | 'expands' | 'supports' | 'explains';

export interface InsightNode {
  id: string;
  title: string;
  kind: InsightNodeKind;
  summary?: string;
  sourceRange?: SourceRange;
  payload?: Record<string, unknown>;
}

export interface SourceRange {
  startParagraph?: number;
  endParagraph?: number;
  anchor?: string;
}

export interface InsightEdge {
  from: string;
  to: string;
  type: InsightEdgeType;
}

export interface ConversationResponse {
  success?: boolean;
  message?: string;
  response?: string;
}

export interface ErrorResponse {
  success?: boolean;
  message?: string;
}
