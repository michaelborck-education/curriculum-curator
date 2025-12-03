/**
 * API service for research sources and citations
 */

import api from './api';

// ==================== Types ====================

export type SourceType =
  | 'journal_article'
  | 'book'
  | 'book_chapter'
  | 'conference_paper'
  | 'thesis'
  | 'website'
  | 'report'
  | 'video'
  | 'podcast'
  | 'other';

export type CitationStyle =
  | 'apa7'
  | 'harvard'
  | 'mla'
  | 'chicago'
  | 'ieee'
  | 'vancouver';

export interface Author {
  firstName: string;
  lastName: string;
  suffix?: string;
}

export interface ResearchSource {
  id: string;
  userId: string;
  unitId: string | null;
  url: string;
  title: string;
  sourceType: SourceType;
  authors: Author[];
  publicationDate: string | null;
  publisher: string | null;
  journalName: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  isbn: string | null;
  summary: string | null;
  keyPoints: string[];
  academicScore: number;
  usageCount: number;
  lastUsedAt: string | null;
  tags: string[];
  notes: string | null;
  isFavorite: boolean;
  accessDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ResearchSourceCreate {
  url: string;
  title: string;
  sourceType?: SourceType;
  authors?: Author[];
  publicationDate?: string;
  publisher?: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  summary?: string;
  keyPoints?: string[];
  tags?: string[];
  notes?: string;
  accessDate?: string;
  unitId?: string;
  isFavorite?: boolean;
}

export interface ResearchSourceUpdate {
  title?: string;
  sourceType?: SourceType;
  authors?: Author[];
  publicationDate?: string;
  publisher?: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  summary?: string;
  keyPoints?: string[];
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  unitId?: string;
}

export interface ResearchSourceList {
  sources: ResearchSource[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SaveFromSearchRequest {
  url: string;
  title: string;
  summary?: string;
  keyPoints?: string[];
  academicScore?: number;
  unitId?: string;
  sourceType?: SourceType;
  tags?: string[];
}

export interface CitationResponse {
  sourceId: string;
  style: CitationStyle;
  fullCitation: string;
  inTextCitation: string;
}

export interface ReferenceListResponse {
  style: CitationStyle;
  referenceList: string;
  citations: CitationResponse[];
}

export interface SynthesisRequest {
  sourceIds: string[];
  purpose: string;
  topic: string;
  wordCount?: number;
  includeCitations?: boolean;
  citationStyle?: CitationStyle;
}

export interface SynthesisResponse {
  content: string;
  referenceList: string;
  sourcesUsed: string[];
  wordCount: number;
}

// ==================== API Class ====================

class SourcesAPI {
  /**
   * Create a new research source
   */
  async createSource(data: ResearchSourceCreate): Promise<ResearchSource> {
    const response = await api.post('/sources', data);
    return response.data;
  }

  /**
   * Save a source from search results
   */
  async saveFromSearch(data: SaveFromSearchRequest): Promise<ResearchSource> {
    const response = await api.post('/sources/from-search', data);
    return response.data;
  }

  /**
   * List research sources with optional filters
   */
  async listSources(options?: {
    unitId?: string;
    favoritesOnly?: boolean;
    tag?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ResearchSourceList> {
    const response = await api.get('/sources', {
      params: {
        unit_id: options?.unitId,
        favorites_only: options?.favoritesOnly,
        tag: options?.tag,
        search: options?.search,
        page: options?.page ?? 1,
        page_size: options?.pageSize ?? 20,
      },
    });
    return response.data;
  }

  /**
   * Get a single research source
   */
  async getSource(sourceId: string): Promise<ResearchSource> {
    const response = await api.get(`/sources/${sourceId}`);
    return response.data;
  }

  /**
   * Update a research source
   */
  async updateSource(
    sourceId: string,
    data: ResearchSourceUpdate
  ): Promise<ResearchSource> {
    const response = await api.patch(`/sources/${sourceId}`, data);
    return response.data;
  }

  /**
   * Delete a research source
   */
  async deleteSource(sourceId: string): Promise<void> {
    await api.delete(`/sources/${sourceId}`);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(sourceId: string): Promise<ResearchSource> {
    const response = await api.post(`/sources/${sourceId}/favorite`);
    return response.data;
  }

  /**
   * Format a citation for a source
   */
  async formatCitation(
    sourceId: string,
    style: CitationStyle = 'apa7'
  ): Promise<CitationResponse> {
    const response = await api.post('/sources/citations/format', {
      sourceId,
      style,
    });
    return response.data;
  }

  /**
   * Format a reference list from multiple sources
   */
  async formatReferenceList(
    sourceIds: string[],
    style: CitationStyle = 'apa7'
  ): Promise<ReferenceListResponse> {
    const response = await api.post('/sources/citations/format-bulk', {
      sourceIds,
      style,
    });
    return response.data;
  }

  /**
   * Synthesize content from multiple sources
   */
  async synthesize(data: SynthesisRequest): Promise<SynthesisResponse> {
    const response = await api.post('/sources/synthesize', data);
    return response.data;
  }
}

export const sourcesApi = new SourcesAPI();
export default sourcesApi;
