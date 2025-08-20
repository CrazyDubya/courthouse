import { 
  Case, 
  CaseType, 
  LegalSystem, 
  CaseStatus, 
  Evidence, 
  EvidenceType, 
  Role, 
  CaseSettings, 
  SimulationDepth 
} from '../types/index.js';
import { nanoid } from 'nanoid';

export class CaseGenerator {
  static generateCase(type: CaseType, legalSystem: LegalSystem): Case {
    const caseData = this.getCaseTemplate(type);
    
    return {
      id: nanoid(),
      title: caseData.title,
      type,
      legalSystem,
      description: caseData.description,
      background: caseData.background,
      charges: caseData.charges,
      claims: caseData.claims,
      facts: caseData.facts,
      evidence: this.generateEvidence(type),
      witnessLists: this.generateWitnessLists(type),
      timeline: [],
      status: CaseStatus.PREPARATION,
      settings: this.getDefaultSettings()
    };
  }

  private static getCaseTemplate(type: CaseType) {
    const templates: Record<string, any> = {
      [CaseType.CRIMINAL]: {
        title: 'State v. Johnson',
        description: 'Criminal case involving charges of burglary and theft',
        background: 'On the night of March 15th, a residential burglary occurred at 123 Oak Street. The defendant is accused of breaking into the home and stealing valuable items.',
        charges: ['Burglary in the First Degree', 'Theft in the Second Degree', 'Criminal Mischief'],
        claims: undefined,
        facts: [
          'Break-in occurred between 10 PM and 2 AM on March 15th',
          'Front door lock was damaged',
          'Electronics and jewelry worth $5,000 were stolen',
          'Defendant\'s fingerprints found on window frame',
          'Witness saw defendant near the house earlier that day'
        ]
      },
      [CaseType.CIVIL]: {
        title: 'Smith v. ABC Corporation',
        description: 'Personal injury lawsuit arising from workplace accident',
        background: 'Plaintiff was injured while working at defendant\'s manufacturing facility due to allegedly defective safety equipment.',
        charges: undefined,
        claims: ['Negligence', 'Product Liability', 'Unsafe Working Conditions'],
        facts: [
          'Accident occurred on company premises during work hours',
          'Safety equipment failed to function properly',
          'Plaintiff suffered significant injuries requiring surgery',
          'Company had prior knowledge of equipment issues',
          'Medical expenses exceeded $50,000'
        ]
      },
      [CaseType.FAMILY]: {
        title: 'In re: Custody of Minor Child',
        description: 'Child custody dispute between divorced parents',
        background: 'Parents seeking modification of custody arrangement due to changed circumstances.',
        charges: undefined,
        claims: ['Primary Custody', 'Child Support Modification', 'Visitation Rights'],
        facts: [
          'Parents divorced two years ago with joint custody',
          'One parent relocated for job opportunity',
          'Child expresses preference for living arrangement',
          'Both parents maintain stable employment',
          'Extended family support available on both sides'
        ]
      },
      [CaseType.CORPORATE]: {
        title: 'Merger Dispute: TechCorp v. InnovateLLC',
        description: 'Corporate merger dispute involving breach of contract claims',
        background: 'Dispute arising from failed merger agreement and allegations of material misrepresentation.',
        charges: undefined,
        claims: ['Breach of Contract', 'Fraudulent Misrepresentation', 'Damages'],
        facts: [
          'Merger agreement signed six months ago',
          'Due diligence revealed undisclosed liabilities',
          'Material changes in financial position not disclosed',
          'Merger failed to close by deadline',
          'Significant financial losses claimed by both parties'
        ]
      }
    };

    return templates[type] || templates[CaseType.CRIMINAL];
  }

  private static generateEvidence(type: CaseType): Evidence[] {
    const evidenceTemplates: Record<string, any> = {
      [CaseType.CRIMINAL]: [
        {
          type: EvidenceType.PHYSICAL,
          title: 'Fingerprint Evidence',
          description: 'Latent fingerprints recovered from crime scene',
          content: 'Fingerprint analysis shows 12-point match with defendant'
        },
        {
          type: EvidenceType.PHOTOGRAPHIC,
          title: 'Crime Scene Photos',
          description: 'Photographs of the burglary scene',
          content: 'Digital images showing damaged door and disturbed interior'
        },
        {
          type: EvidenceType.TESTIMONIAL,
          title: 'Witness Statement',
          description: 'Eyewitness account of suspicious activity',
          content: 'Witness saw defendant casing the neighborhood earlier that day'
        }
      ],
      [CaseType.CIVIL]: [
        {
          type: EvidenceType.DOCUMENT,
          title: 'Safety Inspection Report',
          description: 'Company safety inspection documenting equipment issues',
          content: 'Report indicates safety equipment had known defects'
        },
        {
          type: EvidenceType.DOCUMENT,
          title: 'Medical Records',
          description: 'Plaintiff\'s medical treatment records',
          content: 'Comprehensive medical documentation of injuries and treatment'
        },
        {
          type: EvidenceType.DIGITAL,
          title: 'Email Communications',
          description: 'Internal company emails about safety concerns',
          content: 'Email chain discussing equipment problems and delayed repairs'
        }
      ]
    };

    const templates = evidenceTemplates[type] || evidenceTemplates[CaseType.CRIMINAL];
    
    return templates.map((template: any, index: number) => ({
      id: nanoid(),
      type: template.type,
      title: template.title,
      description: template.description,
      content: template.content,
      metadata: {},
      privileges: [],
      submittedBy: index % 2 === 0 ? Role.PROSECUTOR : Role.DEFENSE_LAWYER,
      dateSubmitted: new Date(),
      admissible: true,
      objections: [],
      rulings: []
    }));
  }

