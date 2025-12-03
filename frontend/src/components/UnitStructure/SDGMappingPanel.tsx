import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Loader2,
  Globe2,
  Save,
  X,
} from 'lucide-react';
import {
  SDG_GOALS,
  SDGGoal,
  suggestSDGs,
  getMappedSDGCount,
} from '../../constants/sdgGoals';
import {
  learningOutcomesApi,
  accreditationApi,
} from '../../services/unitStructureApi';
import { ULOResponse, SDGCode } from '../../types/unitStructure';
import toast from 'react-hot-toast';

interface SDGMappingPanelProps {
  unitId: string;
}

// Map SDG id (sdg1) to code (SDG1) for API
const idToCode = (id: string): SDGCode => id.toUpperCase() as SDGCode;
const codeToId = (code: string): string => code.toLowerCase();

export const SDGMappingPanel: React.FC<SDGMappingPanelProps> = ({ unitId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSDGs, setSelectedSDGs] = useState<Set<string>>(new Set());
  const [hoveredSDG, setHoveredSDG] = useState<SDGGoal | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [ulos, setUlos] = useState<ULOResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing mappings from backend
  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accreditationApi.getUnitSDGMappings(unitId);
      // Convert backend mappings to local format
      const mappedIds = new Set(
        response.mappings.map(m => codeToId(m.sdgCode))
      );
      setSelectedSDGs(mappedIds);
      setHasUnsavedChanges(false);
    } catch {
      // API might not exist yet - silently fail and use empty mappings
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  // Load ULOs for AI suggestions
  const loadULOs = useCallback(async () => {
    try {
      const data = await learningOutcomesApi.getULOsByUnit(unitId, false);
      setUlos(data);
    } catch (err) {
      console.error('Error loading ULOs for SDG suggestions:', err);
    }
  }, [unitId]);

  useEffect(() => {
    if (isExpanded) {
      loadMappings();
      if (ulos.length === 0) {
        loadULOs();
      }
    }
  }, [isExpanded, loadMappings, ulos.length, loadULOs]);

  const handleToggleSDG = (sdgId: string) => {
    setSelectedSDGs(prev => {
      const next = new Set(prev);
      if (next.has(sdgId)) {
        next.delete(sdgId);
      } else {
        next.add(sdgId);
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Save mappings to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const mappingsToSave = Array.from(selectedSDGs).map(id => ({
        sdgCode: idToCode(id),
        isAiSuggested: false,
      }));

      await accreditationApi.updateUnitSDGMappings(unitId, {
        mappings: mappingsToSave,
      });

      setHasUnsavedChanges(false);
      toast.success('SDG mappings saved');
    } catch (err) {
      console.error('Error saving SDG mappings:', err);
      toast.error('Failed to save SDG mappings');
    } finally {
      setSaving(false);
    }
  };

  const handleAISuggest = async () => {
    setSuggesting(true);
    try {
      // Make sure we have ULOs
      let currentUlos = ulos;
      if (currentUlos.length === 0) {
        currentUlos = await learningOutcomesApi.getULOsByUnit(unitId, false);
        setUlos(currentUlos);
      }

      const descriptions = currentUlos.map(u => u.description);

      // Get AI suggestions
      const suggestions = suggestSDGs(descriptions);

      // Add top suggestions (but don't overwrite existing selections)
      const topSuggestions = suggestions.slice(0, 3);

      if (topSuggestions.length > 0) {
        setSelectedSDGs(prev => {
          const next = new Set(prev);
          let changed = false;
          topSuggestions.forEach(s => {
            if (!next.has(s.sdg.id)) {
              next.add(s.sdg.id);
              changed = true;
            }
          });
          if (changed) {
            setHasUnsavedChanges(true);
          }
          return next;
        });
        toast.success(
          `Suggested ${topSuggestions.length} SDGs based on your content`
        );
      } else {
        toast(
          'No SDG matches found - try adding more content to your learning outcomes'
        );
      }
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      toast.error('Failed to generate suggestions');
    } finally {
      setSuggesting(false);
    }
  };

  const handleClearAll = () => {
    setSelectedSDGs(new Set());
    setHasUnsavedChanges(true);
  };

  const mappedCount = getMappedSDGCount(Array.from(selectedSDGs));

  const renderSDGCard = (sdg: SDGGoal) => {
    const isSelected = selectedSDGs.has(sdg.id);

    return (
      <button
        key={sdg.id}
        onClick={() => handleToggleSDG(sdg.id)}
        onMouseEnter={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
          });
          setHoveredSDG(sdg);
        }}
        onMouseLeave={() => setHoveredSDG(null)}
        className={`
          relative p-3 rounded-lg border-2 transition-all text-left
          ${
            isSelected
              ? `${sdg.color} ${sdg.textColor} border-current shadow-sm`
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
          }
        `}
      >
        <div className='flex items-start gap-2'>
          <span className='text-xl'>{sdg.icon}</span>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1'>
              <span
                className={`text-xs font-bold ${isSelected ? sdg.textColor : 'text-gray-400'}`}
              >
                {sdg.number}
              </span>
              {isSelected && (
                <X className='w-3 h-3 ml-auto opacity-50 hover:opacity-100' />
              )}
            </div>
            <p
              className={`text-xs font-medium truncate ${isSelected ? sdg.textColor : 'text-gray-600'}`}
            >
              {sdg.shortName}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition'
      >
        <div className='flex items-center gap-3'>
          <Globe2 className='w-5 h-5 text-blue-600' />
          <div className='text-left'>
            <h3 className='font-semibold text-gray-900'>
              UN Sustainable Development Goals
            </h3>
            <p className='text-xs text-gray-500'>
              Map how this unit contributes to the Global Goals
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {mappedCount > 0 && (
            <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full'>
              {mappedCount} of {SDG_GOALS.length} mapped
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 text-gray-400' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-400' />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='p-4'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-6 h-6 text-blue-600 animate-spin' />
              <span className='ml-2 text-gray-500'>Loading mappings...</span>
            </div>
          ) : (
            <>
              {/* Action buttons */}
              <div className='flex items-center justify-between mb-4'>
                <p className='text-sm text-gray-600'>
                  Select goals that align with your unit&apos;s learning
                  outcomes
                </p>
                <div className='flex items-center gap-2'>
                  {mappedCount > 0 && (
                    <button
                      onClick={handleClearAll}
                      className='text-xs text-gray-500 hover:text-gray-700 px-2 py-1'
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={handleAISuggest}
                    disabled={suggesting}
                    className='flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 
                           rounded-lg text-sm font-medium hover:bg-amber-100 transition
                           disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {suggesting ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <Sparkles className='w-4 h-4' />
                    )}
                    AI Suggest
                  </button>
                  {hasUnsavedChanges && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white 
                             rounded-lg text-sm font-medium hover:bg-blue-700 transition
                             disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {saving ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Save className='w-4 h-4' />
                      )}
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* SDG Grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2'>
                {SDG_GOALS.map(sdg => renderSDGCard(sdg))}
              </div>

              {/* Info text */}
              <div className='mt-4 flex items-start gap-2 text-xs text-gray-500'>
                <Info className='w-4 h-4 flex-shrink-0 mt-0.5' />
                <p>
                  The UN SDGs are 17 interlinked global goals designed to be a
                  &quot;blueprint to achieve a better and more sustainable
                  future for all&quot;. Mapping your curriculum to these goals
                  demonstrates commitment to education for sustainable
                  development.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* SDG Tooltip */}
      {hoveredSDG && (
        <div
          className='fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-sm'
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)',
          }}
        >
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-2xl'>{hoveredSDG.icon}</span>
            <div>
              <span
                className={`text-xs font-bold ${hoveredSDG.textColor} ${hoveredSDG.color} px-1.5 py-0.5 rounded`}
              >
                SDG {hoveredSDG.number}
              </span>
              <h4 className='font-semibold text-gray-900'>{hoveredSDG.name}</h4>
            </div>
          </div>
          <p className='text-sm text-gray-600'>{hoveredSDG.description}</p>
        </div>
      )}
    </div>
  );
};

export default SDGMappingPanel;
