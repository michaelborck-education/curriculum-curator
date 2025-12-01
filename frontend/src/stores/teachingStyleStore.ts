import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PedagogyType } from '../types/index';

interface TeachingStyleState {
  globalStyle: PedagogyType;
  setGlobalStyle: (style: PedagogyType) => void;
}

export const useTeachingStyleStore = create<TeachingStyleState>()(
  persist(
    set => ({
      globalStyle: 'inquiry-based',
      setGlobalStyle: (style: PedagogyType) => set({ globalStyle: style }),
    }),
    {
      name: 'teaching-style-storage',
    }
  )
);

// Pedagogy options for use across the app
export const pedagogyOptions: Array<{
  id: PedagogyType;
  name: string;
  shortName: string;
  description: string;
}> = [
  {
    id: 'inquiry-based',
    name: 'Inquiry-Based',
    shortName: 'Inquiry',
    description: 'Students learn through questioning and exploration',
  },
  {
    id: 'project-based',
    name: 'Project-Based',
    shortName: 'Project',
    description: 'Learning through real-world projects and applications',
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    shortName: 'Collab',
    description: 'Group work and peer-to-peer learning',
  },
  {
    id: 'game-based',
    name: 'Game-Based',
    shortName: 'Game',
    description: 'Learning through games and interactive challenges',
  },
  {
    id: 'traditional',
    name: 'Traditional',
    shortName: 'Traditional',
    description: 'Structured lecture-based teaching approach',
  },
  {
    id: 'constructivist',
    name: 'Constructivist',
    shortName: 'Construct',
    description: 'Students build knowledge through experience',
  },
  {
    id: 'problem-based',
    name: 'Problem-Based',
    shortName: 'Problem',
    description: 'Learning through solving real problems',
  },
  {
    id: 'experiential',
    name: 'Experiential',
    shortName: 'Experience',
    description: 'Learning through direct experience and reflection',
  },
  {
    id: 'competency-based',
    name: 'Competency-Based',
    shortName: 'Competency',
    description: 'Focus on mastering specific skills and competencies',
  },
];

export const getPedagogyHint = (style: PedagogyType): string => {
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
