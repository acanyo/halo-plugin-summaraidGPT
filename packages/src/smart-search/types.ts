export interface SmartSearchConfig {
  enable: boolean;
  enableSemantic: boolean;
  enableAi: boolean;
}
export interface SearchOptions {
  keyword?: string;
  includeTypes?: string[];
  includeOwnerNames?: string[];
  includeCategoryNames?: string[];
  includeTagNames?: string[];
  annotations?: Record<string, string>;
}
export interface SearchHit { id: string; title: string; url: string; excerpt: string; type: string }
export interface SearchResult { hits: SearchHit[]; mode: string; fallback: boolean; message: string }
export interface SearchSource { id: string; title: string; url: string }
export interface DiscoveryArticle extends SearchSource { visits: number }
export interface SearchDiscovery { random: DiscoveryArticle[]; popular: DiscoveryArticle[] }
export interface AnswerEvent { type: string; delta?: string; sources?: SearchSource[]; error?: string }
