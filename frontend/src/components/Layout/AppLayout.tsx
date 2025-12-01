import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  FileText,
  Calendar,
  Brain,
  Home,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getUnits } from '../../services/api';
import type { Unit } from '../../types';

interface AppLayoutProps {
  onLogout?: () => void;
}

interface WeekItem {
  weekNumber: number;
  label: string;
}

// Generate weeks for a unit based on its duration
const generateWeeks = (durationWeeks: number): WeekItem[] => {
  return Array.from({ length: durationWeeks }, (_, i) => ({
    weekNumber: i + 1,
    label: `Week ${i + 1}`,
  }));
};

const AppLayout = ({ onLogout }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authStoreLogout } = useAuthStore();
  const logout = onLogout || authStoreLogout;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Get current unit ID from URL
  const currentUnitId = location.pathname.match(/\/units\/([^/]+)/)?.[1];

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUnits();
      setUnits(response.data?.units ?? []);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Auto-expand current unit
  useEffect(() => {
    if (currentUnitId) {
      setExpandedUnits(prev => new Set([...prev, currentUnitId]));
    }
  }, [currentUnitId]);

  const toggleUnitExpand = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const isActive = (path: string): boolean => location.pathname === path;
  const isUnitActive = (unitId: string): boolean =>
    location.pathname.includes(`/units/${unitId}`);

  return (
    <div className='h-screen flex overflow-hidden bg-gray-50'>
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
          role='button'
          tabIndex={0}
          onClick={() => setMobileSidebarOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              setMobileSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-all duration-300 
          fixed lg:static inset-y-0 left-0 z-50 
          ${sidebarOpen ? 'w-72' : 'w-16'} 
          bg-gray-900 text-white flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className='p-4 border-b border-gray-800'>
          <div className='flex items-center justify-between'>
            <div
              className='flex items-center gap-2 cursor-pointer'
              onClick={() => navigate('/')}
            >
              <GraduationCap className='w-8 h-8 text-purple-400 flex-shrink-0' />
              {sidebarOpen && (
                <span className='text-lg font-bold truncate'>
                  Curriculum Curator
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className='lg:hidden text-gray-400 hover:text-white'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className='flex-1 overflow-y-auto py-4'>
          {/* Home */}
          <button
            onClick={() => {
              navigate('/');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition ${
              isActive('/') || isActive('/dashboard')
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home className='w-5 h-5 flex-shrink-0' />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* Units Section */}
          {sidebarOpen && (
            <div className='mt-6 px-4'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  My Units
                </span>
                <button
                  onClick={() => navigate('/units/new')}
                  className='p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded'
                  title='Create New Unit'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}

          {/* Units Tree */}
          <div className='mt-2'>
            {loading ? (
              <div className='px-4 py-2 text-gray-500 text-sm'>
                {sidebarOpen ? 'Loading...' : '...'}
              </div>
            ) : units.length === 0 ? (
              <div className='px-4 py-2 text-gray-500 text-sm'>
                {sidebarOpen ? 'No units yet' : '-'}
              </div>
            ) : (
              units.map(unit => (
                <div key={unit.id}>
                  {/* Unit Header */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition ${
                      isUnitActive(unit.id)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {sidebarOpen && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleUnitExpand(unit.id);
                        }}
                        className='p-0.5 hover:bg-gray-700 rounded'
                      >
                        {expandedUnits.has(unit.id) ? (
                          <ChevronDown className='w-4 h-4' />
                        ) : (
                          <ChevronRight className='w-4 h-4' />
                        )}
                      </button>
                    )}
                    <BookOpen className='w-4 h-4 flex-shrink-0' />
                    <span
                      className={`flex-1 truncate ${sidebarOpen ? '' : 'hidden'}`}
                      onClick={() => {
                        navigate(`/units/${unit.id}`);
                        setMobileSidebarOpen(false);
                      }}
                      title={`${unit.code} - ${unit.title}`}
                    >
                      {unit.code}
                    </span>
                    {!sidebarOpen && (
                      <span
                        className='sr-only'
                        onClick={() => navigate(`/units/${unit.id}`)}
                      >
                        {unit.code}
                      </span>
                    )}
                  </div>

                  {/* Unit Children (Weeks) */}
                  {sidebarOpen && expandedUnits.has(unit.id) && (
                    <div className='ml-6 border-l border-gray-700'>
                      {/* Quick Links */}
                      <button
                        onClick={() => {
                          navigate(`/units/${unit.id}?tab=structure`);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 pl-4 pr-4 py-1.5 text-sm transition ${
                          location.pathname === `/units/${unit.id}` &&
                          location.search.includes('tab=structure')
                            ? 'text-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Calendar className='w-3.5 h-3.5' />
                        <span>Structure</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/units/${unit.id}?tab=outcomes`);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 pl-4 pr-4 py-1.5 text-sm transition ${
                          location.pathname === `/units/${unit.id}` &&
                          location.search.includes('tab=outcomes')
                            ? 'text-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Target className='w-3.5 h-3.5' />
                        <span>Outcomes</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/units/${unit.id}?tab=assessments`);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 pl-4 pr-4 py-1.5 text-sm transition ${
                          location.pathname === `/units/${unit.id}` &&
                          location.search.includes('tab=assessments')
                            ? 'text-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <FileText className='w-3.5 h-3.5' />
                        <span>Assessments</span>
                      </button>

                      {/* Weeks */}
                      <div className='mt-1 pt-1 border-t border-gray-800'>
                        {generateWeeks(unit.durationWeeks || 12).map(week => (
                          <button
                            key={week.weekNumber}
                            onClick={() => {
                              navigate(
                                `/units/${unit.id}?tab=structure&week=${week.weekNumber}`
                              );
                              setMobileSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 pl-6 pr-4 py-1 text-xs transition ${
                              location.search.includes(
                                `week=${week.weekNumber}`
                              )
                                ? 'text-purple-400'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <span>{week.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* AI Assistant */}
          <div className='mt-6 border-t border-gray-800 pt-4'>
            <button
              onClick={() => {
                navigate('/ai-assistant');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition ${
                isActive('/ai-assistant')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Brain className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span>AI Assistant</span>}
            </button>
            <button
              onClick={() => {
                navigate('/teaching-style');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition ${
                isActive('/teaching-style')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Sparkles className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span>Teaching Style</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className='border-t border-gray-800 p-4'>
          <button
            onClick={() => {
              navigate('/settings');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/settings')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Settings className='w-5 h-5 flex-shrink-0' />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button
            onClick={logout}
            className='w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition mt-1'
          >
            <LogOut className='w-5 h-5 flex-shrink-0' />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='hidden lg:flex items-center justify-center p-2 border-t border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition'
        >
          {sidebarOpen ? (
            <ChevronRight className='w-5 h-5 rotate-180' />
          ) : (
            <ChevronRight className='w-5 h-5' />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Bar */}
        <header className='bg-white shadow-sm border-b border-gray-200 z-10'>
          <div className='px-4 sm:px-6 lg:px-8 py-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className='lg:hidden text-gray-600 hover:text-gray-900'
                >
                  <Menu className='w-6 h-6' />
                </button>
              </div>

              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className='hidden sm:block text-sm font-medium text-gray-700'>
                    {user?.name || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
