import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import RichTextEditor from '../../components/Editor/RichTextEditor';
import PedagogySelector from '../../components/Wizard/PedagogySelector';
import {
  enhanceContent,
  createContent,
  updateContent,
  getContent,
  getUnits,
  generateContent,
} from '../../services/api';
import { Loader2, Sparkles, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ContentType, PedagogyType, Unit } from '../../types/index';

const ContentCreator = () => {
  const { type, unitId, contentId } = useParams<{
    type?: ContentType;
    unitId?: string;
    contentId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [contentType, setContentType] = useState<string>(type || 'lecture');
  const [units, setUnits] = useState<Unit[]>([]);
  const [pedagogy, setPedagogy] = useState<PedagogyType>('inquiry-based');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we're in edit mode
  const isEditMode = Boolean(unitId && contentId);

  useEffect(() => {
    fetchUnits();
  }, []);

  // Load existing content if in edit mode
  useEffect(() => {
    const loadExistingContent = async () => {
      if (!unitId || !contentId) return;

      setIsLoading(true);
      try {
        const response = await getContent(unitId, contentId);
        const data = response.data;
        setTitle(data.title);
        setContent(data.body || '');
        setContentType(data.contentType);
        setSelectedUnitId(data.unitId);
      } catch (error) {
        console.error('Failed to load content:', error);
        toast.error('Failed to load content for editing');
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditMode && unitId && contentId) {
      loadExistingContent();
    }
  }, [isEditMode, unitId, contentId]);

  // Pre-select unit if unitId is in URL (either route param or query param)
  useEffect(() => {
    const unitFromQuery = searchParams.get('unit');
    if (unitId) {
      setSelectedUnitId(unitId);
    } else if (unitFromQuery) {
      setSelectedUnitId(unitFromQuery);
    }
  }, [unitId, searchParams]);

  const fetchUnits = async () => {
    try {
      const response = await getUnits();
      setUnits(response.data?.units ?? []);
    } catch (error) {
      console.error('Failed to fetch units:', error);
      toast.error('Failed to load units');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate content about');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateContent(
        type || 'lecture',
        pedagogy,
        topic
      );
      const generatedContent = response.data?.content || '';
      setContent(generatedContent);
      toast.success('Content generated successfully!');
    } catch (error: unknown) {
      console.error('Error generating content:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate content';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!content) {
      toast.error('Please add some content first');
      return;
    }

    setIsGenerating(true);
    try {
      const enhanced = await enhanceContent(content, pedagogy);
      setContent(enhanced.data.content);
      toast.success('Content enhanced!');
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error('Failed to enhance content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!selectedUnitId) {
      toast.error('Please select a unit');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode && contentId) {
        // Update existing content
        await updateContent(selectedUnitId, contentId, {
          title: title.trim(),
          body: content,
        });
        toast.success('Content updated successfully!');
      } else {
        // Create new content
        await createContent(selectedUnitId, {
          title: title.trim(),
          contentType: contentType || 'lecture',
          body: content,
        });
        toast.success('Content saved successfully!');
      }
      navigate(`/units/${selectedUnitId}`);
    } catch (error: unknown) {
      console.error('Error saving content:', error);
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError.response?.data?.detail || 'Failed to save content'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='max-w-6xl mx-auto p-6 flex items-center justify-center h-64'>
        <Loader2 className='animate-spin text-purple-600' size={48} />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          {isEditMode ? 'Edit' : 'Create'}{' '}
          {contentType
            ? contentType.charAt(0).toUpperCase() + contentType.slice(1)
            : 'Content'}
        </h1>
        <p className='text-gray-600'>
          {isEditMode
            ? 'Update your content below'
            : 'AI-powered content creation with pedagogical alignment'}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='mb-4 space-y-4'>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <label
                    htmlFor='title'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Title *
                  </label>
                  <input
                    id='title'
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Enter content title...'
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div className='w-64'>
                  <label
                    htmlFor='unit'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Unit *
                  </label>
                  <select
                    id='unit'
                    value={selectedUnitId}
                    onChange={e => setSelectedUnitId(e.target.value)}
                    disabled={isEditMode}
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                  >
                    <option value=''>Select a unit...</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor='topic'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Topic for AI Generation
                </label>
                <input
                  id='topic'
                  type='text'
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder='e.g., Introduction to Machine Learning, Photosynthesis in Plants...'
                  className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Describe what you want the AI to generate content about
                </p>
              </div>

              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-semibold'>Content Editor</h2>
                <div className='flex gap-2'>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2'
                  >
                    {isGenerating ? (
                      <Loader2 className='animate-spin' size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                  <button
                    onClick={handleEnhance}
                    disabled={isGenerating || !content}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                  >
                    Enhance
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !title || !selectedUnitId || !content}
                    className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2'
                  >
                    {isSaving ? (
                      <Loader2 className='animate-spin' size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {isEditMode ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {isGenerating ? (
              <div className='border border-gray-300 rounded-lg p-8 min-h-[400px] bg-gray-50 flex flex-col items-center justify-center'>
                <Loader2
                  className='animate-spin text-purple-600 mb-4'
                  size={48}
                />
                <p className='text-gray-600 text-lg'>Generating content...</p>
                <p className='text-gray-500 text-sm mt-2'>
                  This may take a moment depending on the complexity of your
                  topic
                </p>
              </div>
            ) : (
              <RichTextEditor
                content={content}
                onChange={setContent}
                pedagogyHints={[getPedagogyHint(pedagogy)]}
              />
            )}
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Teaching Philosophy</h3>
            <PedagogySelector selected={pedagogy} onChange={setPedagogy} />
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Content Settings</h3>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='difficulty-level'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Difficulty Level
                </label>
                <select
                  id='difficulty-level'
                  className='w-full p-2 border border-gray-300 rounded-lg'
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='duration'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Duration
                </label>
                <input
                  id='duration'
                  type='text'
                  placeholder='e.g., 50 minutes'
                  className='w-full p-2 border border-gray-300 rounded-lg'
                />
              </div>

              <div>
                <label
                  htmlFor='learning-objectives'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Learning Objectives
                </label>
                <textarea
                  id='learning-objectives'
                  rows={3}
                  className='w-full p-2 border border-gray-300 rounded-lg'
                  placeholder='Enter key learning objectives...'
                />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Export Options</h3>
            <div className='space-y-2'>
              <button className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2'>
                <Download size={18} />
                Export as Word
              </button>
              <button className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2'>
                <Download size={18} />
                Export as PDF
              </button>
              <button className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2'>
                <Download size={18} />
                Export as Markdown
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPedagogyHint = (style: PedagogyType): string => {
  const hints: Record<PedagogyType, string> = {
    'inquiry-based':
      'Start with thought-provoking questions to encourage exploration.',
    'project-based': 'Include real-world applications and hands-on activities.',
    traditional: 'Focus on clear explanations and structured examples.',
    collaborative: 'Add group activities and discussion prompts.',
    'game-based': 'Incorporate challenges, points, or competitive elements.',
    constructivist: 'Help students build knowledge through guided discovery.',
    'problem-based': 'Present real-world problems that require investigation.',
    experiential: 'Include hands-on experiences and reflective activities.',
    'competency-based':
      'Focus on measurable skills and clear learning outcomes.',
  };
  return hints[style] || '';
};

export default ContentCreator;
