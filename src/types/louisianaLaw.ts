import { LegalSystem, CaseType } from './index';
import { CivilClaim, BurdenOfProof } from './caseTypes';

// Louisiana-specific legal system types
export type LouisianaLegalSource = 
  | 'civil-code'           // Louisiana Civil Code
  | 'code-civil-procedure' // Louisiana Code of Civil Procedure
  | 'revised-statutes'     // Louisiana Revised Statutes
  | 'constitution'         // Louisiana Constitution
  | 'jurisprudence'        // Court decisions (persuasive only)
  | 'doctrine'            // Legal scholarship
  | 'custom';             // Legal custom

// Louisiana civil law court system
export type LouisianaCourtType =
  | 'district-court'      // Trial courts of general jurisdiction
  | 'city-court'          // Limited jurisdiction municipal courts
  | 'parish-court'        // Justice of the peace courts
  | 'juvenile-court'      // Juvenile and family matters
  | 'court-of-appeal'     // Intermediate appellate courts
  | 'supreme-court';      // Louisiana Supreme Court

// Louisiana parish system (equivalent to counties in other states)
export type LouisianaParish = 
  | 'orleans'     // New Orleans
  | 'jefferson'   // Metairie, Kenner
  | 'caddo'       // Shreveport
  | 'calcasieu'   // Lake Charles
  | 'lafayette'   // Lafayette
  | 'east-baton-rouge' // Baton Rouge
  | 'rapides'     // Alexandria
  | 'ouachita'    // Monroe
  | 'tangipahoa'  // Hammond
  | 'st-tammany'  // Covington
  | 'terrebonne'  // Houma
  | 'lafayette'   // Lafayette
  | 'other';      // Other parishes

// Louisiana civil law terminology differences
export interface LouisianaTerminology {
  // Property law terms
  ownership: 'full-ownership' | 'usufruct' | 'naked-ownership';
  propertyTypes: ('movable' | 'immovable' | 'incorporeal')[];
  
  // Contract law terms
  contractType: 'synallagmatic' | 'unilateral' | 'commutative' | 'aleatory' | 'gratuitous' | 'onerous';
  
  // Procedure terms
  proceeding: 'ordinary-proceeding' | 'summary-proceeding' | 'executory-proceeding';
  pleading: 'petition' | 'answer' | 'exception' | 'reconventional-demand';
  
  // Remedies
  remedy: 'specific-performance' | 'dissolution' | 'rescission' | 'reduction-of-price' | 'damages';
}

// Louisiana civil law case structure
export interface LouisianaCivilCase {
  // Basic case information
  parish: LouisianaParish;
  courtType: LouisianaCourtType;
  docketNumber: string;
  
  // Legal basis under Louisiana law
  legalSources: LouisianaLegalSource[];
  applicableCodeArticles: string[]; // e.g., "La. C.C. Art. 2315"
  jurisprudenceReferences: string[]; // Persuasive case law
  
  // Louisiana-specific procedural aspects
  proceedingType: 'ordinary-proceeding' | 'summary-proceeding' | 'executory-proceeding';
  serviceMethod: 'citation' | 'rule-to-show-cause' | 'writ';
  
  // Community property considerations (if applicable)
  communityPropertyIssues: boolean;
  separatePropertyClaims: boolean;
  
  // Civil law specific claims
  claims: LouisianaCivilClaim[];
  
  // Discovery under Louisiana law
  discoveryRules: {
    interrogatories: boolean;
    requestsForAdmission: boolean;
    requestsForProduction: boolean;
    depositions: boolean;
    mentalPhysicalExamination: boolean;
  };
  
  // Judgment and execution
  judgmentType: 'money-judgment' | 'possessory-judgment' | 'declaratory-judgment';
  executionAvailable: boolean;
  
  // Appeal rights under Louisiana law
  appealable: boolean;
  appealDeadline: number; // Days
  appealType: 'appeal' | 'writ-application';
}

// Louisiana-specific civil claims
export interface LouisianaCivilClaim extends CivilClaim {
  // Louisiana civil code basis
  codeArticles: string[]; // e.g., ["La. C.C. Art. 2315", "La. C.C. Art. 2316"]
  
  // Louisiana tort law specifics
  tortType?: 'fault-based' | 'strict-liability' | 'intentional-tort';
  faultStandard?: 'reasonable-person' | 'professional-standard' | 'strict-liability';
  
  // Louisiana contract law specifics
  contractTheory?: 'breach-synallagmatic' | 'breach-unilateral' | 'vices-of-consent' | 'impossibility';
  vicesOfConsent?: ('error' | 'fraud' | 'duress')[];
  
  // Louisiana property law specifics
  propertyRights?: ('ownership' | 'usufruct' | 'habitation' | 'use' | 'servitude' | 'mineral-rights')[];
  
  // Damages under Louisiana law
  damagesType: 'compensatory' | 'consequential' | 'moral' | 'exemplary';
  moralDamages?: number; // Pain and suffering under Louisiana law
  
