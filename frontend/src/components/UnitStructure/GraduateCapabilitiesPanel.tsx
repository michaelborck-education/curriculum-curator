import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Award,
  ExternalLink,
  Target,
} from 'lucide-react';
import {
  GRADUATE_CAPABILITIES,
  GraduateCapability,
} from '../../constants/graduateCapabilities';
import {
  learningOutcomesApi,
  accreditationApi,
} from '../../services/unitStructureApi';
import { ULOResponse, GraduateCapabilityCode } from '../../types/unitStructure';

interface GraduateCapabilitiesPanelProps {
  unitId: string;
  onViewMap: () => void; // Callback to open the LearningOutcomeMap modal
}

interface ULOWithGCs {
  ulo: ULOResponse;
  capabilities: GraduateCapabilityCode[];
}

export const GraduateCapabilitiesPanel: React.FC<
  GraduateCapabilitiesPanelProps
> = ({ unitId, onViewMap }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ulosWithGCs, setUlosWithGCs] = useState<ULOWithGCs[]>([]);

  // Load ULOs and their GC mappings
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Get all ULOs for this unit
      const ulos = await learningOutcomesApi.getULOsByUnit(unitId, false);

      // Get GC mappings for each ULO
      const ulosWithMappings: ULOWithGCs[] = await Promise.all(
        ulos.map(async ulo => {
          try {
            const mappings = await accreditationApi.getULOGraduateCapabilities(
              ulo.id
            );
            return {
              ulo,
              capabilities: mappings.map(
                m => m.capabilityCode as GraduateCapabilityCode
              ),
            };
          } catch {
            return { ulo, capabilities: [] };
          }
        })
      );

      setUlosWithGCs(ulosWithMappings);
    } catch (err) {
      console.error('Error loading Graduate Capabilities data:', err);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    if (isExpanded) {
      loadData();
    }
  }, [isExpanded, loadData]);

  // Calculate summary stats
  const totalULOs = ulosWithGCs.length;
  const ulosWithMappings = ulosWithGCs.filter(
    u => u.capabilities.length > 0
  ).length;

  // Count how many ULOs map to each GC
  const gcCounts: Record<string, number> = {};
  GRADUATE_CAPABILITIES.forEach(gc => {
    gcCounts[gc.code] = ulosWithGCs.filter(u =>
      u.capabilities.includes(gc.code as GraduateCapabilityCode)
    ).length;
  });

  const getCapabilityInfo = (code: string): GraduateCapability | undefined =>
    GRADUATE_CAPABILITIES.find(gc => gc.code === code);

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition'
      >
        <div className='flex items-center gap-3'>
          <Award className='w-5 h-5 text-indigo-600' />
          <div className='text-left'>
            <h3 className='font-semibold text-gray-900'>
              Graduate Capabilities
            </h3>
            <p className='text-xs text-gray-500'>
              Curtin University graduate attributes mapped to ULOs
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {totalULOs > 0 && (
            <span className='px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full'>
              {ulosWithMappings} of {totalULOs} ULOs mapped
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
              <Loader2 className='w-6 h-6 text-indigo-600 animate-spin' />
              <span className='ml-2 text-gray-500'>Loading mappings...</span>
            </div>
          ) : totalULOs === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <Target className='w-8 h-8 mx-auto mb-2 text-gray-300' />
              <p>No Unit Learning Outcomes defined yet.</p>
              <p className='text-sm mt-1'>
                Add ULOs in the Learning Outcomes tab first.
              </p>
            </div>
          ) : (
            <>
              {/* GC Overview Grid */}
              <div className='mb-4'>
                <p className='text-sm text-gray-600 mb-3'>
                  Overview of how ULOs map to Graduate Capabilities:
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {GRADUATE_CAPABILITIES.map(gc => {
                    const count = gcCounts[gc.code];
                    const hasMapping = count > 0;
                    return (
                      <div
                        key={gc.id}
                        className={`p-3 rounded-lg border ${
                          hasMapping
                            ? gc.color
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>{gc.icon}</span>
                          <div className='flex-1 min-w-0'>
                            <p
                              className={`text-xs font-bold ${hasMapping ? '' : 'text-gray-400'}`}
                            >
                              {gc.code}
                            </p>
                            <p
                              className={`text-xs truncate ${hasMapping ? '' : 'text-gray-400'}`}
                            >
                              {gc.shortName}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-bold ${hasMapping ? '' : 'text-gray-300'}`}
                          >
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ULO List with their GCs */}
              <div className='border-t border-gray-100 pt-4'>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  ULO Mappings:
                </p>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {ulosWithGCs.map(({ ulo, capabilities }) => (
                    <div
                      key={ulo.id}
                      className='p-2 bg-gray-50 rounded-lg text-sm'
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <span className='font-medium text-gray-900'>
                            {ulo.code}
                          </span>
                          <span className='text-gray-500 ml-2 text-xs'>
                            ({ulo.bloomLevel})
                          </span>
                          <p className='text-gray-600 text-xs truncate mt-0.5'>
                            {ulo.description}
                          </p>
                        </div>
                        <div className='flex flex-wrap gap-1 flex-shrink-0'>
                          {capabilities.length > 0 ? (
                            capabilities.map(code => {
                              const gc = getCapabilityInfo(code);
                              return gc ? (
                                <span
                                  key={code}
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${gc.color}`}
                                  title={gc.name}
                                >
                                  {gc.icon} {gc.code}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className='text-xs text-gray-400 italic'>
                              No GCs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Button */}
              <div className='mt-4 pt-4 border-t border-gray-100 flex justify-end'>
                <button
                  onClick={onViewMap}
                  className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition'
                >
                  <ExternalLink className='w-4 h-4' />
                  Edit in Map View
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GraduateCapabilitiesPanel;
