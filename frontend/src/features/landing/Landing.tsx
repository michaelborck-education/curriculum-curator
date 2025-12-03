import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  Brain,
  CheckCircle,
} from 'lucide-react';
import type { LandingProps } from '../../types/index';

const Landing = ({ onSignInClick }: LandingProps) => {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Creation',
      description:
        'Generate pedagogically-aligned content with AI that understands your teaching style.',
    },
    {
      icon: Target,
      title: '9 Teaching Styles',
      description:
        'From Traditional to Inquiry-Based - choose the approach that fits your philosophy.',
    },
    {
      icon: BookOpen,
      title: 'Unit Structure',
      description:
        'Plan 12-week units with learning outcomes, weekly materials, and assessments.',
    },
    {
      icon: Upload,
      title: 'Import & Enhance',
      description:
        'Bring existing materials and let AI help improve and align them.',
    },
    {
      icon: CheckCircle,
      title: 'Accreditation Ready',
      description:
        'Map to Graduate Capabilities and AACSB Assurance of Learning standards.',
    },
  ];

  const highlights = [
    {
      title: 'Start with Your Style',
      description:
        'Take a quick quiz to discover your teaching philosophy, or choose manually. The AI adapts to generate content that matches your approach.',
      image: '🎯',
    },
    {
      title: 'Build Your Unit',
      description:
        'Create unit learning outcomes, plan your 12-week structure, add materials week by week, and design assessments - all in one place.',
      image: '📚',
    },
    {
      title: 'Let AI Help',
      description:
        'Generate content, enhance existing materials, or get suggestions. AI assistance is always optional - you stay in control.',
      image: '✨',
    },
    {
      title: 'Track Alignment',
      description:
        'Visual hierarchy maps show how outcomes connect to materials. Graduate Capability and AoL mappings support accreditation.',
      image: '🗺️',
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % highlights.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [highlights.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % highlights.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + highlights.length) % highlights.length);
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Simple Navigation */}
      <nav className='bg-white px-6 md:px-8 py-4 flex justify-between items-center border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          <GraduationCap className='w-7 h-7 text-purple-600' />
          <span className='text-lg font-bold text-gray-900'>
            Curriculum Curator
          </span>
        </div>
        <button
          onClick={onSignInClick}
          className='bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm'
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className='bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 md:px-8 py-16 md:py-24'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight'>
            Create Unit Content
            <br />
            <span className='text-purple-600'>That Teaches Your Way</span>
          </h1>
          <p className='text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            An AI-powered platform for educators. Build pedagogically-aligned
            units with learning outcomes, weekly materials, and assessments.
          </p>
          <button
            onClick={onSignInClick}
            className='bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg inline-flex items-center gap-2 shadow-lg shadow-purple-200'
          >
            Get Started
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </section>

      {/* How It Works - Carousel */}
      <section className='px-6 md:px-8 py-16 bg-white'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
            How It Works
          </h2>

          <div className='relative bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12'>
            {/* Carousel Content */}
            <div className='text-center'>
              <div className='text-6xl mb-6'>
                {highlights[currentSlide].image}
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                {highlights[currentSlide].title}
              </h3>
              <p className='text-gray-600 max-w-lg mx-auto'>
                {highlights[currentSlide].description}
              </p>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition'
            >
              <ChevronLeft className='w-6 h-6' />
            </button>
            <button
              onClick={nextSlide}
              className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition'
            >
              <ChevronRight className='w-6 h-6' />
            </button>

            {/* Dots */}
            <div className='flex justify-center gap-2 mt-8'>
              {highlights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className='px-6 md:px-8 py-16 bg-gray-50'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-5 bg-white rounded-xl hover:bg-purple-50 transition-colors group border border-gray-100'
                >
                  <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors'>
                    <Icon className='w-5 h-5 text-purple-600' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 text-sm'>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-6 md:px-8 py-16 bg-purple-600'>
        <div className='max-w-3xl mx-auto text-center text-white'>
          <Sparkles className='w-10 h-10 mx-auto mb-4 opacity-80' />
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>
            Ready to Create Better Unit Content?
          </h2>
          <p className='text-lg opacity-90 mb-8'>
            Join educators using AI to build pedagogically-aligned materials.
          </p>
          <button
            onClick={onSignInClick}
            className='bg-white text-purple-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg inline-flex items-center gap-2'
          >
            Get Started Free
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className='px-6 md:px-8 py-8 bg-gray-900 text-gray-400'>
        <div className='max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='flex items-center gap-2'>
            <GraduationCap className='w-5 h-5 text-purple-400' />
            <span className='text-sm font-medium text-white'>
              Curriculum Curator
            </span>
          </div>
          <p className='text-sm'>
            Built by educators, for educators. Open source.
          </p>
          <p className='text-sm'>&copy; 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
