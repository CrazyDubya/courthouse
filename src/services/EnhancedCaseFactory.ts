import { 
  EnhancedCase, 
  CriminalCase, 
  CivilCase, 
  CriminalCharge,
  CivilClaim,
  BurdenOfProof 
} from '../types/caseTypes';
import { Case, CaseType, Evidence, Participant } from '../types';
import { generateChargesFromFacts, getCommonCharges, criminalCharges } from '../data/criminalCharges';
import { generateClaimsFromFacts, getCommonClaims, civilClaims } from '../data/civilClaims';

export class EnhancedCaseFactory {
  
  /**
   * Create an enhanced criminal case with proper charge structure
   */
  static createCriminalCase(
    baseCase: Partial<Case>,
    chargeTypes?: string[]
  ): EnhancedCase {
    const facts = baseCase.facts || [
      'Security footage shows defendant in the store',
      'Items were found missing after defendant left', 
      'Defendant was apprehended with some items',
      'Defendant claims misunderstanding about payment'
    ];

    // Generate appropriate charges based on facts or provided types
    let charges: CriminalCharge[];
    if (chargeTypes && chargeTypes.length > 0) {
      charges = chargeTypes.map(type => {
        const charge = Object.values(criminalCharges).find(c => c.crimeType === type);
        return charge || criminalCharges['theft-petty']; // fallback
      });
    } else {
      charges = generateChargesFromFacts(facts);
    }

    const criminalDetails: CriminalCase = {
      baseType: 'criminal',
      charges,
      burdenOfProof: 'beyond-reasonable-doubt',
      jurisdiction: 'state',
      districtAttorney: 'District Attorney\'s Office',
      investigatingAgency: ['Police Department', 'Detective Bureau'],
      defendantCustodyStatus: 'released-bail',
      bailAmount: 10000,
      priorConvictions: [],
      grandJuryIndictment: false,
      plea: 'not-guilty',
      sentencingGuidelines: 'State Sentencing Guidelines',
      victimImpactStatements: true,
      capitalCase: false,
      juvenileDefendant: false,
      mentalHealthConcerns: false
    };

    return {
      id: baseCase.id || `criminal-${Date.now()}`,
      title: baseCase.title || 'State v. Johnson',
      type: 'criminal',
      legalSystem: baseCase.legalSystem || 'common-law',
      summary: baseCase.summary || 'Defendant is charged with theft of property valued over $1000 from a retail establishment.',
      facts,
      criminal: criminalDetails,
      evidence: baseCase.evidence || [],
      participants: baseCase.participants || [],
      currentPhase: baseCase.currentPhase || 'pre-trial',
      transcript: baseCase.transcript || [],
      rulings: baseCase.rulings || []
    };
  }

  /**
   * Create an enhanced civil case with proper claim structure
   */
  static createCivilCase(
    baseCase: Partial<Case>,
    claimTypes?: string[]
  ): EnhancedCase {
    const facts = baseCase.facts || [
      'Parties entered into written contract for services',
      'Plaintiff performed all required obligations',
      'Defendant failed to pay agreed amount',
      'Plaintiff suffered financial losses as result'
    ];

    // Generate appropriate claims based on facts or provided types
    let claims: CivilClaim[];
    if (claimTypes && claimTypes.length > 0) {
      claims = claimTypes.map(type => {
        const claim = Object.values(civilClaims).find(c => c.claimType === type);
        return claim || civilClaims['breach-of-contract']; // fallback
      });
    } else {
      claims = generateClaimsFromFacts(facts);
    }

    const totalDamages = claims.reduce((sum, claim) => 
      sum + (claim.economicDamages || 0) + (claim.nonEconomicDamages || 0), 0
    );

    const civilDetails: CivilCase = {
      baseType: 'civil',
      claims,
      burdenOfProof: 'preponderance-of-evidence',
      plaintiffType: 'individual',
      defendantType: 'individual',
      discovery: {
        cutoffDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        depositionsAllowed: 10,
        interrogatoriesAllowed: 25,
        documentRequests: 50
      },
      settlementDiscussions: false,
      mediationRequired: false,
      arbitrationClause: false,
      totalDamagesClaimed: totalDamages,
      injunctiveReliefSought: claims.some(c => c.remediesRequested.includes('injunctive-relief')),
      classActionStatus: 'individual',
      juryTrial: true,
      complexCase: false,
      expertWitnessesRequired: false
    };

    return {
      id: baseCase.id || `civil-${Date.now()}`,
      title: baseCase.title || 'Smith v. Johnson',
      type: 'civil',
      legalSystem: baseCase.legalSystem || 'common-law',
      summary: baseCase.summary || 'Plaintiff seeks damages for breach of contract and related losses.',
      facts,
      civil: civilDetails,
      evidence: baseCase.evidence || [],
      participants: baseCase.participants || [],
      currentPhase: baseCase.currentPhase || 'pre-trial',
      transcript: baseCase.transcript || [],
      rulings: baseCase.rulings || []
    };
  }

