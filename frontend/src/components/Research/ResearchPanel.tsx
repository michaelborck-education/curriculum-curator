/**
 * ResearchPanel - Manage saved research sources and citations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BookMarked,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Search,
  Tag,
  FileText,
  Quote,
  X,
} from 'lucide-react';
import {
  sourcesApi,
  ResearchSource,
  CitationStyle,
  CitationResponse,
} from '../../services/sourcesApi';

interface ResearchPanelProps {
  unitId?: string;
  onInsertCitation?: (citation: string) => void;
  onInsertReference?: (reference: string) => void;
  className?: string;
}

const CITATION_STYLES: { value: CitationStyle; label: string }[] = [
  { value: 'apa7', label: 'APA 7th' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'vancouver', label: 'Vancouver' },
];

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  unitId,
  onInsertCitation,
  onInsertReference,
  className = '',
}) => {
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('apa7');
  const [citations, setCitations] = useState<Map<string, CitationResponse>>(
    new Map()
  );
  const [loadingCitation, setLoadingCitation] = useState<Set<string>>(
    new Set()
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Get unique tags from all sources
  const allTags = Array.from(new Set(sources.flatMap(s => s.tags))).sort();

  const fetchSources = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);
        const currentPage = reset ? 1 : page;

        const response = await sourcesApi.listSources({
          ...(unitId && { unitId }),
          favoritesOnly,
          ...(selectedTag && { tag: selectedTag }),
          ...(searchQuery && { search: searchQuery }),
          page: currentPage,
          pageSize: 20,
        });

        if (reset) {
          setSources(response.sources);
          setPage(1);
        } else {
          setSources(prev =>
            currentPage === 1
              ? response.sources
              : [...prev, ...response.sources]
          );
        }
        setHasMore(response.hasMore);
        setTotal(response.total);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load sources';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [unitId, favoritesOnly, selectedTag, searchQuery, page]
  );

  useEffect(() => {
    fetchSources(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, favoritesOnly, selectedTag]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSources(true);
    }, 300);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleToggleFavorite = async (sourceId: string) => {
    try {
      const updated = await sourcesApi.toggleFavorite(sourceId);
      setSources(prev => prev.map(s => (s.id === sourceId ? updated : s)));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this source?')) return;

    try {
      await sourcesApi.deleteSource(sourceId);
      setSources(prev => prev.filter(s => s.id !== sourceId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const handleGetCitation = async (sourceId: string) => {
    setLoadingCitation(prev => new Set(prev).add(sourceId));
    try {
      const citation = await sourcesApi.formatCitation(sourceId, citationStyle);
      setCitations(prev => new Map(prev).set(sourceId, citation));
      setExpandedSources(prev => new Set(prev).add(sourceId));
    } catch (err) {
      console.error('Failed to get citation:', err);
    } finally {
      setLoadingCitation(prev => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  };

  const toggleExpanded = (sourceId: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAuthors = (source: ResearchSource): string => {
    if (!source.authors || source.authors.length === 0) return 'Unknown';
    if (source.authors.length === 1) {
      return `${source.authors[0].lastName}, ${source.authors[0].firstName}`;
    }
    if (source.authors.length === 2) {
      return `${source.authors[0].lastName} & ${source.authors[1].lastName}`;
    }
    return `${source.authors[0].lastName} et al.`;
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'journal_article':
        return <FileText className='h-4 w-4' />;
      case 'book':
      case 'book_chapter':
        return <BookMarked className='h-4 w-4' />;
      default:
        return <ExternalLink className='h-4 w-4' />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center'>
            <BookMarked className='h-5 w-5 text-indigo-600 mr-2' />
            <h3 className='text-lg font-semibold'>Research Library</h3>
          </div>
          <span className='text-sm text-gray-500'>{total} sources</span>
        </div>
        <p className='text-sm text-gray-600'>
          Manage your saved sources and generate citations
        </p>
      </div>

      {/* Citation Style Selector */}
      <div className='px-4 py-2 border-b border-gray-100 flex items-center space-x-2'>
        <Quote className='h-4 w-4 text-gray-500' />
        <label className='text-sm text-gray-600'>Citation style:</label>
        <select
          value={citationStyle}
          onChange={e => {
            setCitationStyle(e.target.value as CitationStyle);
            setCitations(new Map()); // Clear cached citations
          }}
          className='text-sm border border-gray-300 rounded px-2 py-1'
        >
          {CITATION_STYLES.map(style => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Filters */}
      <div className='p-4 space-y-3 border-b border-gray-100'>
        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search sources...'
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
          />
        </div>

        {/* Filter toggles */}
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center px-2 py-1 rounded text-sm ${
              favoritesOnly
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className='h-3 w-3 mr-1' />
            Favorites
          </button>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className='flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm'
            >
              <Tag className='h-3 w-3 mr-1' />
              {selectedTag}
              <X className='h-3 w-3 ml-1' />
            </button>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && !selectedTag && (
          <div className='flex flex-wrap gap-1'>
            {allTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200'
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className='mx-4 my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start'>
          <AlertCircle className='h-5 w-5 text-red-500 mr-2 flex-shrink-0' />
          <p className='text-sm text-red-700'>{error}</p>
        </div>
      )}

      {/* Sources List */}
      <div className='px-4 pb-4'>
        {loading && sources.length === 0 ? (
          <div className='py-8 text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto text-indigo-500' />
            <p className='text-sm text-gray-500 mt-2'>Loading sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className='py-8 text-center text-gray-500'>
            <BookMarked className='h-12 w-12 mx-auto mb-2 opacity-50' />
            <p>No sources found</p>
            <p className='text-sm mt-1'>
              Save sources from the search panel to build your library
            </p>
          </div>
        ) : (
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {sources.map(source => {
              const isExpanded = expandedSources.has(source.id);
              const citation = citations.get(source.id);
              const isCitationLoading = loadingCitation.has(source.id);

              return (
                <div
                  key={source.id}
                  className='border border-gray-200 rounded-lg overflow-hidden'
                >
                  {/* Source Header */}
                  <div className='p-3 bg-gray-50'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0 mr-2'>
                        <div className='flex items-center'>
                          {getSourceTypeIcon(source.sourceType)}
                          <a
                            href={source.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='ml-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm truncate'
                          >
                            {source.title}
                          </a>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          {formatAuthors(source)}
                          {source.publicationDate &&
                            ` (${source.publicationDate.slice(0, 4)})`}
                        </p>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <button
                          onClick={() => handleToggleFavorite(source.id)}
                          className='p-1 text-gray-400 hover:text-yellow-500'
                          title={
                            source.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          {source.isFavorite ? (
                            <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                          ) : (
                            <StarOff className='h-4 w-4' />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(source.id)}
                          className='p-1 text-gray-400 hover:text-red-500'
                          title='Delete source'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    {source.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {source.tags.map(tag => (
                          <span
                            key={tag}
                            className='px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex items-center mt-2 space-x-2'>
                      {!citation && (
                        <button
                          onClick={() => handleGetCitation(source.id)}
                          disabled={isCitationLoading}
                          className='text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 flex items-center'
                        >
                          {isCitationLoading ? (
                            <>
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                              Getting citation...
                            </>
                          ) : (
                            <>
                              <Quote className='h-3 w-3 mr-1' />
                              Get Citation
                            </>
                          )}
                        </button>
                      )}
                      {citation && (
                        <button
                          onClick={() => toggleExpanded(source.id)}
                          className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center'
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className='h-3 w-3 mr-1' />
                              Hide Citation
                            </>
                          ) : (
                            <>
                              <ChevronDown className='h-3 w-3 mr-1' />
                              Show Citation
                            </>
                          )}
                        </button>
                      )}
                      {source.summary && (
                        <button
                          onClick={() => toggleExpanded(source.id)}
                          className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center'
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className='p-3 border-t border-gray-200 bg-white space-y-3'>
                      {/* Citation */}
                      {citation && (
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs font-medium text-gray-700'>
                              In-text Citation
                            </span>
                            <div className='flex space-x-1'>
                              <button
                                onClick={() =>
                                  copyToClipboard(citation.inTextCitation)
                                }
                                className='text-xs p-1 text-gray-500 hover:text-gray-700'
                                title='Copy'
                              >
                                <Copy className='h-3 w-3' />
                              </button>
                              {onInsertCitation && (
                                <button
                                  onClick={() =>
                                    onInsertCitation(citation.inTextCitation)
                                  }
                                  className='text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200'
                                >
                                  Insert
                                </button>
                              )}
                            </div>
                          </div>
                          <p className='text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded'>
                            {citation.inTextCitation}
                          </p>

                          <div className='flex items-center justify-between mb-1 mt-3'>
                            <span className='text-xs font-medium text-gray-700'>
                              Full Reference
                            </span>
                            <div className='flex space-x-1'>
                              <button
                                onClick={() =>
                                  copyToClipboard(citation.fullCitation)
                                }
                                className='text-xs p-1 text-gray-500 hover:text-gray-700'
                                title='Copy'
                              >
                                <Copy className='h-3 w-3' />
                              </button>
                              {onInsertReference && (
                                <button
                                  onClick={() =>
                                    onInsertReference(citation.fullCitation)
                                  }
                                  className='text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200'
                                >
                                  Insert
                                </button>
                              )}
                            </div>
                          </div>
                          <p className='text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded'>
                            {citation.fullCitation}
                          </p>
                        </div>
                      )}

                      {/* Summary */}
                      {source.summary && (
                        <div>
                          <span className='text-xs font-medium text-gray-700'>
                            Summary
                          </span>
                          <p className='text-sm text-gray-600 mt-1'>
                            {source.summary}
                          </p>
                        </div>
                      )}

                      {/* Key Points */}
                      {source.keyPoints.length > 0 && (
                        <div>
                          <span className='text-xs font-medium text-gray-700'>
                            Key Points
                          </span>
                          <ul className='text-sm text-gray-600 mt-1 list-disc list-inside'>
                            {source.keyPoints.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {source.notes && (
                        <div>
                          <span className='text-xs font-medium text-gray-700'>
                            Notes
                          </span>
                          <p className='text-sm text-gray-600 mt-1 italic'>
                            {source.notes}
                          </p>
                        </div>
                      )}

                      {/* Usage */}
                      <div className='text-xs text-gray-500 pt-2 border-t border-gray-100'>
                        Used {source.usageCount} times
                        {source.lastUsedAt &&
                          ` · Last used ${new Date(source.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => {
                  setPage(p => p + 1);
                  fetchSources();
                }}
                disabled={loading}
                className='w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50'
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPanel;
