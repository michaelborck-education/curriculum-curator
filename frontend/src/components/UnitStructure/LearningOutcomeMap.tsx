import { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  Target,
  BookOpen,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  learningOutcomesApi,
  materialsApi,
} from '../../services/unitStructureApi';
import {
  ULOWithMappings,
  MaterialWithOutcomes,
} from '../../types/unitStructure';

interface LearningOutcomeMapProps {
  unitId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TreeNode {
  id: string;
  type: 'ulo' | 'week' | 'material' | 'llo';
  label: string;
  sublabel?: string;
  children: TreeNode[];
  isExpanded?: boolean;
  metadata?: Record<string, unknown>;
}

const BLOOM_COLORS: Record<string, string> = {
  remember: 'bg-blue-100 text-blue-800',
  understand: 'bg-green-100 text-green-800',
  apply: 'bg-yellow-100 text-yellow-800',
  analyze: 'bg-orange-100 text-orange-800',
  evaluate: 'bg-purple-100 text-purple-800',
  create: 'bg-red-100 text-red-800',
};

export const LearningOutcomeMap: React.FC<LearningOutcomeMapProps> = ({
  unitId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load ULOs with mappings
      const ulos = await learningOutcomesApi.getULOsByUnit(unitId, true);

      // Load all materials
      const materials = await materialsApi.getMaterialsByUnit(unitId);

      // Load materials with outcomes for LLO data
      const materialsWithOutcomes: MaterialWithOutcomes[] = await Promise.all(
        materials.map(m => materialsApi.getMaterial(m.id, true))
      );

      // Build tree structure
      const tree = buildTree(ulos, materialsWithOutcomes);
      setTreeData(tree);

      // Auto-expand ULOs
      const initialExpanded = new Set(ulos.map(ulo => `ulo-${ulo.id}`));
      setExpandedNodes(initialExpanded);
    } catch (err) {
      console.error('Error loading learning outcome data:', err);
      setError('Failed to load learning outcome hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, unitId]);

  const buildTree = (
    ulos: ULOWithMappings[],
    materials: MaterialWithOutcomes[]
  ): TreeNode[] => {
    // Group materials by week
    const materialsByWeek = new Map<number, MaterialWithOutcomes[]>();
    materials.forEach(m => {
      const week = m.weekNumber;
      if (!materialsByWeek.has(week)) {
        materialsByWeek.set(week, []);
      }
      materialsByWeek.get(week)!.push(m);
    });

    // Build tree for each ULO
    return ulos.map(ulo => {
      // Find materials mapped to this ULO
      const mappedMaterials = materials.filter(m =>
        m.mappedUlos?.some(u => u.id === ulo.id)
      );

      // Group mapped materials by week
      const weekNodes: TreeNode[] = [];
      const weekGroups = new Map<number, MaterialWithOutcomes[]>();

      mappedMaterials.forEach(m => {
        if (!weekGroups.has(m.weekNumber)) {
          weekGroups.set(m.weekNumber, []);
        }
        weekGroups.get(m.weekNumber)!.push(m);
      });

      // Sort weeks and create nodes
      Array.from(weekGroups.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([weekNum, weekMaterials]) => {
          const materialNodes: TreeNode[] = weekMaterials.map(m => {
            // Get LLOs for this material
            const lloNodes: TreeNode[] = (m.localOutcomes || []).map(llo => ({
              id: `llo-${llo.id}`,
              type: 'llo' as const,
              label: llo.description,
              children: [],
            }));

            return {
              id: `material-${m.id}`,
              type: 'material' as const,
              label: m.title,
              sublabel: m.type,
              children: lloNodes,
              metadata: { type: m.type, duration: m.durationMinutes },
            };
          });

          weekNodes.push({
            id: `week-${ulo.id}-${weekNum}`,
            type: 'week' as const,
            label: `Week ${weekNum}`,
            children: materialNodes,
          });
        });

      return {
        id: `ulo-${ulo.id}`,
        type: 'ulo' as const,
        label: ulo.code,
        sublabel: ulo.description,
        children: weekNodes,
        metadata: {
          bloomLevel: ulo.bloomLevel,
          materialCount: ulo.materialCount,
          assessmentCount: ulo.assessmentCount,
        },
      };
    });
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const paddingLeft = depth * 20 + 12;

    const getIcon = () => {
      switch (node.type) {
        case 'ulo':
          return <Target className='w-4 h-4 text-purple-600' />;
        case 'week':
          return <BookOpen className='w-4 h-4 text-blue-600' />;
        case 'material':
          return <FileText className='w-4 h-4 text-green-600' />;
        case 'llo':
          return <div className='w-2 h-2 rounded-full bg-gray-400 ml-1 mr-1' />;
        default:
          return null;
      }
    };

    return (
      <div key={node.id}>
        <div
          className={`flex items-start gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer transition ${
            node.type === 'ulo' ? 'bg-purple-50' : ''
          }`}
          style={{ paddingLeft }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            <button className='mt-0.5 text-gray-400 hover:text-gray-600'>
              {isExpanded ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
            </button>
          ) : (
            <div className='w-4' />
          )}

          {getIcon()}

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span
                className={`font-medium ${node.type === 'ulo' ? 'text-purple-900' : 'text-gray-900'}`}
              >
                {node.label}
              </span>

              {/* Bloom level badge for ULOs */}
              {node.type === 'ulo' &&
              node.metadata?.bloomLevel &&
              typeof node.metadata.bloomLevel === 'string' ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    BLOOM_COLORS[
                      (node.metadata.bloomLevel as string).toLowerCase()
                    ] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {String(node.metadata.bloomLevel)}
                </span>
              ) : null}

              {/* Material type badge */}
              {node.type === 'material' && node.sublabel ? (
                <span className='px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600'>
                  {node.sublabel}
                </span>
              ) : null}
            </div>

            {/* Sublabel (description) */}
            {node.sublabel && node.type === 'ulo' && (
              <p className='text-sm text-gray-600 mt-0.5 line-clamp-2'>
                {node.sublabel}
              </p>
            )}

            {/* Stats for ULOs */}
            {node.type === 'ulo' && node.metadata && (
              <div className='flex items-center gap-3 mt-1 text-xs text-gray-500'>
                <span>{node.metadata.materialCount as number} materials</span>
                <span>
                  {node.metadata.assessmentCount as number} assessments
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>{node.children.map(child => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Learning Outcome Hierarchy
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                ULOs &rarr; Weekly Content &rarr; Materials &rarr; Local
                Outcomes
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 text-purple-600 animate-spin' />
                <span className='ml-3 text-gray-600'>Loading hierarchy...</span>
              </div>
            ) : error ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <AlertCircle className='w-12 h-12 text-red-400 mb-3' />
                <p className='text-gray-900 font-medium'>{error}</p>
                <button
                  onClick={loadData}
                  className='mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition'
                >
                  Try Again
                </button>
              </div>
            ) : treeData.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Target className='w-12 h-12 text-gray-300 mb-3' />
                <p className='text-gray-900 font-medium'>
                  No Learning Outcomes Defined
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Add Unit Learning Outcomes (ULOs) to see the hierarchy map.
                </p>
              </div>
            ) : (
              <div className='py-2'>
                {treeData.map(node => renderNode(node))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4 text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <Target className='w-3 h-3 text-purple-600' />
                  Unit Learning Outcome
                </span>
                <span className='flex items-center gap-1'>
                  <BookOpen className='w-3 h-3 text-blue-600' />
                  Week
                </span>
                <span className='flex items-center gap-1'>
                  <FileText className='w-3 h-3 text-green-600' />
                  Material
                </span>
                <span className='flex items-center gap-1'>
                  <div className='w-2 h-2 rounded-full bg-gray-400' />
                  Local Outcome
                </span>
              </div>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningOutcomeMap;