  /**
   * Convert legacy Case to EnhancedCase
   */
  static enhanceExistingCase(legacyCase: Case): EnhancedCase {
    if (legacyCase.type === 'criminal') {
      return this.createCriminalCase(legacyCase);
    } else if (legacyCase.type === 'civil') {
      return this.createCivilCase(legacyCase);
    } else {
      // For other case types, create basic enhanced case
      return {
        id: legacyCase.id,
        title: legacyCase.title,
        type: legacyCase.type,
        legalSystem: legacyCase.legalSystem,
        summary: legacyCase.summary,
        facts: legacyCase.facts,
        evidence: legacyCase.evidence,
        participants: legacyCase.participants,
        currentPhase: legacyCase.currentPhase,
        transcript: legacyCase.transcript,
        rulings: legacyCase.rulings
      };
    }
  }

  /**
   * Create sample criminal cases for different crime types
   */
  static createSampleCriminalCases(): EnhancedCase[] {
    return [
      // Theft case
      this.createCriminalCase({
        id: 'criminal-theft-001',
        title: 'State v. Johnson',
        summary: 'Defendant charged with grand theft from retail establishment',
        facts: [
          'Security footage shows defendant in the store',
          'Items worth $1,500 were found missing',
          'Defendant was apprehended with stolen merchandise',
          'Defendant claims misunderstanding about payment'
        ]
      }, ['theft-grand']),

      // Assault case
      this.createCriminalCase({
        id: 'criminal-assault-001', 
        title: 'State v. Martinez',
        summary: 'Defendant charged with aggravated assault with weapon',
        facts: [
          'Altercation occurred outside nightclub',
          'Defendant struck victim with bottle',
          'Victim suffered lacerations requiring stitches',
          'Multiple witnesses observed the incident'
        ]
      }, ['assault-aggravated']),

      // DUI case
      this.createCriminalCase({
        id: 'criminal-dui-001',
        title: 'State v. Wilson', 
        summary: 'Defendant charged with driving under the influence',
        facts: [
          'Defendant was stopped for erratic driving',
          'Officer observed signs of intoxication',
          'Field sobriety tests were failed',
          'Blood alcohol content was 0.12%'
        ]
      }, ['dui-first'])
    ];
  }

  /**
   * Create sample civil cases for different claim types
   */
  static createSampleCivilCases(): EnhancedCase[] {
    return [
      // Contract dispute
      this.createCivilCase({
        id: 'civil-contract-001',
        title: 'Smith v. ABC Construction',
        summary: 'Plaintiff seeks damages for breach of construction contract',
        facts: [
          'Parties entered into $50,000 construction contract',
          'Plaintiff paid $25,000 deposit as required',
          'Defendant failed to complete work by deadline',
          'Plaintiff hired another contractor at higher cost'
        ]
      }, ['breach-of-contract']),

      // Personal injury
      this.createCivilCase({
        id: 'civil-injury-001',
        title: 'Davis v. Metro Transit',
        summary: 'Plaintiff seeks damages for injuries from bus accident',
        facts: [
          'Plaintiff was passenger on defendant\'s bus',
          'Bus driver failed to stop at red light',
          'Bus collided with another vehicle',
          'Plaintiff suffered back and neck injuries'
        ]
      }, ['negligence-personal-injury']),

      // Employment dispute
      this.createCivilCase({
        id: 'civil-employment-001',
        title: 'Rodriguez v. TechCorp Inc.',
        summary: 'Plaintiff alleges wrongful termination and discrimination',
        facts: [
          'Plaintiff worked for defendant for 5 years',
          'Plaintiff reported safety violations to authorities',
          'Defendant terminated plaintiff one week later',
          'Similarly situated employees were not terminated'
        ]
      }, ['wrongful-termination'])
    ];
  }

