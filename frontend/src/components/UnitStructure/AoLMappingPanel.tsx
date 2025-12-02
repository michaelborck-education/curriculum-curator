import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import {
  AOL_COMPETENCIES,
  AOL_LEVELS,
  AoLMapping,
  AoLLevel,
  AoLCompetency,
  suggestAoLMappings,
  getMappedCount,
} from '../../constants/aolCompetencies';
import { learningOutcomesApi } from '../../services/unitStructureApi';
import { ULOResponse } from '../../types/unitStructure';

interface AoLMappingPanelProps {
  unitId: string;
}

export const AoLMappingPanel: React.FC<AoLMappingPanelProps> = ({ unitId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mappings, setMappings] = useState<AoLMapping[]>(
    AOL_COMPETENCIES.map(c => ({ competencyId: c.id, level: null }))
  );
  const [hoveredCompetency, setHoveredCompetency] =
    useState<AoLCompetency | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<
    keyof typeof AOL_LEVELS | null
  >(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [suggesting, setSuggesting] = useState(false);
  const [ulos, setUlos] = useState<ULOResponse[]>([]);

  // Load ULOs for AI suggestions
  const loadULOs = useCallback(async () => {
    try {
      const data = await learningOutcomesApi.getULOsByUnit(unitId, false);
      setUlos(data);
    } catch (err) {
      console.error('Error loading ULOs for AoL suggestions:', err);
    }
  }, [unitId]);

  useEffect(() => {
    if (isExpanded && ulos.length === 0) {
      loadULOs();
    }
  }, [isExpanded, ulos.length, loadULOs]);

  const handleLevelChange = (competencyId: string, level: AoLLevel) => {
    setMappings(prev =>
      prev.map(m => {
        if (m.competencyId === competencyId) {
          // Toggle off if clicking same level
          return { ...m, level: m.level === level ? null : level };
        }
        return m;
      })
    );
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
      const bloomLevels = currentUlos.map(u => u.bloomLevel);

      // TODO: Also fetch assessment types when available
      const suggestions = suggestAoLMappings(descriptions, bloomLevels, []);

      // Merge suggestions with existing mappings (don't overwrite user choices)
      setMappings(prev =>
        prev.map(m => {
          const suggestion = suggestions.find(
            s => s.competencyId === m.competencyId
          );
          // Only apply suggestion if not already mapped
          if (m.level === null && suggestion) {
            return suggestion;
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleClearAll = () => {
    setMappings(
      AOL_COMPETENCIES.map(c => ({ competencyId: c.id, level: null }))
    );
  };

  const mappedCount = getMappedCount(mappings);

  const getMapping = (competencyId: string): AoLLevel => {
    return mappings.find(m => m.competencyId === competencyId)?.level || null;
  };

  const renderRadioButton = (
    competency: AoLCompetency,
    level: keyof typeof AOL_LEVELS
  ) => {
    const currentLevel = getMapping(competency.id);
    const isSelected = currentLevel === level;
    const levelInfo = AOL_LEVELS[level];

    return (
      <button
        key={level}
        onClick={() => handleLevelChange(competency.id, level)}
        onMouseEnter={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
          });
          setHoveredLevel(level);
        }}
        onMouseLeave={() => setHoveredLevel(null)}
        className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center
          text-xs font-bold transition-all
          ${
            isSelected
              ? levelInfo.color + ' border-current'
              : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-100'
          }
        `}
        title={`${levelInfo.label}: ${levelInfo.description}`}
      >
        {level}
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
          <GraduationCap className='w-5 h-5 text-purple-600' />
          <div className='text-left'>
            <h3 className='font-semibold text-gray-900'>
              Assurance of Learning (AoL)
            </h3>
            <p className='text-xs text-gray-500'>
              AACSB program-level competency mapping
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {mappedCount > 0 && (
            <span className='px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full'>
              {mappedCount} of {AOL_COMPETENCIES.length} mapped
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
          {/* Action buttons */}
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-gray-600'>
              Map how this unit contributes to program-level learning goals
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
            </div>
          </div>

          {/* Matrix Table */}
          <div className='border border-gray-200 rounded-lg overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='text-left px-4 py-2 text-sm font-medium text-gray-700'>
                    Competency Area
                  </th>
                  <th className='text-center px-2 py-2 text-sm font-medium text-gray-700 w-12'>
                    <span
                      className='cursor-help'
                      title='Introduce: First exposure, basic understanding'
                    >
                      I
                    </span>
                  </th>
                  <th className='text-center px-2 py-2 text-sm font-medium text-gray-700 w-12'>
                    <span
                      className='cursor-help'
                      title='Reinforce: Practice and deepen skills'
                    >
                      R
                    </span>
                  </th>
                  <th className='text-center px-2 py-2 text-sm font-medium text-gray-700 w-12'>
                    <span
                      className='cursor-help'
                      title='Master: Demonstrate proficiency at graduation level'
                    >
                      M
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {AOL_COMPETENCIES.map((competency, index) => {
                  const mapping = getMapping(competency.id);
                  const isUnmapped = mapping === null;

                  return (
                    <tr
                      key={competency.id}
                      className={`
                        border-t border-gray-100
                        ${isUnmapped ? 'bg-white' : competency.color}
                        ${index % 2 === 0 ? '' : 'bg-opacity-50'}
                      `}
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>{competency.icon}</span>
                          <div>
                            <span
                              className={`font-medium ${isUnmapped ? 'text-gray-500' : 'text-gray-900'}`}
                              onMouseEnter={e => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setTooltipPosition({
                                  x: rect.left + rect.width / 2,
                                  y: rect.bottom + 8,
                                });
                                setHoveredCompetency(competency);
                              }}
                              onMouseLeave={() => setHoveredCompetency(null)}
                            >
                              {competency.shortName}
                            </span>
                            <button
                              className='ml-1 text-gray-400 hover:text-gray-600'
                              onMouseEnter={e => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setTooltipPosition({
                                  x: rect.left + rect.width / 2,
                                  y: rect.bottom + 8,
                                });
                                setHoveredCompetency(competency);
                              }}
                              onMouseLeave={() => setHoveredCompetency(null)}
                            >
                              <Info className='w-3.5 h-3.5 inline' />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className='text-center px-2 py-3'>
                        {renderRadioButton(competency, 'I')}
                      </td>
                      <td className='text-center px-2 py-3'>
                        {renderRadioButton(competency, 'R')}
                      </td>
                      <td className='text-center px-2 py-3'>
                        {renderRadioButton(competency, 'M')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className='mt-4 flex items-center justify-between text-xs text-gray-500'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1'>
                <span className='w-6 h-6 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center text-xs font-bold'>
                  I
                </span>
                Introduce
              </span>
              <span className='flex items-center gap-1'>
                <span className='w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center justify-center text-xs font-bold'>
                  R
                </span>
                Reinforce
              </span>
              <span className='flex items-center gap-1'>
                <span className='w-6 h-6 rounded-full bg-green-100 text-green-800 border border-green-300 flex items-center justify-center text-xs font-bold'>
                  M
                </span>
                Master
              </span>
            </div>
            <span className='text-gray-400'>
              Click to select level, click again to clear
            </span>
          </div>
        </div>
      )}

      {/* Competency Tooltip */}
      {hoveredCompetency && (
        <div
          className='fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs'
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)',
          }}
        >
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-xl'>{hoveredCompetency.icon}</span>
            <span className='font-semibold text-gray-900'>
              {hoveredCompetency.name}
            </span>
          </div>
          <p className='text-sm text-gray-600'>
            {hoveredCompetency.description}
          </p>
        </div>
      )}

      {/* Level Tooltip */}
      {hoveredLevel && !hoveredCompetency && (
        <div
          className='fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl px-3 py-2 text-sm'
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)',
          }}
        >
          <span className='font-medium'>{AOL_LEVELS[hoveredLevel].label}</span>
          <span className='text-gray-300'>
            {' '}
            - {AOL_LEVELS[hoveredLevel].description}
          </span>
        </div>
      )}
    </div>
  );
};

export default AoLMappingPanel;
