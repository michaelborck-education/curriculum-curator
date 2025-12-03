/**
 * United Nations Sustainable Development Goals (SDGs)
 * Also known as the Global Goals, adopted by all UN Member States in 2015.
 * Universal call to action to end poverty, protect the planet, and ensure
 * that by 2030 all people enjoy peace and prosperity.
 */

export interface SDGGoal {
  id: string;
  code: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Emoji for visual identification
  color: string; // Tailwind color class (background)
  textColor: string; // Tailwind text color class
  keywords: string[]; // Keywords for AI matching
}

export const SDG_GOALS: SDGGoal[] = [
  {
    id: 'sdg1',
    code: 'SDG1',
    number: 1,
    name: 'No Poverty',
    shortName: 'No Poverty',
    description:
      'End poverty in all its forms everywhere. Focuses on eradicating extreme poverty and implementing social protection systems to ensure equal rights to economic resources and basic services.',
    icon: '🏠',
    color: 'bg-red-100 border-red-300',
    textColor: 'text-red-800',
    keywords: [
      'poverty',
      'poor',
      'economic',
      'resources',
      'inequality',
      'social protection',
      'basic services',
      'welfare',
      'income',
      'disadvantaged',
      'vulnerable',
      'financial inclusion',
      'microfinance',
    ],
  },
  {
    id: 'sdg2',
    code: 'SDG2',
    number: 2,
    name: 'Zero Hunger',
    shortName: 'Zero Hunger',
    description:
      'End hunger, achieve food security and improved nutrition and promote sustainable agriculture. Involves doubling agricultural productivity, maintaining genetic diversity, and correcting trade restrictions.',
    icon: '🌾',
    color: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-800',
    keywords: [
      'hunger',
      'food',
      'nutrition',
      'agriculture',
      'farming',
      'crops',
      'food security',
      'malnutrition',
      'sustainable agriculture',
      'genetic diversity',
      'seeds',
      'harvest',
      'famine',
    ],
  },
  {
    id: 'sdg3',
    code: 'SDG3',
    number: 3,
    name: 'Good Health and Well-being',
    shortName: 'Health & Well-being',
    description:
      'Ensure healthy lives and promote well-being for all at all ages. Targets include reducing maternal mortality, ending epidemics, and strengthening prevention of substance abuse.',
    icon: '❤️',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-800',
    keywords: [
      'health',
      'wellbeing',
      'well-being',
      'medical',
      'healthcare',
      'disease',
      'mortality',
      'epidemic',
      'pandemic',
      'mental health',
      'substance abuse',
      'maternal',
      'child health',
      'vaccination',
      'medicine',
      'hospital',
    ],
  },
  {
    id: 'sdg4',
    code: 'SDG4',
    number: 4,
    name: 'Quality Education',
    shortName: 'Quality Education',
    description:
      'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all. Focuses on free education, eliminating gender disparities, and ensuring literacy.',
    icon: '📚',
    color: 'bg-red-100 border-red-300',
    textColor: 'text-red-700',
    keywords: [
      'education',
      'learning',
      'school',
      'teaching',
      'literacy',
      'numeracy',
      'students',
      'teachers',
      'curriculum',
      'training',
      'skills',
      'knowledge',
      'university',
      'college',
      'vocational',
      'lifelong learning',
    ],
  },
  {
    id: 'sdg5',
    code: 'SDG5',
    number: 5,
    name: 'Gender Equality',
    shortName: 'Gender Equality',
    description:
      'Achieve gender equality and empower all women and girls. Aims to end discrimination and violence against women, eliminate harmful practices, and ensure full participation in leadership.',
    icon: '⚧️',
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-800',
    keywords: [
      'gender',
      'equality',
      'women',
      'girls',
      'female',
      'discrimination',
      'empowerment',
      'leadership',
      'violence against women',
      'child marriage',
      'feminine',
      'feminist',
      'equal rights',
      'gender gap',
    ],
  },
  {
    id: 'sdg6',
    code: 'SDG6',
    number: 6,
    name: 'Clean Water and Sanitation',
    shortName: 'Clean Water',
    description:
      'Ensure availability and sustainable management of water and sanitation for all. Includes achieving universal access to safe drinking water, improving water quality, and protecting ecosystems.',
    icon: '💧',
    color: 'bg-cyan-100 border-cyan-300',
    textColor: 'text-cyan-800',
    keywords: [
      'water',
      'sanitation',
      'clean water',
      'drinking water',
      'hygiene',
      'pollution',
      'wastewater',
      'water quality',
      'aquatic',
      'freshwater',
      'groundwater',
      'watershed',
    ],
  },
  {
    id: 'sdg7',
    code: 'SDG7',
    number: 7,
    name: 'Affordable and Clean Energy',
    shortName: 'Clean Energy',
    description:
      'Ensure access to affordable, reliable, sustainable and modern energy for all. Involves increasing renewable energy share and doubling energy efficiency improvements.',
    icon: '⚡',
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-800',
    keywords: [
      'energy',
      'renewable',
      'solar',
      'wind',
      'electricity',
      'power',
      'sustainable energy',
      'clean energy',
      'energy efficiency',
      'fossil fuels',
      'carbon',
      'grid',
      'battery',
    ],
  },
  {
    id: 'sdg8',
    code: 'SDG8',
    number: 8,
    name: 'Decent Work and Economic Growth',
    shortName: 'Decent Work',
    description:
      'Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all. Includes eradicating forced labour and sustaining economic growth.',
    icon: '📈',
    color: 'bg-rose-100 border-rose-300',
    textColor: 'text-rose-800',
    keywords: [
      'employment',
      'work',
      'jobs',
      'economic growth',
      'labour',
      'labor',
      'productivity',
      'entrepreneurship',
      'business',
      'workplace',
      'wages',
      'forced labour',
      'child labour',
      'unemployment',
    ],
  },
  {
    id: 'sdg9',
    code: 'SDG9',
    number: 9,
    name: 'Industry, Innovation and Infrastructure',
    shortName: 'Innovation',
    description:
      'Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation. Focuses on upgrading infrastructure and enhancing scientific research.',
    icon: '🏭',
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-700',
    keywords: [
      'infrastructure',
      'industry',
      'innovation',
      'technology',
      'research',
      'development',
      'manufacturing',
      'industrialization',
      'scientific',
      'engineering',
      'construction',
      'internet',
      'digital',
    ],
  },
  {
    id: 'sdg10',
    code: 'SDG10',
    number: 10,
    name: 'Reduced Inequalities',
    shortName: 'Reduced Inequalities',
    description:
      'Reduce inequality within and among countries. Aims to achieve income growth for the bottom 40%, eliminate discriminatory laws, and ensure better representation in global decision-making.',
    icon: '⚖️',
    color: 'bg-pink-100 border-pink-300',
    textColor: 'text-pink-800',
    keywords: [
      'inequality',
      'inequalities',
      'discrimination',
      'inclusion',
      'inclusive',
      'marginalised',
      'marginalized',
      'equity',
      'fair',
      'justice',
      'representation',
      'diversity',
      'minority',
    ],
  },
  {
    id: 'sdg11',
    code: 'SDG11',
    number: 11,
    name: 'Sustainable Cities and Communities',
    shortName: 'Sustainable Cities',
    description:
      'Make cities and human settlements inclusive, safe, resilient and sustainable. Targets include safe housing, public transport, and reducing environmental impact of cities.',
    icon: '🏙️',
    color: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-700',
    keywords: [
      'cities',
      'urban',
      'housing',
      'transport',
      'public transport',
      'sustainable',
      'resilient',
      'air quality',
      'waste management',
      'slums',
      'planning',
      'green spaces',
      'community',
    ],
  },
  {
    id: 'sdg12',
    code: 'SDG12',
    number: 12,
    name: 'Responsible Consumption and Production',
    shortName: 'Responsible Consumption',
    description:
      'Ensure sustainable consumption and production patterns. Involves halving food waste, managing chemicals and wastes, and encouraging sustainable practices.',
    icon: '♻️',
    color: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-800',
    keywords: [
      'consumption',
      'production',
      'sustainable',
      'waste',
      'recycling',
      'food waste',
      'chemicals',
      'circular economy',
      'sustainable practices',
      'supply chain',
      'resources',
      'lifecycle',
    ],
  },
  {
    id: 'sdg13',
    code: 'SDG13',
    number: 13,
    name: 'Climate Action',
    shortName: 'Climate Action',
    description:
      'Take urgent action to combat climate change and its impacts. Focuses on strengthening resilience, integrating climate measures into policies, and mobilizing funding.',
    icon: '🌡️',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-700',
    keywords: [
      'climate',
      'climate change',
      'global warming',
      'carbon',
      'emissions',
      'greenhouse gas',
      'adaptation',
      'mitigation',
      'resilience',
      'paris agreement',
      'net zero',
      'carbon footprint',
    ],
  },
  {
    id: 'sdg14',
    code: 'SDG14',
    number: 14,
    name: 'Life Below Water',
    shortName: 'Life Below Water',
    description:
      'Conserve and sustainably use the oceans, seas and marine resources. Targets marine pollution reduction, ecosystem protection, and ending overfishing.',
    icon: '🐋',
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-800',
    keywords: [
      'ocean',
      'marine',
      'sea',
      'fish',
      'fishing',
      'coastal',
      'coral',
      'plastic',
      'marine pollution',
      'aquatic',
      'biodiversity',
      'overfishing',
      'underwater',
    ],
  },
  {
    id: 'sdg15',
    code: 'SDG15',
    number: 15,
    name: 'Life on Land',
    shortName: 'Life on Land',
    description:
      'Protect, restore and promote sustainable use of terrestrial ecosystems. Involves managing forests, combating desertification, halting land degradation, and protecting biodiversity.',
    icon: '🌳',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-800',
    keywords: [
      'forest',
      'land',
      'biodiversity',
      'ecosystem',
      'wildlife',
      'species',
      'deforestation',
      'desertification',
      'conservation',
      'habitat',
      'endangered',
      'nature',
      'terrestrial',
    ],
  },
  {
    id: 'sdg16',
    code: 'SDG16',
    number: 16,
    name: 'Peace, Justice and Strong Institutions',
    shortName: 'Peace & Justice',
    description:
      'Promote peaceful and inclusive societies, provide access to justice for all and build effective, accountable institutions. Targets violence reduction, ending abuse, and promoting rule of law.',
    icon: '🕊️',
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-700',
    keywords: [
      'peace',
      'justice',
      'institutions',
      'governance',
      'law',
      'rule of law',
      'violence',
      'corruption',
      'accountability',
      'human rights',
      'democracy',
      'conflict',
      'security',
      'trafficking',
    ],
  },
  {
    id: 'sdg17',
    code: 'SDG17',
    number: 17,
    name: 'Partnerships for the Goals',
    shortName: 'Partnerships',
    description:
      'Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development. Emphasizes global collaboration, finance, technology transfer, and capacity building.',
    icon: '🤝',
    color: 'bg-indigo-100 border-indigo-300',
    textColor: 'text-indigo-800',
    keywords: [
      'partnership',
      'collaboration',
      'cooperation',
      'global',
      'international',
      'development',
      'capacity building',
      'technology transfer',
      'finance',
      'trade',
      'stakeholder',
      'multi-stakeholder',
    ],
  },
];

