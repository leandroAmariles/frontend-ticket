/**
 * Fixed taxonomy of categories the RAG knowledge base is organized around
 * (mirrors TaxonomyCategoryName in backend-ia).
 */
export const KNOWLEDGE_CATEGORY_KEYS = [
  'billing',
  'technical',
  'account',
  'general',
  'other',
] as const;

export type KnowledgeCategoryKey = (typeof KNOWLEDGE_CATEGORY_KEYS)[number];

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategoryKey, string> = {
  billing: 'Facturación',
  technical: 'Técnico',
  account: 'Cuenta',
  general: 'General',
  other: 'Otros',
};

export type EmbeddingStatus = 'PENDING' | 'READY';

/** Client-side mirror of backend-ia's @Size constraints (KnowledgeDocumentRequestDto) */
export const KNOWLEDGE_LIMITS = {
  descriptionMaxLength: 2000,
  examplesMaxItems: 50,
  exampleMaxLength: 500,
  keywordsMaxItems: 100,
  keywordMaxLength: 100,
  patternsMaxItems: 50,
  patternMaxLength: 200,
};

export interface KnowledgeDocument {
  categoryKey: string;
  description: string;
  examples: string[];
  keywords: string[];
  patterns: string[];
  embeddingStatus: EmbeddingStatus;
  updatedAt: string;
}

export interface KnowledgeDocumentRequest {
  description: string;
  examples: string[];
  keywords: string[];
  patterns: string[];
}
