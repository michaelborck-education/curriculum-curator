/**
 * SearchPanel - Web search integration for content creation
 */

import { useState, useCallback } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Globe,
  GraduationCap,
  BookmarkPlus,
  Check,
} from 'lucide-react';
import {
  searchApi,
  SearchResult,
  SummarizeResponse,
  SummarizePurpose,
} from '../../services/searchApi';
import { sourcesApi } from '../../services/sourcesApi';

interface SearchPanelProps {
  onInsertContent?: (content: string) => void;
  onInsertKeyPoints?: (keyPoints: string[]) => void;
  onSourceSaved?: () => void;
  defaultPurpose?: SummarizePurpose;
  unitId?: string;
  className?: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onInsertContent,
  onInsertKeyPoints,
  onSourceSaved,
  defaultPurpose = 'general',
  unitId,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [purpose, setPurpose] = useState<SummarizePurpose>(defaultPurpose);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summaries, setSummaries] = useState<Map<string, SummarizeResponse>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(
    new Set()
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSummaries(new Map());

    try {
      const response = await searchApi.search(query, {
        maxResults: 10,
        academicOnly: true,
      });
      setResults(response.results);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSummarize = useCallback(
    async (url: string) => {
      setSummarizing(prev => new Set(prev).add(url));

      try {
        const summary = await searchApi.summarizeUrl(url, {
          purpose,
          maxLength: 1000,
          includeKeyPoints: true,
        });
        setSummaries(prev => new Map(prev).set(url, summary));
        setExpandedResults(prev => new Set(prev).add(url));
      } catch (err: any) {
        console.error('Summarization failed:', err);
      } finally {
        setSummarizing(prev => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
      }
    },
    [purpose]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleExpanded = (url: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSaveSource = useCallback(
    async (result: SearchResult) => {
      setSaving(prev => new Set(prev).add(result.url));

      try {
        const summary = summaries.get(result.url);
        const summaryText = summary?.summary || result.description;
        await sourcesApi.saveFromSearch({
          url: result.url,
          title: result.title,
          ...(summaryText && { summary: summaryText }),
          keyPoints: summary?.keyPoints || [],
          academicScore: result.academicScore,
          ...(unitId && { unitId }),
          sourceType: 'website',
        });
        setSavedUrls(prev => new Set(prev).add(result.url));
        onSourceSaved?.();
      } catch (err: unknown) {
        console.error('Failed to save source:', err);
      } finally {
        setSaving(prev => {
          const next = new Set(prev);
          next.delete(result.url);
          return next;
        });
      }
    },
    [summaries, unitId, onSourceSaved]
  );

  const getAcademicScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const purposeOptions: { value: SummarizePurpose; label: string }[] = [
    { value: 'syllabus_description', label: 'Syllabus Description' },
    { value: 'ulo', label: 'Learning Outcomes' },
    { value: 'content', label: 'Educational Content' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center mb-2'>
          <GraduationCap className='h-5 w-5 text-blue-600 mr-2' />
          <h3 className='text-lg font-semibold'>Academic Research</h3>
        </div>
        <p className='text-sm text-gray-600'>
          Search academic sources and get AI summaries for your content
        </p>
      </div>

      {/* Search Input */}
      <div className='p-4 space-y-3'>
        <div className='flex space-x-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Search academic sources...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Search'}
          </button>
        </div>

        {/* Purpose Selector */}
        <div className='flex items-center space-x-2'>
          <label className='text-sm text-gray-600'>Summarize for:</label>
          <select
            value={purpose}
            onChange={e => setPurpose(e.target.value as SummarizePurpose)}
            className='text-sm border border-gray-300 rounded px-2 py-1'
          >
            {purposeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start'>
          <AlertCircle className='h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5' />
          <div>
            <p className='text-sm text-red-700'>{error}</p>
            <p className='text-xs text-red-600 mt-1'>
              Make sure SearXNG is running and accessible.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className='px-4 pb-4'>
        {results.length > 0 && (
          <div className='text-sm text-gray-600 mb-3'>
            Found {results.length} academic sources
          </div>
        )}

        <div className='space-y-3 max-h-96 overflow-y-auto'>
          {results.map(result => {
            const summary = summaries.get(result.url);
            const isExpanded = expandedResults.has(result.url);
            const isSummarizing = summarizing.has(result.url);

            return (
              <div
                key={result.url}
                className='border border-gray-200 rounded-lg overflow-hidden'
              >
                {/* Result Header */}
                <div className='p-3 bg-gray-50'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0 mr-2'>
                      <a
                        href={result.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center'
                      >
                        <span className='truncate'>{result.title}</span>
                        <ExternalLink className='h-3 w-3 ml-1 flex-shrink-0' />
                      </a>
                      <div className='flex items-center mt-1 text-xs text-gray-500'>
                        <Globe className='h-3 w-3 mr-1' />
                        <span className='truncate'>{result.source}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getAcademicScoreColor(result.academicScore)}`}
                    >
                      {Math.round(result.academicScore * 100)}% academic
                    </span>
                  </div>

                  {result.description && (
                    <p className='text-xs text-gray-600 mt-2 line-clamp-2'>
                      {result.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className='flex items-center mt-2 space-x-2'>
                    {!summary && (
                      <button
                        onClick={() => handleSummarize(result.url)}
                        disabled={isSummarizing}
                        className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 flex items-center'
                      >
                        {isSummarizing ? (
                          <>
                            <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            Summarizing...
                          </>
                        ) : (
                          <>
                            <FileText className='h-3 w-3 mr-1' />
                            Summarize
                          </>
                        )}
                      </button>
                    )}
                    {/* Save to Library Button */}
                    {!savedUrls.has(result.url) ? (
                      <button
                        onClick={() => handleSaveSource(result)}
                        disabled={saving.has(result.url)}
                        className='text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 flex items-center'
                      >
                        {saving.has(result.url) ? (
                          <>
                            <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            Saving...
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className='h-3 w-3 mr-1' />
                            Save
                          </>
                        )}
                      </button>
                    ) : (
                      <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center'>
                        <Check className='h-3 w-3 mr-1' />
                        Saved
                      </span>
                    )}
                    {summary && (
                      <button
                        onClick={() => toggleExpanded(result.url)}
                        className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center'
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className='h-3 w-3 mr-1' />
                            Hide Summary
                          </>
                        ) : (
                          <>
                            <ChevronDown className='h-3 w-3 mr-1' />
                            Show Summary
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary Content */}
                {summary && isExpanded && (
                  <div className='p-3 border-t border-gray-200 bg-white'>
                    <div className='space-y-3'>
                      {/* Summary Text */}
                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-xs font-medium text-gray-700'>
                            Summary
                          </span>
                          <div className='flex space-x-1'>
                            <button
                              onClick={() => copyToClipboard(summary.summary)}
                              className='text-xs p-1 text-gray-500 hover:text-gray-700'
                              title='Copy summary'
                            >
                              <Copy className='h-3 w-3' />
                            </button>
                            {onInsertContent && (
                              <button
                                onClick={() => onInsertContent(summary.summary)}
                                className='text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200'
                              >
                                Insert
                              </button>
                            )}
                          </div>
                        </div>
                        <p className='text-sm text-gray-700'>
                          {summary.summary}
                        </p>
                      </div>

                      {/* Key Points */}
                      {summary.keyPoints.length > 0 && (
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs font-medium text-gray-700'>
                              Key Points
                            </span>
                            {onInsertKeyPoints && (
                              <button
                                onClick={() =>
                                  onInsertKeyPoints(summary.keyPoints)
                                }
                                className='text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200'
                              >
                                Insert All
                              </button>
                            )}
                          </div>
                          <ul className='text-sm text-gray-700 space-y-1'>
                            {summary.keyPoints.map((point, i) => (
                              <li key={i} className='flex items-start'>
                                <CheckCircle className='h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0' />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className='text-xs text-gray-500 flex items-center space-x-3'>
                        <span>{summary.contentLength} chars analyzed</span>
                        <span>|</span>
                        <span>
                          Purpose: {summary.purpose.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className='text-center py-8 text-gray-500'>
            <BookOpen className='h-12 w-12 mx-auto mb-2 opacity-50' />
            <p>No results found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
