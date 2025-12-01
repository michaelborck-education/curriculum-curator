import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import api, {
  createUnit as createUnitApi,
  getUnits as getUnitsApi,
  deleteUnit as deleteUnitApi,
} from '../../services/api';

// Import shared UI components
import {
  Modal,
  Alert,
  Button,
  LoadingState,
  EmptyState,
  FormInput,
  FormTextarea,
  FormSelect,
} from '../../components/ui';
import { useModal } from '../../hooks';

// Import Unit type from global types
import type { Unit } from '../../types';

interface UnitFormData {
  title: string;
  code: string;
  description: string;
  year: number;
  semester: string;
  pedagogyType: string;
  difficultyLevel: string;
  durationWeeks: number;
  creditPoints: number;
  prerequisites: string;
  learningHours: number;
}

const initialFormData: UnitFormData = {
  title: '',
  code: '',
  description: '',
  year: new Date().getFullYear(),
  semester: 'semester_1',
  pedagogyType: 'inquiry-based',
  difficultyLevel: 'intermediate',
  durationWeeks: 12,
  creditPoints: 25,
  prerequisites: '',
  learningHours: 150,
};

const semesterOptions = [
  { value: 'semester_1', label: 'Semester 1' },
  { value: 'semester_2', label: 'Semester 2' },
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
];

