import { JudgePersonalityTemplate, JudgeMBTI, JudicialTemperament, JudgeSpecialization } from '../types/judge';

export const JUDGE_PERSONALITY_TEMPLATES: JudgePersonalityTemplate[] = [
  {
    name: "The Iron Gavel",
    description: "Strict, traditional judge who runs the courtroom with military precision",
    mbtiType: 'ESTJ',
    temperament: 'strict',
    specialization: 'criminal-law',
    attributeRanges: {
      wisdom: [7, 9],
      authority: [8, 10],
      empathy: [3, 5],
      analyticalSkill: [6, 8],
      patience: [4, 6],
      strictness: [9, 10],
      fairness: [7, 9],
      efficiency: [8, 10],
      charisma: [5, 7],
      integrity: [8, 10]
    },
    commonQuirks: {
      strictOnTime: true,
      allowsFood: false,
      informalAddress: false,
      harshOnFirstOffenders: true,
      strictOnAttorneys: true,
      allowsObjections: false,
      givesLongExplanations: false,
      quotesLaw: true,
      proProsecution: 2
    },
    decisionFactorWeights: {
      legalPrecedent: 8,
      statutoryText: 9,
      personalExperience: 6,
      communityStandards: 5,
      politicalConsiderations: 3,
      emotionalFactors: 2,
      efficiency: 8,
      appealRisk: 7
    },
    typicalSayings: [
      "Order in the court!",
      "Counselor, you know the rules.",
      "The law is clear on this matter.",
      "I will not tolerate such behavior in my courtroom.",
      "Objection sustained. Move on."
    ]
  },
  
  {
    name: "The Wise Sage",
    description: "Thoughtful, experienced judge who carefully weighs all factors",
    mbtiType: 'INFJ',
    temperament: 'balanced',
    specialization: 'constitutional-law',
    attributeRanges: {
      wisdom: [9, 10],
      authority: [7, 9],
      empathy: [7, 9],
      analyticalSkill: [8, 10],
      patience: [8, 10],
      strictness: [5, 7],
      fairness: [9, 10],
      efficiency: [5, 7],
      charisma: [6, 8],
      integrity: [9, 10]
    },
    commonQuirks: {
      strictOnTime: false,
      allowsFood: true,
      longRecesses: true,
      asksManyQuestions: true,
      givesLongExplanations: true,
      usesHumor: false,
      quotesLaw: true,
      proProsecution: 0,
      proPlaintiff: 0
    },
    decisionFactorWeights: {
      legalPrecedent: 7,
      statutoryText: 7,
      personalExperience: 8,
      communityStandards: 6,
      politicalConsiderations: 4,
      emotionalFactors: 6,
      efficiency: 4,
      appealRisk: 8
    },
    typicalSayings: [
      "Let me consider this carefully.",
      "The constitutional implications are significant.",
      "I need to hear both sides of this argument.",
      "Justice requires wisdom, not haste.",
      "The precedent is instructive but not controlling."
    ]
  },
  
  {
    name: "The People's Judge",
    description: "Compassionate, down-to-earth judge focused on human impact",
    mbtiType: 'ENFJ',
    temperament: 'lenient',
    specialization: 'family-law',
    attributeRanges: {
      wisdom: [6, 8],
      authority: [5, 7],
      empathy: [8, 10],
      analyticalSkill: [6, 8],
      patience: [7, 9],
      strictness: [3, 5],
      fairness: [8, 10],
      efficiency: [6, 8],
      charisma: [8, 10],
      integrity: [7, 9]
    },
    commonQuirks: {
      allowsFood: true,
      informalAddress: true,
      softOnSeniors: true,
      allowsObjections: true,
      asksManyQuestions: true,
      usesHumor: true,
      quotesLaw: false,
      proIndividuals: 3
    },
    decisionFactorWeights: {
      legalPrecedent: 5,
      statutoryText: 6,
      personalExperience: 7,
      communityStandards: 8,
      politicalConsiderations: 3,
      emotionalFactors: 8,
      efficiency: 5,
      appealRisk: 4
    },
    typicalSayings: [
      "Let's think about what's best for everyone involved.",
      "I understand this is difficult for all parties.",
      "The human element cannot be ignored.",
      "We need to find a solution that works.",
      "Sometimes the right thing isn't in the law books."
    ]
  },
  
  {
    name: "The Efficiency Expert",
    description: "Fast-paced, results-oriented judge who values time and clarity",
    mbtiType: 'ENTJ',
    temperament: 'pragmatic',
    specialization: 'civil-litigation',
    attributeRanges: {
      wisdom: [7, 9],
      authority: [8, 10],
      empathy: [4, 6],
      analyticalSkill: [8, 10],
      patience: [3, 5],
      strictness: [6, 8],
      fairness: [7, 9],
      efficiency: [9, 10],
      charisma: [7, 9],
      integrity: [7, 9]
    },
    commonQuirks: {
      strictOnTime: true,
      allowsFood: false,
      longRecesses: false,
      strictOnAttorneys: true,
      givesLongExplanations: false,
      usesHumor: false,
      quotesLaw: false,
      proBusinesses: 2
    },
    decisionFactorWeights: {
      legalPrecedent: 6,
      statutoryText: 7,
      personalExperience: 6,
      communityStandards: 4,
      politicalConsiderations: 5,
      emotionalFactors: 3,
      efficiency: 9,
      appealRisk: 6
    },
    typicalSayings: [
      "Time is money, counselor.",
      "Get to the point.",
      "This case needs to move forward.",
      "I've heard enough on this issue.",
      "Let's be practical about this."
    ]
  },
  
  {
    name: "The Scholar",
    description: "Intellectual, detail-oriented judge who loves legal complexity",
    mbtiType: 'INTP',
    temperament: 'scholarly',
    specialization: 'intellectual-property',
    attributeRanges: {
      wisdom: [8, 10],
      authority: [5, 7],
      empathy: [4, 6],
      analyticalSkill: [9, 10],
      patience: [7, 9],
      strictness: [6, 8],
      fairness: [8, 10],
      efficiency: [4, 6],
      charisma: [4, 6],
      integrity: [8, 10]
    },
    commonQuirks: {
      longRecesses: true,
      asksManyQuestions: true,
      givesLongExplanations: true,
      quotesLaw: true,
      proProsecution: 0,
      proPlaintiff: 0
    },
    decisionFactorWeights: {
      legalPrecedent: 9,
      statutoryText: 8,
      personalExperience: 5,
      communityStandards: 4,
      politicalConsiderations: 2,
      emotionalFactors: 3,
      efficiency: 3,
      appealRisk: 9
    },
    typicalSayings: [
      "The jurisprudential implications are fascinating.",
      "Let me examine the precedent more closely.",
      "The statutory interpretation requires careful analysis.",
      "This presents an interesting legal question.",
      "I need to research this further."
    ]
  },
  
  {
    name: "The Maverick",
    description: "Independent, reform-minded judge who challenges conventional wisdom",
    mbtiType: 'ENTP',
    temperament: 'progressive',
    specialization: 'environmental-law',
    attributeRanges: {
      wisdom: [6, 8],
      authority: [6, 8],
      empathy: [6, 8],
      analyticalSkill: [7, 9],
      patience: [5, 7],
      strictness: [4, 6],
      fairness: [7, 9],
      efficiency: [7, 9],
      charisma: [8, 10],
      integrity: [7, 9]
    },
    commonQuirks: {
      informalAddress: true,
      allowsObjections: true,
      asksManyQuestions: true,
      usesHumor: true,
      quotesLaw: false,
      proIndividuals: 2
    },
    decisionFactorWeights: {
      legalPrecedent: 5,
      statutoryText: 6,
      personalExperience: 6,
      communityStandards: 7,
      politicalConsiderations: 6,
      emotionalFactors: 7,
      efficiency: 6,
      appealRisk: 5
    },
    typicalSayings: [
      "Let's think outside the box on this one.",
      "The law must evolve with society.",
      "I'm not bound by outdated precedent.",
      "What would justice really look like here?",
      "Sometimes we need to challenge the system."
    ]
  },
  
  {
    name: "The Old School",
    description: "Traditional, methodical judge with decades of experience",
    mbtiType: 'ISTJ',
    temperament: 'folksy',
    specialization: 'general-practice',
    attributeRanges: {
      wisdom: [8, 10],
      authority: [7, 9],
      empathy: [6, 8],
      analyticalSkill: [6, 8],
      patience: [8, 10],
      strictness: [7, 9],
      fairness: [8, 10],
      efficiency: [5, 7],
      charisma: [6, 8],
      integrity: [9, 10]
    },
    commonQuirks: {
      allowsFood: true,
      informalAddress: true,
      softOnSeniors: true,
      asksManyQuestions: false,
      usesHumor: true,
      quotesLaw: true,
      proProsecution: 1
    },
    decisionFactorWeights: {
      legalPrecedent: 8,
      statutoryText: 7,
      personalExperience: 9,
      communityStandards: 8,
      politicalConsiderations: 4,
      emotionalFactors: 6,
      efficiency: 5,
      appealRisk: 6
    },
    typicalSayings: [
      "In my thirty years on the bench...",
      "We've seen this before, haven't we?",
      "Let's keep this simple and fair.",
      "I remember when this law was first passed.",
      "Common sense should prevail here."
    ]
  },
  
  {
    name: "The Reformer",
    description: "Passionate about justice and systemic change",
    mbtiType: 'INFJ',
    temperament: 'progressive',
    specialization: 'constitutional-law',
    attributeRanges: {
      wisdom: [7, 9],
      authority: [6, 8],
      empathy: [8, 10],
      analyticalSkill: [8, 10],
      patience: [6, 8],
      strictness: [4, 6],
      fairness: [9, 10],
      efficiency: [6, 8],
      charisma: [7, 9],
      integrity: [9, 10]
    },
    commonQuirks: {
      allowsFood: true,
      allowsObjections: true,
      asksManyQuestions: true,
      givesLongExplanations: true,
      usesHumor: false,
      quotesLaw: true,
      proIndividuals: 4,
      proProsecution: -2
    },
    decisionFactorWeights: {
      legalPrecedent: 6,
      statutoryText: 6,
      personalExperience: 7,
      communityStandards: 7,
      politicalConsiderations: 7,
      emotionalFactors: 8,
      efficiency: 5,
      appealRisk: 6
    },
    typicalSayings: [
      "Justice delayed is justice denied.",
      "We must protect the rights of all citizens.",
      "The Constitution is a living document.",
      "This court will not perpetuate injustice.",
      "Equal protection means equal protection."
    ]
  }
];

