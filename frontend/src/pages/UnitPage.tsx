import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Target,
  FileText,
  BarChart3,
  Edit,
  Trash2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { getUnit, deleteUnit as deleteUnitApi } from '../services/api';
import ULOManager from '../components/UnitStructure/ULOManager';
import { WeeklyMaterialsManager } from '../components/UnitStructure/WeeklyMaterialsManager';
import { AssessmentsManager } from '../components/UnitStructure/AssessmentsManager';
import CoursePlanner from '../components/UnitStructure/CoursePlanner';
import type { Unit } from '../types';
import { LoadingState, Button, Modal, Alert } from '../components/ui';
import toast from 'react-hot-toast';

type TabType = 'structure' | 'outcomes' | 'assessments' | 'analytics';

const UnitPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  // Get active tab and week from URL
  const activeTab = (searchParams.get('tab') as TabType) || 'structure';
  const selectedWeek = parseInt(searchParams.get('week') || '1', 10);

  const setActiveTab = (tab: TabType) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    if (tab !== 'structure') {
      params.delete('week');
    }
    setSearchParams(params);
  };

  const setSelectedWeek = (week: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'structure');
    params.set('week', String(week));
    setSearchParams(params);
  };

  const fetchUnit = useCallback(async () => {
    if (!unitId) return;
    try {
      setLoading(true);
      const response = await getUnit(unitId);
      setUnit(response.data);
    } catch (err) {
      setError('Failed to load unit');
      console.error('Error fetching unit:', err);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    fetchUnit();
  }, [fetchUnit]);

  const handleDelete = async () => {
    if (!unitId) return;
    try {
      setDeleting(true);
      await deleteUnitApi(unitId);
      toast.success('Unit deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete unit');
      console.error('Error deleting unit:', err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const tabs = [
    {
      id: 'structure' as TabType,
      label: 'Structure & Content',
      icon: <Calendar className='w-4 h-4' />,
    },
    {
      id: 'outcomes' as TabType,
      label: 'Learning Outcomes',
      icon: <Target className='w-4 h-4' />,
    },
    {
      id: 'assessments' as TabType,
      label: 'Assessments',
      icon: <FileText className='w-4 h-4' />,
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: <BarChart3 className='w-4 h-4' />,
    },
  ];

  if (loading) {
    return <LoadingState message='Loading unit...' />;
  }

  if (error || !unit) {
    return (
      <div className='p-6'>
        <Alert variant='error'>{error || 'Unit not found'}</Alert>
        <Button className='mt-4' onClick={() => navigate('/')}>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const durationWeeks = unit.durationWeeks || 12;

  return (
    <div className='min-h-full'>
      {/* Unit Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-6 py-4'>
          <div className='flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {unit.code}
                </h1>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    unit.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : unit.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {unit.status}
                </span>
              </div>
              <p className='text-lg text-gray-600 mt-1'>{unit.title}</p>
              {unit.description && (
                <p className='text-sm text-gray-500 mt-2 max-w-2xl'>
                  {unit.description}
                </p>
              )}
              <div className='flex items-center gap-4 mt-3 text-sm text-gray-500'>
                <span>{unit.semester}</span>
                <span>•</span>
                <span>{unit.creditPoints} credits</span>
                <span>•</span>
                <span>{durationWeeks} weeks</span>
                {unit.pedagogyType && (
                  <>
                    <span>•</span>
                    <span className='capitalize'>
                      {unit.pedagogyType.replace(/-/g, ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => navigate(`/units/${unitId}/edit`)}
              >
                <Edit className='w-4 h-4 mr-1' />
                Edit
              </Button>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setShowDeleteModal(true)}
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='px-6'>
          <nav className='-mb-px flex space-x-8'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className='p-6'>
        {activeTab === 'structure' && (
          <div>
            {/* Course Planner Toggle */}
            <div className='flex justify-end mb-4'>
              <Button
                variant={showPlanner ? 'primary' : 'secondary'}
                size='sm'
                onClick={() => setShowPlanner(!showPlanner)}
              >
                <Sparkles className='w-4 h-4 mr-1' />
                {showPlanner ? 'Close Planner' : 'Open Course Planner'}
              </Button>
            </div>

            {/* Course Planner */}
            {showPlanner && unit && (
              <CoursePlanner
                unit={unit}
                onApplySchedule={() => {
                  // TODO: Apply the generated schedule to the unit
                  setShowPlanner(false);
                }}
                onClose={() => setShowPlanner(false)}
              />
            )}

            <StructureTab
              unitId={unitId!}
              durationWeeks={durationWeeks}
              selectedWeek={selectedWeek}
              onWeekSelect={setSelectedWeek}
            />
          </div>
        )}

        {activeTab === 'outcomes' && <ULOManager unitId={unitId!} />}

        {activeTab === 'assessments' && <AssessmentsManager unitId={unitId!} />}

        {activeTab === 'analytics' && (
          <AnalyticsTab unitId={unitId!} unitName={unit.title} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='Delete Unit'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>
            Are you sure you want to delete{' '}
            <strong>
              {unit.code} - {unit.title}
            </strong>
            ?
          </p>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-sm text-red-800'>
              This will permanently delete:
            </p>
            <ul className='mt-2 text-sm text-red-700 list-disc list-inside'>
              <li>All content and materials</li>
              <li>All learning outcomes</li>
              <li>All assessments</li>
              <li>The entire version history</li>
            </ul>
            <p className='mt-2 text-sm font-medium text-red-800'>
              This action cannot be undone.
            </p>
          </div>
          <div className='flex justify-end gap-3'>
            <Button
              variant='secondary'
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete Unit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Structure Tab Component
interface StructureTabProps {
  unitId: string;
  durationWeeks: number;
  selectedWeek: number;
  onWeekSelect: (week: number) => void;
}

const StructureTab = ({
  unitId,
  durationWeeks,
  selectedWeek,
  onWeekSelect,
}: StructureTabProps) => {
  const weeks = Array.from({ length: durationWeeks }, (_, i) => i + 1);

  return (
    <div className='flex gap-6'>
      {/* Week Selector - Left Panel */}
      <div className='w-48 flex-shrink-0'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>Weeks</h3>
          <div className='space-y-1'>
            {weeks.map(week => (
              <button
                key={week}
                onClick={() => onWeekSelect(week)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  selectedWeek === week
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week Content - Main Panel */}
      <div className='flex-1'>
        <WeeklyMaterialsManager unitId={unitId} weekNumber={selectedWeek} />
      </div>
    </div>
  );
};

// Analytics Tab Component (placeholder)
interface AnalyticsTabProps {
  unitId: string;
  unitName: string;
}

const AnalyticsTab = ({ unitName }: AnalyticsTabProps) => {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        {unitName} Analytics
      </h3>
      <p className='text-gray-500'>
        Analytics and reports for this unit will be displayed here.
      </p>
      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='p-4 bg-gray-50 rounded-lg'>
          <p className='text-2xl font-bold text-gray-900'>0</p>
          <p className='text-sm text-gray-600'>Total Materials</p>
        </div>
        <div className='p-4 bg-gray-50 rounded-lg'>
          <p className='text-2xl font-bold text-gray-900'>0</p>
          <p className='text-sm text-gray-600'>Learning Outcomes</p>
        </div>
        <div className='p-4 bg-gray-50 rounded-lg'>
          <p className='text-2xl font-bold text-gray-900'>0%</p>
          <p className='text-sm text-gray-600'>Completion</p>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
