import { Evidence } from '../types';
import { NYSCriminalCharge } from '../data/NYSCriminalCharges';

export interface DetailedEvidence extends Evidence {
  foundationRequired: boolean;
  authenticityChain: string[];
  expertWitnessRequired?: boolean;
  objectionLikely: string[];
  impeachmentValue?: string;
  realValue?: boolean; // Physical evidence that can be examined
  demonstrativeValue?: boolean; // Evidence used to illustrate testimony
}

export interface EvidenceContext {
  location: string;
  timeOfIncident: string;
  weatherConditions?: string;
  participants: string[];
  charges: NYSCriminalCharge[];
  caseType: 'criminal' | 'civil';
}

export class EvidenceFactory {
  
  /**
   * Generate comprehensive evidence package for a case
   */
  static generateEvidencePackage(context: EvidenceContext): DetailedEvidence[] {
    const evidenceList: DetailedEvidence[] = [];

    // Generate evidence based on charges
    for (const charge of context.charges) {
      evidenceList.push(...this.generateEvidenceForCharge(charge, context));
    }

    // Add general scene evidence
    evidenceList.push(...this.generateSceneEvidence(context));

    // Add witness statements as documentary evidence
    evidenceList.push(...this.generateWitnessStatements(context));

    return evidenceList;
  }

  /**
   * Generate charge-specific evidence
   */
  private static generateEvidenceForCharge(charge: NYSCriminalCharge, context: EvidenceContext): DetailedEvidence[] {
    const evidence: DetailedEvidence[] = [];

    switch (charge.crimeType) {
      case 'murder-first':
      case 'murder-second':
        evidence.push(...this.generateHomicideEvidence(context));
        break;
      case 'robbery-first':
      case 'robbery-second':
      case 'robbery-third':
        evidence.push(...this.generateRobberyEvidence(context));
        break;
      case 'theft-grand':
      case 'theft-petty':
        evidence.push(...this.generateTheftEvidence(context));
        break;
      case 'assault-aggravated':
      case 'assault-simple':
        evidence.push(...this.generateAssaultEvidence(context));
        break;
      case 'drug-possession-a1':
        evidence.push(...this.generateDrugEvidence(context));
        break;
    }

    return evidence;
  }