  private static generateWitnessLists(type: CaseType): Record<Role, string[]> {
    const witnessTemplates: Record<string, any> = {
      [CaseType.CRIMINAL]: {
        [Role.PROSECUTOR]: [
          'Officer Maria Rodriguez - Investigating Officer',
          'Dr. Sarah Chen - Forensic Expert',
          'Tom Wilson - Eyewitness'
        ],
        [Role.DEFENSE_LAWYER]: [
          'Alice Johnson - Character Witness',
          'Dr. Michael Brown - Alibi Witness'
        ]
      },
      [CaseType.CIVIL]: {
        [Role.PLAINTIFF_LAWYER]: [
          'Dr. Jennifer Adams - Treating Physician',
          'Mark Thompson - Safety Expert',
          'Lisa Garcia - Coworker'
        ],
        [Role.DEFENSE_LAWYER]: [
          'Dr. Robert Lee - Defense Medical Expert',
          'Kevin Park - Safety Engineer'
        ]
      }
    };

    return witnessTemplates[type] || witnessTemplates[CaseType.CRIMINAL];
  }

  private static getDefaultSettings(): CaseSettings {
    return {
      jurySize: 6,
      simulationDepth: SimulationDepth.STANDARD,
      userControlledRoles: [],
      llmControlledRoles: Object.values(Role),
      allowObjections: true,
      allowSidebars: true,
      allowMiniHearings: true,
      preTrial: true,
      evidenceVideoLength: 5
    };
  }

  static createCustomCase(
    title: string,
    type: CaseType,
    legalSystem: LegalSystem,
    description: string,
    settings?: Partial<CaseSettings>
  ): Case {
    const baseCase = this.generateCase(type, legalSystem);
    
    return {
      ...baseCase,
      title,
      description,
      settings: {
        ...baseCase.settings,
        ...settings
      }
    };
  }

  static addEvidence(caseData: Case, evidence: Omit<Evidence, 'id' | 'dateSubmitted'>): Case {
    const newEvidence: Evidence = {
      ...evidence,
      id: nanoid(),
      dateSubmitted: new Date()
    };

    return {
      ...caseData,
      evidence: [...caseData.evidence, newEvidence]
    };
  }

  static addWitness(caseData: Case, role: Role, witnessName: string): Case {
    const currentWitnesses = caseData.witnessLists[role] || [];
    
    return {
      ...caseData,
      witnessLists: {
        ...caseData.witnessLists,
        [role]: [...currentWitnesses, witnessName]
      }
    };
  }

  static updateCaseStatus(caseData: Case, status: CaseStatus): Case {
    return {
      ...caseData,
      status,
      timeline: [
        ...caseData.timeline,
        {
          id: nanoid(),
          timestamp: new Date(),
          type: 'status_change',
          description: `Case status changed to ${status}`,
          participants: []
        }
      ]
    };
  }
}

export class EvidenceProcessor {
  static async processTextEvidence(content: string): Promise<string> {
    // Basic text processing - could be enhanced with NLP
    return content.trim();
  }

  static async processImageEvidence(_imageData: Buffer): Promise<string> {
    // Placeholder for image analysis - would integrate with vision AI
    return 'Image analysis: [Detailed description of visual evidence would be generated here using vision AI]';
  }

  static async processVideoEvidence(_videoData: Buffer, duration: number = 5): Promise<string> {
    // Placeholder for video analysis - would extract key frames and analyze
    return `Video analysis (${duration}s): [Detailed description of video evidence would be generated here using video AI]`;
  }

  static async processPDFEvidence(_pdfData: Buffer): Promise<string> {
    // Placeholder for PDF text extraction
    return 'PDF content: [Extracted text content from PDF would appear here]';
  }

  static generateEvidenceDescription(evidence: Evidence): string {
    const descriptions = {
      [EvidenceType.DOCUMENT]: 'Written documentation that may contain crucial information for the case',
      [EvidenceType.PHYSICAL]: 'Tangible evidence that was present at the scene or relevant to the case',
      [EvidenceType.TESTIMONIAL]: 'Sworn statement or testimony from witnesses or experts',
      [EvidenceType.DIGITAL]: 'Electronic evidence including emails, messages, or digital records',
      [EvidenceType.AUDIO]: 'Audio recordings that may contain relevant conversations or sounds',
      [EvidenceType.VIDEO]: 'Video footage that may show events relevant to the case',
      [EvidenceType.PHOTOGRAPHIC]: 'Photographic evidence showing conditions, people, or objects relevant to the case'
    };

    return descriptions[evidence.type] || 'Evidence relevant to the case proceedings';
  }
}