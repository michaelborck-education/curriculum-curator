/**
 * API service for web search operations
 */

import api from './api';

// Types
export interface SearchResult {
  title: string;
  url: string;
  content: string | null;
  description: string | null;
  source: string | null;
  publishedDate: string | null;
  academicScore: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  academicFilterApplied: boolean;
}

export interface SummarizeResponse {
  url: string;
  summary: string;
  keyPoints: string[];
  purpose: string;
  academicScore: number;
  contentLength: number;
  summaryLength: number;
  timestamp: string;
}

export interface SearchAndSummarizeResponse {
  query: string;
  purpose: string;
  searchResults: SearchResult[];
  summaries: SummarizeResponse[];
  totalResults: number;
  summarizedCount: number;
}

export type SummarizePurpose =
  | 'syllabus_description'
  | 'ulo'
  | 'content'
  | 'assessment'
  | 'general';

// API functions
class SearchAPI {
  /**
   * Search for academic content
   */
  async search(
    query: string,
    options?: {
      maxResults?: number;
      academicOnly?: boolean;
      timeout?: number;
    }
  ): Promise<SearchResponse> {
    const response = await api.post('/search/search', {
      query,
      max_results: options?.maxResults ?? 10,
      academic_only: options?.academicOnly ?? true,
      timeout: options?.timeout ?? 30,
    });
    return response.data;
  }

  /**
   * Summarize a URL for educational purposes
   */
  async summarizeUrl(
    url: string,
    options?: {
      purpose?: SummarizePurpose;
      maxLength?: number;
      includeKeyPoints?: boolean;
    }
  ): Promise<SummarizeResponse> {
    const response = await api.post('/search/summarize', {
      url,
      purpose: options?.purpose ?? 'general',
      max_length: options?.maxLength ?? 1000,
      include_key_points: options?.includeKeyPoints ?? true,
    });
    return response.data;
  }

  /**
   * Search and summarize top results
   */
  async searchAndSummarize(
    query: string,
    options?: {
      purpose?: SummarizePurpose;
      maxResults?: number;
      summarizeTopN?: number;
    }
  ): Promise<SearchAndSummarizeResponse> {
    const response = await api.post('/search/search-and-summarize', {
      query,
      purpose: options?.purpose ?? 'general',
      max_results: options?.maxResults ?? 5,
      summarize_top_n: options?.summarizeTopN ?? 3,
    });
    return response.data;
  }

  /**
   * Test search functionality
   */
  async testSearch(query?: string): Promise<{
    status: string;
    message: string;
    query: string;
    resultsCount: number;
    sampleResults?: Array<{
      title: string;
      url: string;
      academicScore: number;
    }>;
    searxngUrl: string;
  }> {
    const response = await api.get('/search/test-search', {
      params: { query: query ?? 'constructivist learning theory' },
    });
    return response.data;
  }
}

export const searchApi = new SearchAPI();
export default searchApi;