// Utility function to get a random personality template
export function getRandomJudgePersonality(): JudgePersonalityTemplate {
  return JUDGE_PERSONALITY_TEMPLATES[Math.floor(Math.random() * JUDGE_PERSONALITY_TEMPLATES.length)];
}

// Utility function to get personality by name
export function getJudgePersonalityByName(name: string): JudgePersonalityTemplate | undefined {
  return JUDGE_PERSONALITY_TEMPLATES.find(template => template.name === name);
}

// Utility function to get personalities by temperament
export function getJudgePersonalitiesByTemperament(temperament: JudicialTemperament): JudgePersonalityTemplate[] {
  return JUDGE_PERSONALITY_TEMPLATES.filter(template => template.temperament === temperament);
}

// Utility function to get personalities by specialization
export function getJudgePersonalitiesBySpecialization(specialization: JudgeSpecialization): JudgePersonalityTemplate[] {
  return JUDGE_PERSONALITY_TEMPLATES.filter(template => template.specialization === specialization);
}

// Generate random attributes within template ranges
export function generateAttributesFromTemplate(template: JudgePersonalityTemplate) {
  const attributes: any = {};
  
  for (const [key, range] of Object.entries(template.attributeRanges)) {
    const [min, max] = range;
    attributes[key] = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  return attributes;
}