  // Louisiana-specific remedies
  louisianaRemedies: LouisianaRemedy[];
}

export type LouisianaRemedy = 
  | 'specific-performance'     // Force performance of obligation
  | 'dissolution-of-contract'  // Cancel contract
  | 'rescission'              // Undo contract from beginning  
  | 'reduction-of-price'      // Reduce purchase price
  | 'warranty-damages'        // Breach of warranty compensation
  | 'possessory-action'       // Recover possession of property
  | 'petitory-action'         // Establish ownership of property
  | 'boundary-action'         // Establish property boundaries
  | 'injunctive-relief'       // Equitable relief
  | 'declaratory-judgment'    // Clarify legal relationships
  | 'mandamus'               // Compel government action
  | 'prohibition'            // Prevent government action
  | 'quo-warranto';          // Challenge right to public office

// Louisiana procedure rules
export interface LouisianaProcedure {
  // Service of process
  serviceRules: {
    personalService: boolean;
    substitutedService: boolean;
    publicationService: boolean;
    longArmJurisdiction: boolean;
  };
  
  // Pleadings
  pleadingRules: {
    petitionRequired: boolean;
    answerTimeLimit: number; // Days
    exceptionsAllowed: string[]; // Types of exceptions
    reconventionalDemandAllowed: boolean;
  };
  
  // Discovery
  discoveryRules: {
    interrogatoriesLimit: number;
    depositionTimeLimit: number; // Hours
    documentRequestLimit: number;
    admissionRequestLimit: number;
  };
  
  // Trial
  trialRules: {
    juryTrialAvailable: boolean;
    jurySize: number;
    verdictRequirement: 'unanimous' | 'majority';
    judgmentTypes: string[];
  };
  
  // Post-judgment
  postJudgmentRules: {
    appealTimeLimit: number; // Days
    executionStay: boolean;
    suspensiveBondRequired: boolean;
  };
}

// Comparison of Louisiana vs Common Law approaches
export interface LegalSystemComparison {
  topic: string;
  commonLawApproach: string;
  louisianaApproach: string;
  keyDifferences: string[];
  practicalImpact: string;
}

// Common legal system comparisons
export const legalSystemComparisons: LegalSystemComparison[] = [
  {
    topic: 'Source of Law',
    commonLawApproach: 'Judge-made law through precedent (stare decisis)',
    louisianaApproach: 'Written civil code with jurisprudence as persuasive authority',
    keyDifferences: [
      'Louisiana emphasizes codified law over judicial precedent',
      'Court decisions are persuasive but not binding',
      'Legal reasoning focuses on code interpretation'
    ],
    practicalImpact: 'Lawyers must focus on code articles rather than case law'
  },
  {
    topic: 'Property Ownership',
    commonLawApproach: 'Fee simple absolute with various estates',
    louisianaApproach: 'Full ownership, usufruct, and naked ownership concepts',
    keyDifferences: [
      'Louisiana recognizes usufruct (right to use and enjoy)',
      'Community property regime for married couples',
      'Different concepts of mineral rights'
    ],
    practicalImpact: 'Property transactions require understanding of Louisiana concepts'
  },
  {
    topic: 'Contract Formation',
    commonLawApproach: 'Offer, acceptance, consideration',
    louisianaApproach: 'Consent, object, cause under Civil Code',
    keyDifferences: [
      'Louisiana focuses on cause rather than consideration',
      'Different rules for contract interpretation',
      'Unique provisions for vices of consent'
    ],
    practicalImpact: 'Contract drafting and interpretation differ significantly'
  },
  {
    topic: 'Tort Liability',
    commonLawApproach: 'Duty, breach, causation, damages',
    louisianaApproach: 'Fault-based liability under Civil Code Article 2315',
    keyDifferences: [
      'Louisiana has broader fault-based liability',
      'Different standards for negligence',
      'Unique provisions for moral damages'
    ],
    practicalImpact: 'Personal injury cases proceed under different legal theories'
  },
  {
    topic: 'Marital Property',
    commonLawApproach: 'Common law separate property with equitable distribution',
    louisianaApproach: 'Community property regime',
    keyDifferences: [
      'All property acquired during marriage is community property',
      'Different rules for separate property',
      'Unique succession rights'
    ],
    practicalImpact: 'Divorce and estate planning require Louisiana-specific expertise'
  }
];

// Louisiana civil law case factory functions
export class LouisianaCaseFactory {
  