  /**
   * Generate homicide-specific evidence
   */
  private static generateHomicideEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `autopsy-report-${Date.now()}`,
        type: 'document',
        title: 'Autopsy Report',
        description: 'Medical Examiner\'s autopsy report detailing cause and manner of death, time of death estimation, and physical evidence on victim\'s body',
        content: 'Cause of death: Multiple stab wounds to chest and abdomen. Manner of death: Homicide. Time of death: Approximately 10:30 PM based on rigor mortis and body temperature. Defensive wounds present on victim\'s hands and forearms indicating struggle.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Medical Examiner Dr. Sarah Chen', 'NYPD Detective Bureau', 'District Attorney\'s Office'],
        exhibit: 'People\'s 1',
        foundationRequired: true,
        authenticityChain: ['Medical Examiner testimony', 'Chain of custody documentation'],
        expertWitnessRequired: true,
        objectionLikely: ['Hearsay if not properly authenticated'],
        realValue: true
      },
      {
        id: `murder-weapon-${Date.now()}`,
        type: 'physical',
        title: 'Kitchen Knife - Murder Weapon',
        description: '8-inch kitchen knife recovered from defendant\'s apartment with victim\'s blood and defendant\'s fingerprints',
        content: 'Serrated kitchen knife, 8-inch blade, black handle. Blood analysis confirms victim\'s DNA. Clear fingerprint impressions of defendant on handle.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Officer Michael Torres - Arresting Officer', 'NYPD Evidence Unit', 'Crime Lab', 'DA\'s Office'],
        exhibit: 'People\'s 2',
        foundationRequired: true,
        authenticityChain: ['Officer testimony about recovery', 'Evidence technician testimony', 'Lab analysis'],
        objectionLikely: ['Chain of custody if gaps exist', 'Search and seizure if warrant issues'],
        realValue: true
      },
      {
        id: `dna-analysis-${Date.now()}`,
        type: 'document',
        title: 'DNA Analysis Report',
        description: 'Forensic DNA analysis of blood evidence from crime scene and murder weapon',
        content: 'DNA profile from blood on knife matches victim with probability of 1 in 7.8 billion. DNA under victim\'s fingernails matches defendant with probability of 1 in 2.1 billion.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Crime Scene Unit', 'OCME DNA Lab', 'DA\'s Office'],
        exhibit: 'People\'s 3',
        foundationRequired: true,
        authenticityChain: ['Crime scene technician testimony', 'Lab technician certification'],
        expertWitnessRequired: true,
        objectionLikely: ['Frye hearing may be required for DNA methodology'],
        realValue: false,
        demonstrativeValue: true
      }
    ];
  }

  /**
   * Generate robbery-specific evidence
   */
  private static generateRobberyEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `surveillance-video-${Date.now()}`,
        type: 'video',
        title: 'Store Security Surveillance',
        description: 'Digital video surveillance from store cameras showing entire robbery incident',
        content: 'High-definition color video showing defendant entering store at 9:47 PM, approaching counter with knife visible, demanding money from register, victim complying, defendant fleeing scene at 9:51 PM.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Store Manager Jennifer Liu', 'NYPD Detective Adams', 'DA\'s Office ADA Rodriguez'],
        exhibit: 'People\'s 4',
        foundationRequired: true,
        authenticityChain: ['Store manager testimony about system', 'Detective testimony about download'],
        objectionLikely: ['Authentication of digital evidence', 'Best evidence rule'],
        realValue: true
      },
      {
        id: `stolen-property-${Date.now()}`,
        type: 'physical',
        title: 'Stolen Cash and Register Drawer',
        description: 'Cash register drawer and bills recovered from defendant totaling $347',
        content: '$347 in various denominations recovered from defendant\'s person during arrest. Bills include three $20 bills with sequential serial numbers matching store\'s bank deposit record from that morning.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Officer Torres - Arresting Officer', 'Property Clerk', 'DA\'s Office'],
        exhibit: 'People\'s 5',
        foundationRequired: true,
        authenticityChain: ['Arresting officer testimony', 'Store manager identification'],
        objectionLikely: ['Search incident to arrest if arrest was unlawful'],
        realValue: true
      },
      {
        id: `victim-medical-records-${Date.now()}`,
        type: 'document',
        title: 'Emergency Room Treatment Records',
        description: 'Medical records from victim\'s treatment for injuries sustained during robbery',
        content: 'Patient treated for acute stress reaction, minor lacerations on hands from broken glass, and psychological trauma. Physician notes victim was "visibly shaken and fearful" with elevated heart rate and blood pressure consistent with traumatic stress.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['St. Mary\'s Hospital', 'Medical Records Department', 'DA\'s Office via subpoena'],
        exhibit: 'People\'s 6',
        foundationRequired: true,
        authenticityChain: ['Medical records custodian testimony', 'Treating physician if necessary'],
        objectionLikely: ['Physician-patient privilege', 'HIPAA privacy objections'],
        realValue: false
      }
    ];
  }

  /**
   * Generate theft-specific evidence
   */
  private static generateTheftEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `store-inventory-${Date.now()}`,
        type: 'document',
        title: 'Store Inventory Records',
        description: 'Computerized inventory showing items missing and their retail values',
        content: 'Inventory system shows 3 items missing: Apple iPhone 14 Pro ($999), Samsung Galaxy Watch ($329), Wireless earbuds ($179). Total retail value: $1,507. All items scanned out of system between 2:15-2:17 PM on date of incident.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Store Manager', 'Loss Prevention', 'NYPD', 'DA\'s Office'],
        exhibit: 'People\'s 7',
        foundationRequired: true,
        authenticityChain: ['Business records exception', 'Store manager testimony'],
        objectionLikely: ['Business records foundation', 'Computer records authentication'],
        realValue: false
      },
      {
        id: `recovered-merchandise-${Date.now()}`,
        type: 'physical',
        title: 'Recovered Stolen Merchandise',
        description: 'iPhone and accessories recovered from defendant\'s residence with original packaging and store security tags',
        content: 'iPhone 14 Pro, Space Black, 256GB with original Apple packaging. Store security tag still attached. Serial number matches store inventory record. Device shows no signs of use.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Detective Johnson - Search Warrant', 'Property Clerk', 'Store Loss Prevention Manager', 'DA\'s Office'],
        exhibit: 'People\'s 8',
        foundationRequired: true,
        authenticityChain: ['Search warrant testimony', 'Store manager identification'],
        objectionLikely: ['Fourth Amendment search issues', 'Chain of custody'],
        realValue: true
      }
    ];
  }

  /**
   * Generate assault-specific evidence
   */
  private static generateAssaultEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `medical-photos-${Date.now()}`,
        type: 'photograph',
        title: 'Victim\'s Injury Photographs',
        description: 'Digital photographs documenting victim\'s injuries taken at hospital',
        content: 'Series of 12 digital photographs showing: facial bruising and swelling around left eye, 2-inch laceration on forehead requiring 8 stitches, bruising on arms consistent with defensive wounds. Photos taken 3 hours post-incident.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['St. Luke\'s Hospital Nurse', 'NYPD Photographer', 'DA\'s Office'],
        exhibit: 'People\'s 9',
        foundationRequired: true,
        authenticityChain: ['Photographer testimony', 'Hospital staff identification'],
        objectionLikely: ['Inflammatory nature', 'Relevance vs. prejudice'],
        realValue: true,
        demonstrativeValue: true
      },
      {
        id: `defendant-statement-${Date.now()}`,
        type: 'audio',
        title: 'Defendant\'s Recorded Statement',
        description: 'Audio recording of defendant\'s statement to police after Miranda warnings',
        content: '47-minute recorded interview. Defendant initially denies involvement, then admits to "pushing" victim but claims self-defense. States "I didn\'t mean to hurt him that bad" and "He came at me first with something in his hand."',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Detective Williams - Interviewing Officer', 'NYPD Audio Unit', 'DA\'s Office'],
        exhibit: 'People\'s 10',
        foundationRequired: true,
        authenticityChain: ['Detective testimony about recording', 'Miranda warnings documentation'],
        objectionLikely: ['Miranda violations', 'Coercion', 'Right to counsel issues'],
        realValue: true
      }
    ];
  }

  /**
   * Generate drug offense evidence
   */
  private static generateDrugEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `drug-analysis-${Date.now()}`,
        type: 'document',
        title: 'Narcotics Analysis Report',
        description: 'Laboratory analysis confirming identity and weight of seized narcotics',
        content: 'Substance tested positive for cocaine hydrochloride. Net weight: 8.7 ounces (247 grams). Purity: 89%. Field test and laboratory confirmation using gas chromatography-mass spectrometry.',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Officer Martinez - Searching Officer', 'NYPD Property', 'Police Lab', 'DA\'s Office'],
        exhibit: 'People\'s 11',
        foundationRequired: true,
        authenticityChain: ['Chain of custody forms', 'Lab technician certification'],
        expertWitnessRequired: true,
        objectionLikely: ['Chain of custody gaps', 'Lab procedures'],
        realValue: false
      }
    ];
  }

  /**
   * Generate general scene evidence
   */
  private static generateSceneEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `scene-photos-${Date.now()}`,
        type: 'photograph',
        title: 'Crime Scene Photographs',
        description: `Professional crime scene photographs taken at ${context.location}`,
        content: `Comprehensive photographic documentation of scene including: overall view of ${context.location}, close-up views of physical evidence locations, measurement scales for evidence positioning, lighting and visibility conditions at time of incident.`,
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Crime Scene Unit Photographer', 'NYPD Photo Unit', 'DA\'s Office'],
        exhibit: 'People\'s A-1 through A-24',
        foundationRequired: true,
        authenticityChain: ['Photographer testimony', 'Date/time stamp authentication'],
        objectionLikely: ['Inflammatory if graphic', 'Cumulative evidence'],
        realValue: true,
        demonstrativeValue: true
      },
      {
        id: `police-report-${Date.now()}`,
        type: 'document',
        title: 'Initial Police Report',
        description: 'Official NYPD complaint report documenting initial response and observations',
        content: `Complaint #${context.location.replace(/\s+/g, '')}${Date.now().toString().slice(-6)}. Officers responded to ${context.location} at ${context.timeOfIncident}. Initial complainant interview, scene description, and preliminary investigation findings documented.`,
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Reporting Officer', 'NYPD Records', 'DA\'s Office'],
        exhibit: 'People\'s 12',
        foundationRequired: true,
        authenticityChain: ['Business records exception', 'Officer testimony if needed'],
        objectionLikely: ['Hearsay within hearsay', 'Opinion vs. fact'],
        realValue: false
      }
    ];
  }

  /**
   * Generate witness statements as documentary evidence
   */
  private static generateWitnessStatements(context: EvidenceContext): DetailedEvidence[] {
    const statements: DetailedEvidence[] = [];
    
    // Generate statements for different witness types
    const witnessTypes = ['eyewitness', 'character', 'expert'];
    
    witnessTypes.forEach((type, index) => {
      statements.push({
        id: `witness-statement-${type}-${Date.now()}-${index}`,
        type: 'document',
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Statement`,
        description: `Written statement from ${type} witness regarding the incident`,
        content: this.generateStatementContent(type, context),
        admissible: true,
        submittedBy: type === 'character' ? 'defense-1' : 'prosecutor-1',
        chainOfCustody: ['Witness', 'Police/Attorney', 'DA\'s Office or Defense'],
        exhibit: type === 'character' ? 'Defense A' : `People\'s ${13 + index}`,
        foundationRequired: true,
        authenticityChain: ['Witness signature', 'Taking officer/attorney testimony'],
        objectionLikely: ['Hearsay', 'Prior inconsistent statements'],
        impeachmentValue: 'Available for cross-examination if testimony differs',
        realValue: false
      });
    });

    return statements;
  }

  /**
   * Generate content for different types of witness statements
   */
  private static generateStatementContent(witnessType: string, context: EvidenceContext): string {
    switch (witnessType) {
      case 'eyewitness':
        return `I was at ${context.location} at approximately ${context.timeOfIncident}. I saw the defendant approach the victim. There appeared to be some kind of confrontation. I clearly saw the defendant's face under the streetlight and I am certain of my identification. The whole incident lasted about 3-4 minutes.`;
      
      case 'character':
        return `I have known the defendant for 8 years as a neighbor and friend. He has always been a peaceful person who helps elderly neighbors with groceries and volunteers at the local community center. I have never seen him act violently or aggressively toward anyone. This behavior is completely out of character for him.`;
      
      case 'expert':
        return `Based on my examination of the physical evidence and crime scene, it is my professional opinion that the pattern of injuries and evidence is consistent with the prosecution's theory of the case. The trajectory analysis and blood spatter patterns support the witness testimony regarding positioning of the parties.`;
      
      default:
        return 'Standard witness statement content.';
    }
  }

  /**
   * Generate defense evidence package
   */
  static generateDefenseEvidence(context: EvidenceContext): DetailedEvidence[] {
    return [
      {
        id: `alibi-evidence-${Date.now()}`,
        type: 'document',
        title: 'Alibi Documentation',
        description: 'Documentary evidence supporting defendant\'s whereabouts during incident',
        content: 'Receipt from Murphy\'s Bar showing defendant purchased drinks at 9:45 PM, 15 minutes before alleged incident at location 2.3 miles away. ATM security camera footage shows defendant at bank across town at 9:52 PM.',
        admissible: true,
        submittedBy: 'defense-1',
        chainOfCustody: ['Defense Investigator', 'Defense Attorney'],
        exhibit: 'Defense B',
        foundationRequired: true,
        authenticityChain: ['Business records foundation', 'Bartender testimony'],
        objectionLikely: ['Timeline disputes', 'Authentication'],
        realValue: true
      },
      {
        id: `character-evidence-${Date.now()}`,
        type: 'testimony',
        title: 'Character Witness Testimony',
        description: 'Testimony regarding defendant\'s reputation for non-violence',
        content: 'Multiple witnesses prepared to testify to defendant\'s peaceful character and reputation in the community for non-violence.',
        admissible: true,
        submittedBy: 'defense-1',
        chainOfCustody: ['Defense Attorney'],
        exhibit: 'Defense C',
        foundationRequired: true,
        authenticityChain: ['Witness testimony'],
        objectionLikely: ['Relevance', 'Character evidence limitations'],
        realValue: false
      }
    ];
  }

  /**
   * Determine if evidence requires expert testimony
   */
  static requiresExpertTestimony(evidence: DetailedEvidence): boolean {
    const expertTypes = ['dna', 'ballistics', 'fingerprints', 'autopsy', 'drugs', 'digital'];
    return expertTypes.some(type => 
      evidence.title.toLowerCase().includes(type) || 
      evidence.description.toLowerCase().includes(type)
    );
  }

  /**
   * Generate objections likely to be raised for evidence
   */
  static generateLikelyObjections(evidence: DetailedEvidence): string[] {
    const objections: string[] = [];

    // Common objections based on evidence type
    if (evidence.type === 'document') {
      objections.push('Hearsay', 'Best evidence rule', 'Authentication');
    }
    
    if (evidence.type === 'photograph') {
      objections.push('Inflammatory', 'Cumulative', 'Relevance vs. prejudice');
    }
    
    if (evidence.type === 'physical') {
      objections.push('Chain of custody', 'Authentication', 'Search and seizure');
    }
    
    if (evidence.expertWitnessRequired) {
      objections.push('Frye hearing required', 'Expert qualifications', 'Scientific reliability');
    }

    return [...new Set([...objections, ...(evidence.objectionLikely || [])])];
  }
}