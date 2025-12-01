import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Download,
  Share,
  BookOpen,
  Clock,
  Users,
  Target,
  LucideIcon,
  Plus,
  FileText,
  Trash2,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUnit, getUnitContents, deleteContent } from '../../services/api';
import { Modal, Button, EmptyState } from '../../components/ui';
import type { Unit, UnitModule, ContentType, Content } from '../../types/index';

const UnitView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        setContentLoading(false);
        return;
      }

      try {
        const [unitResponse, contentsResponse] = await Promise.all([
          getUnit(id),
          getUnitContents(id),
        ]);
        setUnit(unitResponse.data);
        setContents(contentsResponse.data?.contents || []);
      } catch (error: unknown) {
        console.error('Failed to fetch unit:', error);
        toast.error('Failed to load unit');
      } finally {
        setLoading(false);
        setContentLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteContent = async () => {
    if (!contentToDelete || !id) return;

    setIsDeleting(true);
    try {
      await deleteContent(id, contentToDelete.id);
      setContents(contents.filter(c => c.id !== contentToDelete.id));
      toast.success('Content deleted successfully');
    } catch (error: unknown) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setContentToDelete(null);
    }
  };

  const openDeleteModal = (content: Content) => {
    setContentToDelete(content);
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Unit not found
        </h2>
        <Link to='/courses' className='text-purple-600 hover:text-purple-700'>
          ← Back to courses
        </Link>
      </div>
    );
  }

  const getModuleIcon = (type: ContentType): LucideIcon => {
    const icons: Record<ContentType, LucideIcon> = {
      lecture: BookOpen,
      assignment: Edit,
      project: Target,
      quiz: Users,
    };
    return icons[type] || BookOpen;
  };

  const getContentIcon = (type: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      lecture: BookOpen,
      assignment: Edit,
      project: Target,
      quiz: Users,
      worksheet: FileText,
      lab: Target,
      case_study: FileText,
      reading: BookOpen,
      video_script: FileText,
    };
    return icons[type] || FileText;
  };

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='mb-6'>
        <Link
          to='/courses'
          className='inline-flex items-center text-purple-600 hover:text-purple-700 mb-4'
        >
          <ArrowLeft size={20} className='mr-2' />
          Back to courses
        </Link>

        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {unit.title}
            </h1>
            <p className='text-gray-600 text-lg mb-4'>{unit.description}</p>

            <div className='flex gap-4 text-sm text-gray-500'>
              <span className='flex items-center gap-1'>
                <Clock size={16} />
                {unit.durationWeeks} weeks
              </span>
              <span className='capitalize'>{unit.difficultyLevel}</span>
              <span className='capitalize'>
                {unit.pedagogyType.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className='flex gap-2'>
            <button className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2'>
              <Edit size={18} />
              Edit Unit
            </button>
            <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
              <Share size={18} />
              Share
            </button>
            <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          {/* Content Section */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Content</h2>
              <Button
                variant='primary'
                onClick={() => navigate(`/create/lecture?unit=${id}`)}
              >
                <Plus size={18} />
                Add Content
              </Button>
            </div>

            {contentLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='animate-spin text-purple-600' size={32} />
              </div>
            ) : contents.length === 0 ? (
              <EmptyState
                title='No content yet'
                description='Create your first piece of content for this unit'
                actionLabel='Create Content'
                onAction={() => navigate(`/create/lecture?unit=${id}`)}
              />
            ) : (
              <div className='space-y-3'>
                {contents.map((content: Content) => {
                  const IconComponent = getContentIcon(content.contentType);

                  return (
                    <div
                      key={content.id}
                      className='p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer group'
                      onClick={() =>
                        navigate(`/units/${id}/content/${content.id}`)
                      }
                    >
                      <div className='flex items-center gap-4'>
                        <div className='p-2 rounded-full bg-gray-100 group-hover:bg-purple-100'>
                          <IconComponent
                            size={20}
                            className='text-gray-600 group-hover:text-purple-600'
                          />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h3 className='font-medium text-gray-900 truncate'>
                            {content.title}
                          </h3>
                          <div className='flex items-center gap-3 text-sm text-gray-500'>
                            <span className='capitalize'>
                              {content.contentType}
                            </span>
                            {content.estimatedDurationMinutes && (
                              <span className='flex items-center gap-1'>
                                <Clock size={14} />
                                {content.estimatedDurationMinutes} min
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                content.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {content.status}
                            </span>
                          </div>
                        </div>

                        <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigate(
                                `/units/${id}/content/${content.id}/edit`
                              );
                            }}
                            className='p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg'
                            title='Edit'
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              openDeleteModal(content);
                            }}
                            className='p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg'
                            title='Delete'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legacy Modules Section (if any) */}
          {unit.modules && unit.modules.length > 0 && (
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-semibold mb-4'>Unit Modules</h2>

              <div className='space-y-4'>
                {unit.modules?.map((module: UnitModule, index: number) => {
                  const IconComponent = getModuleIcon(module.type);

                  return (
                    <div
                      key={module.id}
                      className={`
                        p-4 rounded-lg border-2 flex items-center gap-4
                        ${
                          module.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      <div
                        className={`
                        p-2 rounded-full
                        ${module.completed ? 'bg-green-100' : 'bg-gray-100'}
                      `}
                      >
                        <IconComponent
                          size={20}
                          className={
                            module.completed
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        />
                      </div>

                      <div className='flex-1'>
                        <h3 className='font-medium text-gray-900'>
                          Module {index + 1}: {module.title}
                        </h3>
                        <p className='text-sm text-gray-600 capitalize'>
                          {module.type}
                        </p>
                      </div>

                      {module.completed && (
                        <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                          <svg
                            className='w-4 h-4 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className='space-y-6'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Learning Objectives</h3>
            <ul className='space-y-2'>
              {[
                'Understand core concepts',
                'Apply knowledge',
                'Develop skills',
              ].map((objective: string, index: number) => (
                <li key={index} className='flex items-start gap-2'>
                  <Target
                    size={16}
                    className='text-purple-600 mt-1 flex-shrink-0'
                  />
                  <span className='text-gray-700'>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Unit Details</h3>
            <div className='space-y-3'>
              <div>
                <div className='text-sm font-medium text-gray-500'>Created</div>
                <p className='text-gray-900'>{unit.createdAt}</p>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>
                  Teaching Approach
                </div>
                <p className='text-gray-900 capitalize'>
                  {unit.pedagogyType.replace('-', ' ')}
                </p>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>
                  Difficulty
                </div>
                <p className='text-gray-900 capitalize'>
                  {unit.difficultyLevel}
                </p>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>
                  Duration
                </div>
                <p className='text-gray-900'>{unit.durationWeeks} weeks</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
            <div className='space-y-2'>
              <Link
                to={`/create/lecture?unit=${id}`}
                className='w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center justify-center gap-2'
              >
                <BookOpen size={18} />
                Add Lecture
              </Link>
              <Link
                to={`/create/assignment?unit=${id}`}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2'
              >
                <Edit size={18} />
                Add Assignment
              </Link>
              <Link
                to={`/create/quiz?unit=${id}`}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2'
              >
                <Users size={18} />
                Add Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Content'
        size='sm'
      >
        <p className='text-gray-600 mb-6'>
          Are you sure you want to delete &ldquo;{contentToDelete?.title}
          &rdquo;? This action cannot be undone.
        </p>
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={handleDeleteContent}
            disabled={isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UnitView;