  /**
   * Generate evidence appropriate for case type
   */
  static generateCaseTypeEvidence(enhancedCase: EnhancedCase): Evidence[] {
    const evidence: Evidence[] = [];

    if (enhancedCase.criminal) {
      // Criminal case evidence
      evidence.push(
        {
          id: 'ev-criminal-001',
          type: 'video',
          title: 'Security Camera Footage',
          description: 'Video showing defendant at scene of alleged crime',
          admissible: true,
          submittedBy: 'prosecutor-1',
          chainOfCustody: ['Store Security', 'Police Evidence Tech', 'Prosecution'],
          exhibit: 'State-1'
        },
        {
          id: 'ev-criminal-002',
          type: 'physical',
          title: 'Physical Evidence',
          description: 'Items allegedly stolen by defendant',
          admissible: true,
          submittedBy: 'prosecutor-1',
          chainOfCustody: ['Store Manager', 'Police', 'Evidence Locker', 'Prosecution'],
          exhibit: 'State-2'
        },
        {
          id: 'ev-criminal-003',
          type: 'document',
          title: 'Police Report',
          description: 'Initial incident report and witness statements',
          admissible: true,
          submittedBy: 'prosecutor-1',
          chainOfCustody: ['Responding Officer', 'Prosecution'],
          exhibit: 'State-3'
        }
      );
    } else if (enhancedCase.civil) {
      // Civil case evidence
      evidence.push(
        {
          id: 'ev-civil-001',
          type: 'document',
          title: 'Contract Agreement',
          description: 'Original signed contract between parties',
          admissible: true,
          submittedBy: 'plaintiff-attorney-1',
          chainOfCustody: ['Plaintiff', 'Attorney'],
          exhibit: 'Plaintiff-1'
        },
        {
          id: 'ev-civil-002',
          type: 'document',
          title: 'Financial Records',
          description: 'Documentation of payments and losses',
          admissible: true,
          submittedBy: 'plaintiff-attorney-1',
          chainOfCustody: ['Plaintiff', 'Accountant', 'Attorney'],
          exhibit: 'Plaintiff-2'
        },
        {
          id: 'ev-civil-003',
          type: 'document',
          title: 'Correspondence',
          description: 'Email and letter communications between parties',
          admissible: true,
          submittedBy: 'plaintiff-attorney-1',
          chainOfCustody: ['Plaintiff', 'Attorney'],
          exhibit: 'Plaintiff-3'
        }
      );
    }

    return evidence;
  }

  /**
   * Get burden of proof for case type
   */
  static getBurdenOfProof(caseType: CaseType): BurdenOfProof {
    switch (caseType) {
      case 'criminal':
        return 'beyond-reasonable-doubt';
      case 'civil':
      case 'family':
      case 'corporate':
        return 'preponderance-of-evidence';
      case 'constitutional':
        return 'clear-and-convincing';
      default:
        return 'preponderance-of-evidence';
    }
  }

  /**
   * Determine if jury trial is appropriate
   */
  static isJuryTrialAppropriate(enhancedCase: EnhancedCase): boolean {
    if (enhancedCase.criminal) {
      // Most criminal cases have right to jury trial
      const charges = enhancedCase.criminal.charges;
      return charges.some(charge => charge.category === 'felony' || charge.maximumSentence?.includes('jail'));
    } else if (enhancedCase.civil) {
      // Civil cases with damages typically have jury right
      return enhancedCase.civil.totalDamagesClaimed > 20; // Federal threshold is $20
    }
    return true; // Default to jury trial
  }

  /**
   * Get potential outcomes for case type
   */
  static getPotentialOutcomes(enhancedCase: EnhancedCase): string[] {
    if (enhancedCase.criminal) {
      return [
        'Guilty on all charges',
        'Guilty on lesser charges',
        'Not guilty on all charges', 
        'Hung jury',
        'Plea bargain accepted',
        'Dismissal of charges'
      ];
    } else if (enhancedCase.civil) {
      return [
        'Judgment for plaintiff - full damages',
        'Judgment for plaintiff - reduced damages',
        'Judgment for defendant',
        'Settlement reached',
        'Case dismissed',
        'Hung jury'
      ];
    }
    return ['Case resolved', 'Case dismissed'];
  }

  /**
   * Get case complexity score (1-10)
   */
  static getCaseComplexity(enhancedCase: EnhancedCase): number {
    let complexity = 1;

    if (enhancedCase.criminal) {
      const charges = enhancedCase.criminal.charges;
      complexity += charges.length; // More charges = more complex
      complexity += charges.filter(c => c.category === 'felony').length * 2; // Felonies add more
      if (enhancedCase.criminal.capitalCase) complexity += 5;
      if (enhancedCase.criminal.mentalHealthConcerns) complexity += 2;
    } else if (enhancedCase.civil) {
      const claims = enhancedCase.civil.claims;
      complexity += claims.length;
      complexity += enhancedCase.civil.classActionStatus !== 'individual' ? 3 : 0;
      complexity += enhancedCase.civil.totalDamagesClaimed > 1000000 ? 2 : 0;
      complexity += enhancedCase.civil.expertWitnessesRequired ? 2 : 0;
    }

    return Math.min(10, complexity);
  }
}