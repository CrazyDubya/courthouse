import { 
  EnhancedJudgeProfile, 
  JudgePersonalityTemplate, 
  JudgeAttributes,
  JudgeQuirks,
  JudicialState,
  JudgeMemory
} from '../types/judge';
import { Participant, ParticipantRole } from '../types';
import { 
  JUDGE_PERSONALITY_TEMPLATES, 
  getRandomJudgePersonality,
  getJudgePersonalityByName,
  generateAttributesFromTemplate
} from '../data/judgePersonalities';
import { MemoryManager } from './MemoryManager';

export class EnhancedJudgeFactory {
  
  /**
   * Create a judge with specified personality template
   */
  public static createJudge(
    name: string,
    personalityTemplate?: string | JudgePersonalityTemplate,
    memoryEnabled: boolean = true,
    experienceYears?: number
  ): EnhancedJudgeProfile {
    
    // Get personality template
    let template: JudgePersonalityTemplate;
    if (typeof personalityTemplate === 'string') {
      template = getJudgePersonalityByName(personalityTemplate) || getRandomJudgePersonality();
    } else if (personalityTemplate) {
      template = personalityTemplate;
    } else {
      template = getRandomJudgePersonality();
    }
    
    // Generate attributes within template ranges
    const attributes = generateAttributesFromTemplate(template) as JudgeAttributes;
    
    // Generate quirks based on template
    const quirks = this.generateQuirks(template);
    
    // Calculate career dates
    const yearsOnBench = experienceYears || Math.floor(Math.random() * 25) + 5;
    const appointedDate = new Date();
    appointedDate.setFullYear(appointedDate.getFullYear() - yearsOnBench);
    
    // Create judge profile
    const judgeProfile: EnhancedJudgeProfile = {
      id: `judge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      
      // Personality system
      mbtiType: template.mbtiType,
      temperament: template.temperament,
      specialization: template.specialization,
      attributes,
      quirks,
      
      // Memory system
      memory: this.initializeMemory(memoryEnabled, yearsOnBench),
      currentState: this.initializeCurrentState(),
      
      // Career information
      appointedDate,
      appointingAuthority: this.generateAppointingAuthority(),
      previousCareer: this.generatePreviousCareer(template),
      lawSchool: this.generateLawSchool(),
      graduationYear: appointedDate.getFullYear() - yearsOnBench - Math.floor(Math.random() * 10) - 3,
      barAdmissions: this.generateBarAdmissions(),
      
      // Reputation and ratings
      reputationScore: this.calculateReputationScore(attributes, yearsOnBench),
      attorneyRating: this.calculateAttorneyRating(attributes, quirks),
      reversalRating: this.calculateReversalRating(attributes),
      politicalLeanings: this.calculatePoliticalLeanings(template),
      
      // Settings
      retirementDate: this.calculateRetirementDate(appointedDate, yearsOnBench),
      temporaryAssignment: Math.random() < 0.1, // 10% chance
      jurisdictionLevel: this.determineJurisdictionLevel(yearsOnBench, attributes)
    };
    
    return judgeProfile;
  }
  
  /**
   * Create a judge from a basic Participant
   */
  public static enhanceExistingJudge(
    participant: Participant,
    memoryEnabled: boolean = true
  ): EnhancedJudgeProfile {
    
    // Try to infer personality from existing traits
    const template = this.inferPersonalityFromTraits(participant);
    
    return this.createJudge(participant.name, template, memoryEnabled);
  }
  
  /**
   * Create multiple judges with diverse personalities
   */
  public static createJudgePanel(
    count: number,
    memoryEnabled: boolean = true,
    ensureDiversity: boolean = true
  ): EnhancedJudgeProfile[] {
    
    const judges: EnhancedJudgeProfile[] = [];
    const usedTemplates = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let template: JudgePersonalityTemplate;
      
      if (ensureDiversity && usedTemplates.size < JUDGE_PERSONALITY_TEMPLATES.length) {
        // Ensure we use different templates
        do {
          template = getRandomJudgePersonality();
        } while (usedTemplates.has(template.name));
        usedTemplates.add(template.name);
      } else {
        template = getRandomJudgePersonality();
      }
      
      const judgeName = this.generateJudgeName(i);
      judges.push(this.createJudge(judgeName, template, memoryEnabled));
    }
    
    return judges;
  }
  
  private static generateQuirks(template: JudgePersonalityTemplate): JudgeQuirks {
    const baseQuirks = { ...template.commonQuirks };
    
    // Add some random variation
    const allQuirks: (keyof JudgeQuirks)[] = [
      'strictOnTime', 'allowsFood', 'informalAddress', 'longRecesses',
      'harshOnFirstOffenders', 'softOnSeniors', 'strictOnAttorneys', 'allowsObjections',
      'asksManyQuestions', 'givesLongExplanations', 'usesHumor', 'quotesLaw'
    ];
    
    allQuirks.forEach(quirk => {
      if (baseQuirks[quirk] === undefined) {
        baseQuirks[quirk] = Math.random() < 0.3; // 30% chance for undefined quirks
      }
    });
    
    // Generate bias values if not set
    if (baseQuirks.proProsecution === undefined) {
      baseQuirks.proProsecution = Math.floor(Math.random() * 11) - 5; // -5 to +5
    }
    if (baseQuirks.proPlaintiff === undefined) {
      baseQuirks.proPlaintiff = Math.floor(Math.random() * 11) - 5;
    }
    if (baseQuirks.proBusinesses === undefined) {
      baseQuirks.proBusinesses = Math.floor(Math.random() * 11) - 5;
    }
    if (baseQuirks.proIndividuals === undefined) {
      baseQuirks.proIndividuals = Math.floor(Math.random() * 11) - 5;
    }
    
    return baseQuirks as JudgeQuirks;
  }
  
  private static initializeMemory(enabled: boolean, yearsOnBench: number): JudgeMemory {
    const memory: JudgeMemory = {
      cases: [],
      experience: {
        totalCasesPresided: 0,
        casesByType: {
          'criminal': 0,
          'civil': 0,
          'family': 0,
          'corporate': 0,
          'constitutional': 0
        },
        convictionRate: 0,
        plaintiffWinRate: 0,
        appealRate: 0,
        reversalRate: 0,
        averageSentenceLength: 0,
        averageDamageAward: 0,
        motionsGranted: 0,
        motionsDenied: 0,
        objectionsIssued: 0,
        contemptCitations: 0,
        yearsOnBench,
        careerStartDate: new Date(),
        retirementEligible: yearsOnBench >= 20
      },
      participants: [],
      decisions: [],
      enabled,
      retentionPeriod: 1825
    };
    
    // Simulate some experience for veteran judges
    if (enabled && yearsOnBench > 5) {
      this.simulateExperience(memory, yearsOnBench);
    }
    
    return memory;
  }
  
  private static simulateExperience(memory: JudgeMemory, yearsOnBench: number): void {
    // Estimate cases per year (varies by jurisdiction)
    const casesPerYear = Math.floor(Math.random() * 200) + 50; // 50-250 cases per year
    const totalCases = Math.floor(casesPerYear * yearsOnBench * 0.8); // 80% simulation
    
    memory.experience.totalCasesPresided = totalCases;
    
    // Distribute cases by type
    memory.experience.casesByType.criminal = Math.floor(totalCases * 0.4);
    memory.experience.casesByType.civil = Math.floor(totalCases * 0.3);
    memory.experience.casesByType.family = Math.floor(totalCases * 0.15);
    memory.experience.casesByType.corporate = Math.floor(totalCases * 0.1);
    memory.experience.casesByType.constitutional = Math.floor(totalCases * 0.05);
    
    // Generate realistic statistics
    memory.experience.convictionRate = 0.6 + Math.random() * 0.3; // 60-90%
    memory.experience.plaintiffWinRate = 0.4 + Math.random() * 0.3; // 40-70%
    memory.experience.appealRate = 0.05 + Math.random() * 0.1; // 5-15%
    memory.experience.reversalRate = 0.1 + Math.random() * 0.2; // 10-30%
    memory.experience.averageSentenceLength = 12 + Math.random() * 24; // 1-3 years
    memory.experience.averageDamageAward = 50000 + Math.random() * 200000; // $50K-$250K
    
    // Motion and objection statistics
    memory.experience.motionsGranted = Math.floor(totalCases * 0.4 * 0.6); // 60% grant rate
    memory.experience.motionsDenied = Math.floor(totalCases * 0.4 * 0.4); // 40% denial rate
    memory.experience.objectionsIssued = Math.floor(totalCases * 3); // ~3 objections per case
    memory.experience.contemptCitations = Math.floor(yearsOnBench * 2); // ~2 per year
  }
  
  private static initializeCurrentState(): JudicialState {
    return {
      currentMood: Math.floor(Math.random() * 21) - 10, // -10 to +10
      energyLevel: Math.floor(Math.random() * 6) + 5, // 5-10
      stressLevel: Math.floor(Math.random() * 5) + 1, // 1-5
      patientRemaining: Math.floor(Math.random() * 6) + 5, // 5-10
      rulingStreak: 0,
      sessionStartTime: new Date(),
      breaksTaken: 0,
      objectionsHeard: 0,
      contemptThreshold: Math.floor(Math.random() * 3) + 3, // 3-5
      lastMajorRuling: new Date()
    };
  }
  
  private static generateAppointingAuthority(): string {
    const authorities = [
      'Elected by popular vote',
      'Appointed by Governor',
      'Appointed by President',
      'Merit selection commission',
      'Legislative appointment',
      'Gubernatorial appointment'
    ];
    return authorities[Math.floor(Math.random() * authorities.length)];
  }
  
  private static generatePreviousCareer(template: JudgePersonalityTemplate): string[] {
    const careerPaths: Record<string, string[]> = {
      'criminal-law': ['Prosecutor', 'Public Defender', 'Criminal Defense Attorney'],
      'civil-litigation': ['Corporate Attorney', 'Personal Injury Attorney', 'Insurance Defense'],
      'family-law': ['Family Law Attorney', 'Mediator', 'Child Advocate'],
      'corporate-law': ['Corporate Counsel', 'Securities Attorney', 'Mergers & Acquisitions'],
      'constitutional-law': ['Civil Rights Attorney', 'Government Attorney', 'Law Professor'],
      'environmental-law': ['Environmental Attorney', 'Government Regulator', 'Public Interest Lawyer'],
      'general-practice': ['Solo Practitioner', 'Small Firm Attorney', 'County Attorney']
    };
    
    const paths = careerPaths[template.specialization] || careerPaths['general-practice'];
    const numPositions = Math.floor(Math.random() * 3) + 1;
    
    return paths.slice(0, numPositions);
  }
  
  private static generateLawSchool(): string {
    const lawSchools = [
      'Harvard Law School', 'Yale Law School', 'Stanford Law School',
      'Columbia Law School', 'University of Chicago Law School',
      'NYU School of Law', 'University of Pennsylvania Law School',
      'University of Virginia School of Law', 'University of Michigan Law School',
      'Duke University School of Law', 'Georgetown University Law Center',
      'Northwestern University Pritzker School of Law',
      'Cornell Law School', 'UCLA School of Law', 'Vanderbilt Law School',
      'Washington University School of Law', 'Boston University School of Law',
      'George Washington University Law School', 'State University Law School',
      'Regional Law School', 'Local Law School'
    ];
    
    // Weight toward more prestigious schools for senior judges
    const topSchools = lawSchools.slice(0, 8);
    const otherSchools = lawSchools.slice(8);
    
    return Math.random() < 0.3 ? 
      topSchools[Math.floor(Math.random() * topSchools.length)] :
      otherSchools[Math.floor(Math.random() * otherSchools.length)];
  }
  
  private static generateBarAdmissions(): string[] {
    const states = ['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Pennsylvania'];
    const numAdmissions = Math.floor(Math.random() * 3) + 1;
    
    return states.slice(0, numAdmissions);
  }
  
  private static calculateReputationScore(attributes: JudgeAttributes, yearsOnBench: number): number {
    const baseScore = (attributes.wisdom + attributes.fairness + attributes.integrity) / 3;
    const experienceBonus = Math.min(yearsOnBench / 20, 2); // Up to 2 points for experience
    return Math.min(Math.max(baseScore + experienceBonus, 1), 10);
  }
  
  private static calculateAttorneyRating(attributes: JudgeAttributes, quirks: JudgeQuirks): number {
    let rating = (attributes.fairness + attributes.efficiency + attributes.patience) / 3;
    
    // Adjust for quirks attorneys care about
    if (quirks.strictOnTime) rating += 0.5;
    if (quirks.strictOnAttorneys) rating -= 0.5;
    if (quirks.allowsObjections) rating += 0.3;
    if (quirks.usesHumor) rating += 0.2;
    
    return Math.min(Math.max(rating, 1), 10);
  }
  
  private static calculateReversalRating(attributes: JudgeAttributes): number {
    return (attributes.wisdom + attributes.analyticalSkill + attributes.fairness) / 3;
  }
  
  private static calculatePoliticalLeanings(template: JudgePersonalityTemplate): number {
    const baseLeaning = template.temperament === 'progressive' ? 3 :
                       template.temperament === 'strict' ? -2 :
                       Math.floor(Math.random() * 11) - 5; // -5 to +5
    
    return Math.min(Math.max(baseLeaning, -10), 10);
  }
  
  private static calculateRetirementDate(appointedDate: Date, yearsOnBench: number): Date | undefined {
    const currentAge = 45 + yearsOnBench; // Assume appointed at ~45
    if (currentAge >= 65) {
      const retirementDate = new Date();
      retirementDate.setFullYear(retirementDate.getFullYear() + Math.floor(Math.random() * 10));
      return retirementDate;
    }
    return undefined;
  }
  
  private static determineJurisdictionLevel(yearsOnBench: number, attributes: JudgeAttributes): EnhancedJudgeProfile['jurisdictionLevel'] {
    const prestigeScore = attributes.wisdom + attributes.authority + (yearsOnBench / 5);
    
    if (prestigeScore > 25) return 'supreme';
    if (prestigeScore > 20) return 'appellate';
    if (prestigeScore > 15) return 'federal';
    if (prestigeScore > 10) return 'state';
    return 'county';
  }
  
  private static inferPersonalityFromTraits(participant: Participant): JudgePersonalityTemplate {
    // Try to match existing personality to a template
    const { personality } = participant;
    
    if (personality.strictness && personality.strictness > 7) {
      return JUDGE_PERSONALITY_TEMPLATES.find(t => t.name === "The Iron Gavel") || getRandomJudgePersonality();
    }
    
    if (personality.empathy > 7) {
      return JUDGE_PERSONALITY_TEMPLATES.find(t => t.name === "The People's Judge") || getRandomJudgePersonality();
    }
    
    if (personality.analyticalThinking > 8) {
      return JUDGE_PERSONALITY_TEMPLATES.find(t => t.name === "The Scholar") || getRandomJudgePersonality();
    }
    
    return getRandomJudgePersonality();
  }
  
  private static generateJudgeName(index: number): string {
    const firstNames = [
      'Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'Robert', 'Maria', 'James',
      'Patricia', 'John', 'Elizabeth', 'William', 'Linda', 'Richard', 'Barbara',
      'Thomas', 'Susan', 'Charles', 'Jessica', 'Daniel', 'Margaret', 'Anthony'
    ];
    
    const lastNames = [
      'Mitchell', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
      'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis', 'Robinson'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `Hon. ${firstName} ${lastName}`;
  }
}