/**
 * Get an SDG by its ID
 */
export const getSDGById = (id: string): SDGGoal | undefined =>
  SDG_GOALS.find(sdg => sdg.id === id);

/**
 * Get an SDG by its code (e.g., 'SDG1')
 */
export const getSDGByCode = (code: string): SDGGoal | undefined =>
  SDG_GOALS.find(sdg => sdg.code === code);

/**
 * Get an SDG by its number (1-17)
 */
export const getSDGByNumber = (num: number): SDGGoal | undefined =>
  SDG_GOALS.find(sdg => sdg.number === num);

/**
 * Simple keyword-based matching to suggest SDGs based on unit content
 * Returns SDGs sorted by match score (highest first)
 */
export const suggestSDGs = (
  uloDescriptions: string[],
  unitDescription?: string,
  topicKeywords: string[] = []
): { sdg: SDGGoal; score: number }[] => {
  const combinedText = [
    ...uloDescriptions,
    unitDescription || '',
    ...topicKeywords,
  ]
    .join(' ')
    .toLowerCase();

  const scores = SDG_GOALS.map(sdg => {
    let score = 0;

    // Check keyword matches
    sdg.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      // Count occurrences for stronger matches
      const regex = new RegExp(keywordLower, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        score += matches.length * 10;
      }
    });

    return { sdg, score };
  });

  // Return sorted by score, filtering out zero scores
  return scores.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
};

/**
 * Get the top N suggested SDGs for unit content
 */
export const getTopSDGSuggestions = (
  uloDescriptions: string[],
  unitDescription?: string,
  topicKeywords: string[] = [],
  topN: number = 3
): SDGGoal[] => {
  const suggestions = suggestSDGs(
    uloDescriptions,
    unitDescription,
    topicKeywords
  );
  return suggestions.slice(0, topN).map(s => s.sdg);
};

/**
 * Get the count of mapped SDGs
 */
export const getMappedSDGCount = (mappedIds: string[]): number =>
  mappedIds.filter(id => SDG_GOALS.some(sdg => sdg.id === id)).length;