  static createLouisianaCivilCase(
    baseCase: any,
    parish: LouisianaParish = 'orleans'
  ): LouisianaCivilCase {
    return {
      parish,
      courtType: 'district-court',
      docketNumber: `${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      legalSources: ['civil-code', 'code-civil-procedure'],
      applicableCodeArticles: this.getRelevantCodeArticles(baseCase.type),
      jurisprudenceReferences: [],
      proceedingType: 'ordinary-proceeding',
      serviceMethod: 'citation',
      communityPropertyIssues: false,
      separatePropertyClaims: false,
      claims: this.convertToLouisianaClaims(baseCase.claims || []),
      discoveryRules: {
        interrogatories: true,
        requestsForAdmission: true,
        requestsForProduction: true,
        depositions: true,
        mentalPhysicalExamination: false
      },
      judgmentType: 'money-judgment',
      executionAvailable: true,
      appealable: true,
      appealDeadline: 30,
      appealType: 'appeal'
    };
  }
  
  private static getRelevantCodeArticles(caseType: string): string[] {
    switch (caseType) {
      case 'contract-dispute':
        return ['La. C.C. Art. 1993', 'La. C.C. Art. 2018', 'La. C.C. Art. 1934'];
      case 'personal-injury':
        return ['La. C.C. Art. 2315', 'La. C.C. Art. 2316'];
      case 'property-dispute':
        return ['La. C.C. Art. 477', 'La. C.C. Art. 526', 'La. C.C. Art. 742'];
      case 'family-law':
        return ['La. C.C. Art. 2336', 'La. C.C. Art. 2369'];
      default:
        return ['La. C.C. Art. 2315']; // General fault liability
    }
  }
  
  private static convertToLouisianaClaims(claims: any[]): LouisianaCivilClaim[] {
    return claims.map(claim => ({
      ...claim,
      codeArticles: this.getRelevantCodeArticles(claim.claimType),
      tortType: claim.claimType.includes('negligence') ? 'fault-based' : 'intentional-tort',
      faultStandard: 'reasonable-person',
      damagesType: 'compensatory',
      louisianaRemedies: this.getLouisianaRemedies(claim.claimType)
    }));
  }
  
  private static getLouisianaRemedies(claimType: string): LouisianaRemedy[] {
    switch (claimType) {
      case 'breach-of-contract':
        return ['specific-performance', 'dissolution-of-contract', 'reduction-of-price'];
      case 'negligence-personal-injury':
        return ['declaratory-judgment'];
      case 'property-dispute':
        return ['possessory-action', 'petitory-action', 'boundary-action'];
      default:
        return ['declaratory-judgment', 'injunctive-relief'];
    }
  }
  
  static getLouisianaProcedureRules(): LouisianaProcedure {
    return {
      serviceRules: {
        personalService: true,
        substitutedService: true,
        publicationService: true,
        longArmJurisdiction: true
      },
      pleadingRules: {
        petitionRequired: true,
        answerTimeLimit: 15, // Days under Louisiana law
        exceptionsAllowed: [
          'lack-of-jurisdiction',
          'improper-venue', 
          'insufficiency-of-citation',
          'insufficiency-of-service',
          'no-cause-of-action',
          'no-right-to-bring-action'
        ],
        reconventionalDemandAllowed: true
      },
      discoveryRules: {
        interrogatoriesLimit: 35,
        depositionTimeLimit: 7, // Hours
        documentRequestLimit: 50,
        admissionRequestLimit: 30
      },
      trialRules: {
        juryTrialAvailable: true,
        jurySize: 6, // Louisiana typically uses 6-person juries in civil cases
        verdictRequirement: 'majority', // 5 out of 6 jurors
        judgmentTypes: ['money-judgment', 'possessory-judgment', 'declaratory-judgment']
      },
      postJudgmentRules: {
        appealTimeLimit: 30, // Days
        executionStay: false,
        suspensiveBondRequired: true
      }
    };
  }
}

// Louisiana legal terminology dictionary
export const louisianaLegalTerms: Record<string, { definition: string; commonLawEquivalent?: string }> = {
  'usufruct': {
    definition: 'Right to use and enjoy property belonging to another',
    commonLawEquivalent: 'Life estate'
  },
  'naked-ownership': {
    definition: 'Ownership of property subject to a usufruct',
    commonLawEquivalent: 'Remainder interest'
  },
  'synallagmatic-contract': {
    definition: 'Contract creating mutual obligations',
    commonLawEquivalent: 'Bilateral contract'
  },
  'vices-of-consent': {
    definition: 'Defects in agreement formation (error, fraud, duress)',
    commonLawEquivalent: 'Contract defenses'
  },
  'moral-damages': {
    definition: 'Compensation for mental or physical pain and suffering',
    commonLawEquivalent: 'Pain and suffering damages'
  },
  'reconventional-demand': {
    definition: 'Defendant\'s claim against plaintiff',
    commonLawEquivalent: 'Counterclaim'
  },
  'exception': {
    definition: 'Procedural objection to plaintiff\'s petition',
    commonLawEquivalent: 'Motion to dismiss'
  },
  'citation': {
    definition: 'Official notice of lawsuit',
    commonLawEquivalent: 'Summons'
  },
  'parish': {
    definition: 'Political subdivision equivalent to county',
    commonLawEquivalent: 'County'
  },
  'immovable': {
    definition: 'Real property that cannot be moved',
    commonLawEquivalent: 'Real property'
  },
  'movable': {
    definition: 'Personal property that can be moved',
    commonLawEquivalent: 'Personal property'
  }
};

export default {
  LouisianaCaseFactory,
  legalSystemComparisons,
  louisianaLegalTerms
};