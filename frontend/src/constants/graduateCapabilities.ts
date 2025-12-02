/**
 * Curtin University Graduate Capabilities
 * These are the six graduate attributes that all Curtin graduates should develop.
 */

export interface GraduateCapability {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Emoji for visual identification
  color: string; // Tailwind color class
  keywords: string[]; // Keywords for AI matching
}

export const GRADUATE_CAPABILITIES: GraduateCapability[] = [
  {
    id: 'gc1',
    code: 'GC1',
    name: 'Apply knowledge, skills and capabilities',
    shortName: 'Apply Knowledge',
    description:
      'Graduates acquire discipline knowledge, transferable skills, and professional capabilities that enable them to act as agents of social change and transform lives and communities for the better.',
    icon: '🎯',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    keywords: [
      'apply',
      'knowledge',
      'skills',
      'discipline',
      'professional',
      'capabilities',
      'transferable',
      'practice',
      'demonstrate',
      'implement',
      'execute',
      'perform',
      'utilise',
      'employ',
    ],
  },
  {
    id: 'gc2',
    code: 'GC2',
    name: 'Innovative, creative and/or entrepreneurial',
    shortName: 'Innovation & Creativity',
    description:
      'Graduates are able to apply their discipline knowledge with intellectual inquiry, act as critical thinkers, and serve as creative leaders in problem-solving while challenging traditional ideas.',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    keywords: [
      'innovative',
      'creative',
      'entrepreneurial',
      'critical thinking',
      'problem-solving',
      'inquiry',
      'challenge',
      'design',
      'develop',
      'create',
      'innovate',
      'novel',
      'original',
      'analyse',
      'evaluate',
      'synthesise',
    ],
  },
  {
    id: 'gc3',
    code: 'GC3',
    name: 'Effective communicators with digital competence',
    shortName: 'Communication & Digital',
    description:
      'Graduates can communicate effectively and confidently access, use, and adapt information and technology with technical skills to meet the needs of life, learning, and future work.',
    icon: '💬',
    color: 'bg-green-100 text-green-800 border-green-300',
    keywords: [
      'communicate',
      'communication',
      'digital',
      'technology',
      'information',
      'present',
      'write',
      'speak',
      'collaborate',
      'technical',
      'software',
      'data',
      'media',
      'report',
      'document',
    ],
  },
  {
    id: 'gc4',
    code: 'GC4',
    name: 'Globally engaged and responsive',
    shortName: 'Global Engagement',
    description:
      'Graduates are global citizens who can engage with global perspectives in ethical and sustainable ways and apply their knowledge and skills to a changing environment.',
    icon: '🌏',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    keywords: [
      'global',
      'international',
      'sustainable',
      'sustainability',
      'ethical',
      'environment',
      'diverse',
      'multicultural',
      'world',
      'society',
      'social',
      'responsibility',
      'citizen',
      'change',
    ],
  },
  {
    id: 'gc5',
    code: 'GC5',
    name: 'Culturally competent to engage respectfully with local First Peoples and other diverse cultures',
    shortName: 'Cultural Competence',
    description:
      'Graduates are ethical leaders with an applied understanding of local First Peoples\' "katajininy warniny" (translated from the Nyungar language as "ways of being, knowing and doing") and demonstrate cross-cultural capability.',
    icon: '🤝',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    keywords: [
      'cultural',
      'culture',
      'indigenous',
      'first peoples',
      'aboriginal',
      'diversity',
      'inclusive',
      'respect',
      'cross-cultural',
      'reconciliation',
      'traditional',
      'community',
      'heritage',
    ],
  },
  {
    id: 'gc6',
    code: 'GC6',
    name: 'Industry-connected and career-capable',
    shortName: 'Industry & Career',
    description:
      'Graduates are highly employable and capable of collaborating with industry and other stakeholders, contributing skilled work valued by industry, government, and community, and reflecting high ethical and moral standards.',
    icon: '💼',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    keywords: [
      'industry',
      'career',
      'employable',
      'professional',
      'workplace',
      'collaborate',
      'stakeholder',
      'ethical',
      'standards',
      'practice',
      'real-world',
      'practical',
      'work',
      'job',
    ],
  },
];

/**
 * Get a capability by its ID
 */
export const getCapabilityById = (id: string): GraduateCapability | undefined =>
  GRADUATE_CAPABILITIES.find(gc => gc.id === id);

/**
 * Get a capability by its code (e.g., 'GC1')
 */
export const getCapabilityByCode = (
  code: string
): GraduateCapability | undefined =>
  GRADUATE_CAPABILITIES.find(gc => gc.code === code);

/**
 * Simple keyword-based matching to suggest capabilities for a learning outcome
 * Returns capabilities sorted by match score (highest first)
 */
export const suggestCapabilities = (
  outcomeText: string,
  bloomLevel?: string
): { capability: GraduateCapability; score: number }[] => {
  const text = outcomeText.toLowerCase();
  const bloom = bloomLevel?.toLowerCase() || '';

  const scores = GRADUATE_CAPABILITIES.map(gc => {
    let score = 0;

    // Check keyword matches
    gc.keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Boost based on Bloom's taxonomy alignment
    if (bloom) {
      // GC1 (Apply) - aligns with apply, understand levels
      if (
        gc.id === 'gc1' &&
        ['apply', 'understand', 'remember'].includes(bloom)
      ) {
        score += 5;
      }
      // GC2 (Innovation) - aligns with create, evaluate, analyze levels
      if (
        gc.id === 'gc2' &&
        ['create', 'evaluate', 'analyze'].includes(bloom)
      ) {
        score += 8;
      }
      // GC3 (Communication) - aligns with all levels (communication is universal)
      if (gc.id === 'gc3') {
        score += 2;
      }
    }

    return { capability: gc, score };
  });

  // Return sorted by score, filtering out zero scores
  return scores.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
};

/**
 * Get the top N suggested capabilities for a learning outcome
 */
export const getTopCapabilitySuggestions = (
  outcomeText: string,
  bloomLevel?: string,
  topN: number = 2
): GraduateCapability[] => {
  const suggestions = suggestCapabilities(outcomeText, bloomLevel);
  return suggestions.slice(0, topN).map(s => s.capability);
};