const pedagogyOptions = [
  { value: 'inquiry-based', label: 'Inquiry Based' },
  { value: 'project-based', label: 'Project Based' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'game-based', label: 'Game Based' },
  { value: 'constructivist', label: 'Constructivist' },
  { value: 'problem-based', label: 'Problem Based' },
  { value: 'experiential', label: 'Experiential' },
  { value: 'competency-based', label: 'Competency Based' },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const UnitManager = () => {
  const navigate = useNavigate();
  const createModal = useModal();

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemDefaults, setSystemDefaults] = useState({
    creditPoints: 25,
    durationWeeks: 12,
  });
  const [newUnit, setNewUnit] = useState<UnitFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUnitsApi();
      // API returns { units: [...], total: X }
      const unitList = response.data;
      setUnits(Array.isArray(unitList?.units) ? unitList.units : []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemDefaults = useCallback(async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data) {
        const defaults = {
          creditPoints: response.data.defaultCreditPoints || 25,
          durationWeeks: response.data.defaultDurationWeeks || 12,
        };
        setSystemDefaults(defaults);
        setNewUnit(prev => ({
          ...prev,
          creditPoints: defaults.creditPoints,
          durationWeeks: defaults.durationWeeks,
        }));
      }
    } catch {
      // Use default values if settings can't be fetched
    }
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchSystemDefaults();
  }, [fetchUnits, fetchSystemDefaults]);

  const createUnit = async () => {
    setError(null);

    if (!newUnit.title || !newUnit.code) {
      setError('Unit title and code are required');
      return;
    }

    try {
      setCreating(true);
      const unitData = {
        title: newUnit.title,
        code: newUnit.code,
        description: newUnit.description || '',
        year: newUnit.year,
        semester: newUnit.semester,
        pedagogyType: newUnit.pedagogyType,
        difficultyLevel: newUnit.difficultyLevel,
        durationWeeks: newUnit.durationWeeks,
        creditPoints: newUnit.creditPoints,
        prerequisites: newUnit.prerequisites || '',
        learningHours: newUnit.learningHours || 150,
        status: 'draft',
      };

      const response = await createUnitApi(unitData);
      setUnits([...units, response.data]);
      createModal.close();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const extractErrorMessage = (err: unknown): string => {
    const error = err as {
      response?: {
        data?: { detail?: string | Array<{ loc?: string[]; msg: string }> };
      };
    };
    const errorDetail = error.response?.data?.detail;

    if (typeof errorDetail === 'string') {
      return errorDetail;
    }

    if (Array.isArray(errorDetail)) {
      const fieldMapping: Record<string, string> = {
        creditPoints: 'Credit Points',
        durationWeeks: 'Duration',
        learningHours: 'Learning Hours',
        title: 'Unit Title',
        code: 'Unit Code',
        year: 'Year',
      };

      const messages = errorDetail.map(err => {
        const fieldName = err.loc?.[err.loc.length - 1];
        const displayName = fieldName
          ? fieldMapping[fieldName] || fieldName
          : '';
        let msg = err.msg || 'Invalid value';

        const lessMatch = msg.match(/less than or equal to (\d+)/);
        if (lessMatch) msg = `Must be ${lessMatch[1]} or less`;

        const greaterMatch = msg.match(/greater than or equal to (\d+)/);
        if (greaterMatch) msg = `Must be ${greaterMatch[1]} or more`;

        return displayName ? `${displayName}: ${msg}` : msg;
      });

      return messages.join('. ');
    }

    return 'Failed to create unit. Please check all required fields and try again.';
  };

  const resetForm = () => {
    setNewUnit({
      ...initialFormData,
      durationWeeks: systemDefaults.durationWeeks,
      creditPoints: systemDefaults.creditPoints,
    });
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    createModal.open();
  };

  const deleteUnit = async (unitId: string) => {
    const unitToDelete = units.find(u => u.id === unitId);
    const unitName = unitToDelete
      ? `"${unitToDelete.code} - ${unitToDelete.title}"`
      : 'this unit';

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${unitName}?\n\n` +
        'This will delete:\n' +
        '- All content and materials\n' +
        '- All learning outcomes\n' +
        '- All assessments\n' +
        '- The entire version history\n\n' +
        'This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await deleteUnitApi(unitId);
        setUnits(units.filter(c => c.id !== unitId));
      } catch {
        setError('Failed to delete unit. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof Edit }> = {
      PLANNING: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      ARCHIVED: { color: 'bg-gray-100 text-gray-600', icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.PLANNING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className='h-3 w-3 mr-1' />
        {status}
      </span>
    );
  };

  const updateField = (field: keyof UnitFormData, value: string | number) => {
    setNewUnit(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <LoadingState message='Loading units...' />;
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>My Units</h1>
          <p className='text-gray-600 mt-2'>
            Manage your unit curriculum and learning resources
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            {units.length} unit(s) loaded
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className='h-5 w-5 mr-2' />
          New Unit
        </Button>
      </div>

      {/* Units Grid */}
      {units.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title='No Units Yet'
          description='Create your first unit to start building curriculum'
          actionLabel='Create Your First Unit'
          onAction={openCreateModal}
        />
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {units.map(unit => (
            <div
              key={unit.id}
              className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => navigate(`/units/${unit.id}/dashboard`)}
            >
              <div className='p-6'>
                {/* Unit Header */}
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                      {unit.title}
                    </h3>
                    <p className='text-sm text-gray-600'>{unit.code}</p>
                  </div>
                  {getStatusBadge(unit.status)}
                </div>

                {/* Unit Description */}
                {unit.description && (
                  <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                    {unit.description}
                  </p>
                )}

                {/* Unit Stats */}
                <div className='space-y-2 mb-4'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 mr-2' />
                    {unit.semester || 'Not set'} • {unit.creditPoints || 0}{' '}
                    credits
                  </div>
                  <div className='flex items-center text-sm text-gray-600'>
                    <Users className='h-4 w-4 mr-2' />
                    {unit.pedagogyType
                      ? unit.pedagogyType
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'}
                  </div>
                </div>

                {/* Progress Bar */}
                {unit.progressPercentage !== undefined && (
                  <div className='mb-4'>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-gray-600'>Progress</span>
                      <span className='font-medium'>
                        {unit.progressPercentage}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all'
                        style={{ width: `${unit.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className='grid grid-cols-3 gap-2 mb-4'>
                  <div className='text-center'>
                    <p className='text-lg font-semibold text-gray-900'>
                      {unit.moduleCount || 0}
                    </p>
                    <p className='text-xs text-gray-600'>Modules</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-semibold text-gray-900'>
                      {unit.materialCount || 0}
                    </p>
                    <p className='text-xs text-gray-600'>Materials</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-semibold text-gray-900'>
                      {unit.lrdCount || 0}
                    </p>
                    <p className='text-xs text-gray-600'>LRDs</p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex justify-between items-center'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/units/${unit.id}/structure`);
                      }}
                      className='p-2 text-purple-600 hover:bg-purple-50 rounded-lg'
                      title='Unit Structure'
                    >
                      <Target className='h-4 w-4' />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/units/${unit.id}/dashboard`);
                      }}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'
                      title='Manage LRDs'
                    >
                      <FileText className='h-4 w-4' />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // Navigate to edit unit
                      }}
                      className='p-2 text-gray-600 hover:bg-gray-50 rounded-lg'
                      title='Edit Unit'
                    >
                      <Edit className='h-4 w-4' />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteUnit(unit.id);
                      }}
                      className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                      title='Delete Unit'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                  <ChevronRight className='h-5 w-5 text-gray-400' />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Unit Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title='Create New Unit'
        size='lg'
      >
        {error && (
          <Alert
            variant='error'
            onDismiss={() => setError(null)}
            className='mb-4'
          >
            {error}
          </Alert>
        )}

        <div className='space-y-4'>
          <FormInput
            label='Unit Title'
            required
            value={newUnit.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder='e.g., Programming Fundamentals'
          />

          <FormInput
            label='Unit Code'
            required
            value={newUnit.code}
            onChange={e => updateField('code', e.target.value)}
            placeholder='e.g., CS101'
          />

          <FormTextarea
            label='Description'
            value={newUnit.description}
            onChange={e => updateField('description', e.target.value)}
            rows={3}
            placeholder='Brief description of the unit...'
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormInput
              label='Year'
              type='number'
              value={newUnit.year}
              onChange={e => updateField('year', parseInt(e.target.value))}
              min={2020}
              max={2100}
            />

            <FormSelect
              label='Semester'
              value={newUnit.semester}
              onChange={e => updateField('semester', e.target.value)}
              options={semesterOptions}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormInput
              label='Credit Points'
              type='number'
              value={newUnit.creditPoints}
              onChange={e =>
                updateField('creditPoints', parseInt(e.target.value))
              }
              min={1}
              max={100}
            />

            <FormInput
              label='Duration (weeks)'
              type='number'
              value={newUnit.durationWeeks}
              onChange={e =>
                updateField('durationWeeks', parseInt(e.target.value))
              }
              min={1}
              max={52}
            />
          </div>

          <FormSelect
            label='Pedagogy Type'
            value={newUnit.pedagogyType}
            onChange={e => updateField('pedagogyType', e.target.value)}
            options={pedagogyOptions}
          />

          <FormSelect
            label='Difficulty Level'
            value={newUnit.difficultyLevel}
            onChange={e => updateField('difficultyLevel', e.target.value)}
            options={difficultyOptions}
          />
        </div>

        <div className='flex justify-end space-x-3 mt-6'>
          <Button variant='secondary' onClick={createModal.close}>
            Cancel
          </Button>
          <Button onClick={createUnit} loading={creating}>
            Create Unit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UnitManager;
