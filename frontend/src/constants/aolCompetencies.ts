/**
 * AACSB Assurance of Learning (AoL) Competency Areas
 * These are program-level goals that units contribute to achieving.
 * Based on AACSB accreditation standards.
 */

export type AoLLevel = 'I' | 'R' | 'M' | null;

export interface AoLCompetency {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
}

export interface AoLMapping {
  competencyId: string;
  level: AoLLevel;
}

export const AOL_LEVELS = {
  I: {
    label: 'Introduce',
    description: 'First exposure, basic understanding',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  R: {
    label: 'Reinforce',
    description: 'Practice and deepen skills',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  M: {
    label: 'Master',
    description: 'Demonstrate proficiency at graduation level',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
} as const;

export const AOL_COMPETENCIES: AoLCompetency[] = [
  {
    id: 'aol1',
    code: 'AOL1',
    name: 'Knowledge of Business and Discipline Content',
    shortName: 'Knowledge & Discipline',
    description:
      'Understanding core concepts, theories, and frameworks relevant to the field.',
    icon: '📚',
    color: 'bg-blue-50 border-blue-200',
    keywords: [
      'knowledge',
      'theory',
      'concepts',
      'principles',
      'fundamentals',
      'framework',
      'discipline',
      'understand',
      'comprehend',
      'explain',
      'describe',
      'define',
      'identify',
      'foundations',
      'core',
    ],
  },
  {
    id: 'aol2',
    code: 'AOL2',
    name: 'Critical Thinking and Problem-Solving',
    shortName: 'Critical Thinking',
    description:
      'Ability to analyse, evaluate, and synthesise information to make decisions.',
    icon: '🧠',
    color: 'bg-purple-50 border-purple-200',
    keywords: [
      'critical',
      'thinking',
      'problem',
      'solving',
      'analyse',
      'analyze',
      'evaluate',
      'synthesise',
      'synthesize',
      'decision',
      'judgement',
      'judgment',
      'reasoning',
      'assess',
      'critique',
      'compare',
      'contrast',
    ],
  },
  {
    id: 'aol3',
    code: 'AOL3',
    name: 'Communication Skills',
    shortName: 'Communication',
    description:
      'Effective written and oral communication in professional contexts.',
    icon: '💬',
    color: 'bg-green-50 border-green-200',
    keywords: [
      'communication',
      'communicate',
      'write',
      'writing',
      'written',
      'oral',
      'speak',
      'speaking',
      'present',
      'presentation',
      'report',
      'document',
      'articulate',
      'express',
      'professional',
      'audience',
    ],
  },
  {
    id: 'aol4',
    code: 'AOL4',
    name: 'Ethical and Social Responsibility',
    shortName: 'Ethics & Responsibility',
    description:
      'Awareness of ethical issues and ability to apply responsible decision-making.',
    icon: '⚖️',
    color: 'bg-amber-50 border-amber-200',
    keywords: [
      'ethical',
      'ethics',
      'responsible',
      'responsibility',
      'moral',
      'integrity',
      'values',
      'social',
      'sustainability',
      'sustainable',
      'governance',
      'compliance',
      'accountable',
      'accountability',
      'stakeholder',
    ],
  },
  {
    id: 'aol5',
    code: 'AOL5',
    name: 'Teamwork and Interpersonal Skills',
    shortName: 'Teamwork',
    description:
      'Working effectively in diverse teams and collaborative environments.',
    icon: '👥',
    color: 'bg-pink-50 border-pink-200',
    keywords: [
      'team',
      'teamwork',
      'collaborate',
      'collaboration',
      'collaborative',
      'group',
      'interpersonal',
      'leadership',
      'lead',
      'cooperate',
      'cooperation',
      'diverse',
      'diversity',
      'conflict',
      'negotiate',
      'facilitate',
    ],
  },
  {
    id: 'aol6',
    code: 'AOL6',
    name: 'Global and Cultural Awareness',
    shortName: 'Global Awareness',
    description:
      'Understanding international perspectives and cultural diversity.',
    icon: '🌍',
    color: 'bg-teal-50 border-teal-200',
    keywords: [
      'global',
      'international',
      'cultural',
      'culture',
      'multicultural',
      'diversity',
      'diverse',
      'world',
      'cross-cultural',
      'globalisation',
      'globalization',
      'multinational',
      'intercultural',
      'perspectives',
      'inclusive',
    ],
  },
  {
    id: 'aol7',
    code: 'AOL7',
    name: 'Quantitative and Technological Skills',
    shortName: 'Quantitative & Tech',
    description:
      'Ability to use data, analytics, and technology for decision-making.',
    icon: '📊',
    color: 'bg-indigo-50 border-indigo-200',
    keywords: [
      'quantitative',
      'data',
      'analytics',
      'analysis',
      'technology',
      'digital',
      'software',
      'statistical',
      'statistics',
      'numerical',
      'computational',
      'modelling',
      'modeling',
      'technical',
      'tools',
      'systems',
    ],
  },
];

/**
 * Get a competency by its ID
 */
export const getCompetencyById = (id: string): AoLCompetency | undefined =>
  AOL_COMPETENCIES.find(c => c.id === id);

/**
 * Get a competency by its code (e.g., 'AOL1')
 */
export const getCompetencyByCode = (code: string): AoLCompetency | undefined =>
  AOL_COMPETENCIES.find(c => c.code === code);

/**
 * Suggest AoL mappings based on ULO descriptions and assessment types
 * Returns competencies with suggested levels based on keyword matching and Bloom's taxonomy
 */
export const suggestAoLMappings = (
  uloDescriptions: string[],
  bloomLevels: string[] = [],
  assessmentTypes: string[] = []
): AoLMapping[] => {
  const combinedText = [...uloDescriptions, ...assessmentTypes]
    .join(' ')
    .toLowerCase();

  const suggestions: AoLMapping[] = [];

  AOL_COMPETENCIES.forEach(competency => {
    let score = 0;

    // Check keyword matches
    competency.keywords.forEach(keyword => {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Only suggest if there's a reasonable match
    if (score >= 20) {
      // Determine level based on Bloom's taxonomy distribution
      let level: AoLLevel = 'I';

      const bloomLower = bloomLevels.map(b => b.toLowerCase());
      const hasHigherOrder = bloomLower.some(b =>
        ['create', 'evaluate', 'analyze', 'analyse'].includes(b)
      );
      const hasMiddleOrder = bloomLower.some(b =>
        ['apply', 'understand'].includes(b)
      );

      if (hasHigherOrder) {
        level = 'M';
      } else if (hasMiddleOrder) {
        level = 'R';
      }

      // Boost level for certain assessment types
      const assessLower = assessmentTypes.map(a => a.toLowerCase());
      if (
        assessLower.some(a =>
          ['project', 'capstone', 'portfolio', 'thesis'].includes(a)
        )
      ) {
        level = 'M';
      } else if (
        assessLower.some(a =>
          ['assignment', 'presentation', 'report'].includes(a)
        )
      ) {
        if (level === 'I') level = 'R';
      }

      suggestions.push({
        competencyId: competency.id,
        level,
      });
    }
  });

  return suggestions;
};

/**
 * Get the count of mapped competencies
 */
export const getMappedCount = (mappings: AoLMapping[]): number =>
  mappings.filter(m => m.level !== null).length;
