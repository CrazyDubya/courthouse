import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiScale, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiDocumentText,
  HiBadgeCheck,
  HiUserGroup,
  HiHome,
  HiCurrencyDollar,
  HiHeart,
  HiCog,
  HiRefresh
} from 'react-icons/hi';

export interface CaseType {
  id: string;
  title: string;
  category: 'criminal' | 'civil';
  description: string;
  icon: React.ComponentType<any>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  participants: number;
  keyFeatures: string[];
}

interface CaseSelectorProps {
  onCaseGenerate: (caseType: string, category: 'criminal' | 'civil') => void;
  isGenerating: boolean;
}

const caseTypes: CaseType[] = [
  // Criminal Cases
  {
    id: 'robbery',
    title: 'Armed Robbery',
    category: 'criminal',
    description: 'Robbery with deadly weapon involving serious physical injury',
    icon: HiShieldCheck,
    difficulty: 'intermediate',
    estimatedDuration: '45-60 minutes',
    participants: 8,
    keyFeatures: ['Eyewitness testimony', 'Physical evidence', 'Miranda rights issues']
  },
  {
    id: 'murder',
    title: 'Domestic Violence Homicide',
    category: 'criminal',
    description: 'Self-defense claim in domestic violence murder case',
    icon: HiScale,
    difficulty: 'advanced',
    estimatedDuration: '60-90 minutes',
    participants: 10,
    keyFeatures: ['Battered woman syndrome', 'Expert testimony', 'Character evidence']
  },
  {
    id: 'drug-possession',
    title: 'Drug Possession',
    category: 'criminal',
    description: 'Felony drug possession with intent to distribute',
    icon: HiLightningBolt,
    difficulty: 'beginner',
    estimatedDuration: '30-45 minutes',
    participants: 6,
    keyFeatures: ['Fourth Amendment issues', 'Search and seizure', 'Chain of custody']
  },
  {
    id: 'assault',
    title: 'Aggravated Assault',
    category: 'criminal',
    description: 'Assault with deadly weapon in public place',
    icon: HiBadgeCheck,
    difficulty: 'intermediate',
    estimatedDuration: '45-60 minutes',
    participants: 8,
    keyFeatures: ['Self-defense claim', 'Video surveillance', 'Medical testimony']
  },
  {
    id: 'burglary',
    title: 'Residential Burglary',
    category: 'criminal',
    description: 'Breaking and entering occupied dwelling at night',
    icon: HiHome,
    difficulty: 'intermediate',
    estimatedDuration: '40-55 minutes',
    participants: 7,
    keyFeatures: ['Intent to commit crime', 'Circumstantial evidence', 'Alibi defense']
  },
  
  // Civil Cases
  {
    id: 'personal-injury',
    title: 'Personal Injury',
    category: 'civil',
    description: 'Motor vehicle accident with permanent disability',
    icon: HiHeart,
    difficulty: 'intermediate',
    estimatedDuration: '50-70 minutes',
    participants: 8,
    keyFeatures: ['Medical testimony', 'Economic damages', 'Comparative negligence']
  },
  {
    id: 'medical-malpractice',
    title: 'Medical Malpractice',
    category: 'civil',
    description: 'Surgical error resulting in patient complications',
    icon: HiCog,
    difficulty: 'advanced',
    estimatedDuration: '60-90 minutes',
    participants: 10,
    keyFeatures: ['Standard of care', 'Expert witnesses', 'Informed consent']
  },
  {
    id: 'contract-breach',
    title: 'Breach of Contract',
    category: 'civil',
    description: 'Commercial contract dispute over performance and damages',
    icon: HiDocumentText,
    difficulty: 'beginner',
    estimatedDuration: '35-50 minutes',
    participants: 6,
    keyFeatures: ['Contract interpretation', 'Economic damages', 'Mitigation']
  },
  {
    id: 'property-dispute',
    title: 'Property Dispute',
    category: 'civil',
    description: 'Boundary dispute between adjacent landowners',
    icon: HiHome,
    difficulty: 'intermediate',
    estimatedDuration: '40-55 minutes',
    participants: 7,
    keyFeatures: ['Survey evidence', 'Adverse possession', 'Equitable remedies']
  },
  {
    id: 'employment-discrimination',
    title: 'Employment Discrimination',
    category: 'civil',
    description: 'Title VII discrimination and wrongful termination claim',
    icon: HiUserGroup,
    difficulty: 'advanced',
    estimatedDuration: '55-75 minutes',
    participants: 9,
    keyFeatures: ['Disparate treatment', 'Hostile environment', 'Damages calculation']
  }
];

const difficultyColors = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500', 
  advanced: 'bg-red-500'
};

const categoryColors = {
  criminal: 'from-red-600 to-red-800',
  civil: 'from-blue-600 to-blue-800'
};

export const CaseSelector: React.FC<CaseSelectorProps> = ({ 
  onCaseGenerate, 
  isGenerating 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'criminal' | 'civil'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredCases = caseTypes.filter(caseType => {
    const categoryMatch = selectedCategory === 'all' || caseType.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || caseType.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const handleRandomCase = () => {
    const randomCase = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    onCaseGenerate(randomCase.id, randomCase.category);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Select Trial Case
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Choose from realistic NYC criminal and civil cases with actual NYS law
          </p>
          
          {/* Random Case Button */}
          <motion.button
            onClick={handleRandomCase}
            disabled={isGenerating}
            className="mb-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiRefresh className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating...' : 'Generate Random Case'}
          </motion.button>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-gray-300">Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="criminal">Criminal</option>
              <option value="civil">Civil</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-300">Difficulty:</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Case Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {filteredCases.map((caseType, index) => (
            <motion.div
              key={caseType.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-700 hover:border-gray-600 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${categoryColors[caseType.category]} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <caseType.icon className="text-2xl text-white" />
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${difficultyColors[caseType.difficulty]}`} />
                    <span className="text-sm text-gray-200 capitalize">{caseType.difficulty}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{caseType.title}</h3>
                <span className="inline-block px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs uppercase tracking-wide">
                  {caseType.category}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {caseType.description}
                </p>

                {/* Case Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="text-white">{caseType.estimatedDuration}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Participants:</span>
                    <p className="text-white">{caseType.participants} people</p>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-4">
                  <span className="text-gray-400 text-xs">Key Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {caseType.keyFeatures.map(feature => (
                      <span 
                        key={feature}
                        className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  onClick={() => onCaseGenerate(caseType.id, caseType.category)}
                  disabled={isGenerating}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? 'Generating...' : 'Generate This Case'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cases match your current filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};