import { CivilClaim, CivilClaimType, RemedyType } from '../types/caseTypes';

export const civilClaims: Record<CivilClaimType, CivilClaim> = {
  // Contract disputes
  'breach-of-contract': {
    id: 'contract-breach-001',
    claimType: 'breach-of-contract',
    title: 'Breach of Contract',
    description: 'Defendant failed to perform material obligations under valid contract',
    legalTheory: 'Material breach of contract resulting in damages to plaintiff',
    elements: [
      'Valid contract existed between parties',
      'Plaintiff performed contractual obligations',
      'Defendant materially breached contract',
      'Plaintiff suffered damages as result'
    ],
    economicDamages: 50000,
    nonEconomicDamages: 0,
    punitiveDamages: 0,
    attorneyFees: 15000,
    remediesRequested: ['compensatory-damages', 'consequential-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'specific-performance': {
    id: 'specific-performance-001',
    claimType: 'specific-performance',
    title: 'Specific Performance',
    description: 'Seeking court order to compel defendant to perform unique contractual obligations',
    legalTheory: 'Monetary damages inadequate remedy for breach of unique contract',
    elements: [
      'Valid contract existed',
      'Subject matter is unique',
      'Monetary damages inadequate',
      'Plaintiff ready to perform'
    ],
    economicDamages: 0,
    nonEconomicDamages: 0,
    punitiveDamages: 0,
    attorneyFees: 25000,
    remediesRequested: ['specific-performance', 'attorneys-fees'],
    specificPerformance: 'Compel transfer of unique real property as agreed',
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false // Equitable remedy, judge decides
  },

  // Tort claims
  'negligence-personal-injury': {
    id: 'negligence-pi-001',
    claimType: 'negligence-personal-injury',
    title: 'Personal Injury - Negligence',
    description: 'Defendant\'s negligent conduct caused plaintiff\'s injuries',
    legalTheory: 'Defendant breached duty of care resulting in foreseeable injury',
    elements: [
      'Defendant owed duty of care to plaintiff',
      'Defendant breached that duty',
      'Breach was proximate cause of injury',
      'Plaintiff suffered actual damages'
    ],
    economicDamages: 150000, // Medical bills, lost wages
    nonEconomicDamages: 300000, // Pain and suffering
    punitiveDamages: 0,
    attorneyFees: 50000,
    remediesRequested: ['compensatory-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'negligence-professional': {
    id: 'negligence-prof-001',
    claimType: 'negligence-professional',
    title: 'Professional Malpractice',
    description: 'Professional failed to meet standard of care in their field',
    legalTheory: 'Breach of professional standard of care causing client harm',
    elements: [
      'Professional relationship existed',
      'Professional standard of care',
      'Breach of that standard',
      'Causation and damages'
    ],
    economicDamages: 100000,
    nonEconomicDamages: 50000,
    punitiveDamages: 0,
    attorneyFees: 75000,
    remediesRequested: ['compensatory-damages', 'consequential-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'negligence-product-liability': {
    id: 'product-liability-001',
    claimType: 'negligence-product-liability',
    title: 'Product Liability',
    description: 'Defective product caused injury to consumer',
    legalTheory: 'Strict liability for defective product causing harm',
    elements: [
      'Product was defective',
      'Defect existed when product left defendant\'s control',
      'Product was used as intended',
      'Defect caused plaintiff\'s injury'
    ],
    economicDamages: 200000,
    nonEconomicDamages: 400000,
    punitiveDamages: 100000, // If willful misconduct
    attorneyFees: 80000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'attorneys-fees'],
    jurisdiction: 'federal',
    classAction: true,
    jurySuitability: true
  },

  'intentional-tort-assault': {
    id: 'intentional-assault-001',
    claimType: 'intentional-tort-assault',
    title: 'Intentional Assault and Battery',
    description: 'Defendant intentionally caused harmful or offensive contact',
    legalTheory: 'Intentional tort causing physical and emotional harm',
    elements: [
      'Intent to cause harmful/offensive contact',
      'Harmful/offensive contact occurred',
      'No consent to contact',
      'Resulting damages'
    ],
    economicDamages: 75000,
    nonEconomicDamages: 150000,
    punitiveDamages: 50000,
    attorneyFees: 40000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'intentional-tort-defamation': {
    id: 'defamation-001',
    claimType: 'intentional-tort-defamation',
    title: 'Defamation of Character',
    description: 'False statements damaging plaintiff\'s reputation',
    legalTheory: 'Publication of false statements harming reputation and standing',
    elements: [
      'False statement of fact',
      'Publication to third party',
      'Damage to reputation',
      'Negligence or malice in publication'
    ],
    economicDamages: 25000, // Lost business
    nonEconomicDamages: 100000, // Reputation damage
    punitiveDamages: 25000,
    attorneyFees: 30000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief', 'attorneys-fees'],
    injunctiveRelief: 'Order defendant to retract false statements',
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  // Property disputes
  'real-estate-dispute': {
    id: 'real-estate-001',
    claimType: 'real-estate-dispute',
    title: 'Real Estate Boundary Dispute',
    description: 'Dispute over property boundaries and encroachment',
    legalTheory: 'Defendant encroaching on plaintiff\'s property rights',
    elements: [
      'Plaintiff owns property',
      'Defined boundary lines',
      'Defendant encroaching beyond boundaries',
      'Interference with property rights'
    ],
    economicDamages: 40000,
    nonEconomicDamages: 10000,
    punitiveDamages: 0,
    attorneyFees: 20000,
    remediesRequested: ['compensatory-damages', 'injunctive-relief', 'quiet-title', 'attorneys-fees'],
    injunctiveRelief: 'Remove encroaching structures and cease trespass',
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'landlord-tenant': {
    id: 'landlord-tenant-001',
    claimType: 'landlord-tenant',
    title: 'Landlord-Tenant Dispute',
    description: 'Breach of lease terms and habitability issues',
    legalTheory: 'Landlord breach of warranty of habitability',
    elements: [
      'Valid lease agreement',
      'Landlord duty to maintain habitability',
      'Breach of habitability warranty',
      'Tenant damages and losses'
    ],
    economicDamages: 15000, // Moving costs, alternative housing
    nonEconomicDamages: 5000, // Inconvenience
    punitiveDamages: 0,
    attorneyFees: 8000,
    remediesRequested: ['compensatory-damages', 'restitution', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  // Employment disputes
  'wrongful-termination': {
    id: 'wrongful-term-001',
    claimType: 'wrongful-termination',
    title: 'Wrongful Termination',
    description: 'Termination in violation of employment law or public policy',
    legalTheory: 'Termination violated implied contract or public policy',
    elements: [
      'Employment relationship existed',
      'Termination occurred',
      'Termination violated law or public policy',
      'Resulting damages'
    ],
    economicDamages: 200000, // Lost wages and benefits
    nonEconomicDamages: 50000, // Emotional distress
    punitiveDamages: 75000,
    attorneyFees: 60000,
    remediesRequested: ['compensatory-damages', 'consequential-damages', 'punitive-damages', 'attorneys-fees'],
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: true
  },

  'discrimination-employment': {
    id: 'employment-discrim-001',
    claimType: 'discrimination-employment',
    title: 'Employment Discrimination',
    description: 'Discrimination based on protected class characteristics',
    legalTheory: 'Disparate treatment based on protected class membership',
    elements: [
      'Plaintiff is member of protected class',
      'Adverse employment action',
      'Similarly situated non-members treated better',
      'Discriminatory intent'
    ],
    economicDamages: 150000,
    nonEconomicDamages: 100000,
    punitiveDamages: 100000,
    attorneyFees: 75000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief', 'attorneys-fees'],
    injunctiveRelief: 'Implement anti-discrimination policies and training',
    jurisdiction: 'federal',
    classAction: true,
    jurySuitability: true
  },

  // Business disputes
  'partnership-dispute': {
    id: 'partnership-001',
    claimType: 'partnership-dispute',
    title: 'Partnership Dissolution',
    description: 'Dispute over partnership assets and management',
    legalTheory: 'Breach of fiduciary duty and partnership agreement',
    elements: [
      'Valid partnership existed',
      'Fiduciary duty owed',
      'Breach of duty or agreement',
      'Damages to partnership/partner'
    ],
    economicDamages: 300000,
    nonEconomicDamages: 0,
    punitiveDamages: 50000,
    attorneyFees: 100000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'restitution', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false // Often decided by judge due to complexity
  },

  'intellectual-property': {
    id: 'ip-001',
    claimType: 'intellectual-property',
    title: 'Intellectual Property Infringement',
    description: 'Unauthorized use of protected intellectual property',
    legalTheory: 'Willful infringement of valid intellectual property rights',
    elements: [
      'Valid intellectual property rights',
      'Defendant used protected property',
      'Use was without authorization',
      'Commercial harm resulted'
    ],
    economicDamages: 500000, // Lost profits
    nonEconomicDamages: 0,
    punitiveDamages: 250000, // Willful infringement
    attorneyFees: 150000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief', 'attorneys-fees'],
    injunctiveRelief: 'Cease all use of infringing materials',
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: true
  },

  // Placeholder entries for remaining claim types
  'contract-interpretation': {
    id: 'contract-interp-001',
    claimType: 'contract-interpretation',
    title: 'Contract Interpretation Dispute',
    description: 'Disagreement over meaning of contract terms',
    legalTheory: 'Proper interpretation of ambiguous contract language',
    elements: ['Valid contract', 'Ambiguous terms', 'Competing interpretations', 'Need for clarification'],
    economicDamages: 75000,
    attorneyFees: 25000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'intentional-tort-privacy': {
    id: 'privacy-001',
    claimType: 'intentional-tort-privacy',
    title: 'Invasion of Privacy',
    description: 'Unauthorized intrusion into private affairs',
    legalTheory: 'Unreasonable invasion of privacy causing harm',
    elements: ['Private matter', 'Unreasonable intrusion', 'Highly offensive to reasonable person', 'Damages'],
    economicDamages: 10000,
    nonEconomicDamages: 50000,
    punitiveDamages: 25000,
    attorneyFees: 20000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'property-damage': {
    id: 'property-damage-001',
    claimType: 'property-damage',
    title: 'Property Damage',
    description: 'Negligent or intentional damage to personal property',
    legalTheory: 'Defendant caused damage to plaintiff\'s property',
    elements: ['Plaintiff owned property', 'Defendant caused damage', 'Damage was substantial', 'Resulting loss'],
    economicDamages: 30000,
    attorneyFees: 10000,
    remediesRequested: ['compensatory-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'quiet-title': {
    id: 'quiet-title-001',
    claimType: 'quiet-title',
    title: 'Quiet Title Action',
    description: 'Establish clear ownership of real property',
    legalTheory: 'Plaintiff has superior title to disputed property',
    elements: ['Plaintiff claims ownership', 'Cloud on title exists', 'Superior right to title', 'Need for clarity'],
    economicDamages: 0,
    attorneyFees: 15000,
    remediesRequested: ['quiet-title', 'declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'easement-dispute': {
    id: 'easement-001',
    claimType: 'easement-dispute',
    title: 'Easement Rights Dispute',
    description: 'Dispute over easement rights and usage',
    legalTheory: 'Interference with established easement rights',
    elements: ['Valid easement exists', 'Right to use easement', 'Interference with use', 'Resulting damages'],
    economicDamages: 20000,
    attorneyFees: 12000,
    remediesRequested: ['compensatory-damages', 'injunctive-relief', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: true
  },

  'corporate-dissolution': {
    id: 'corp-dissolution-001',
    claimType: 'corporate-dissolution',
    title: 'Corporate Dissolution',
    description: 'Forced dissolution of corporation due to misconduct',
    legalTheory: 'Oppressive conduct justifying involuntary dissolution',
    elements: ['Valid corporation', 'Oppressive conduct', 'Minority shareholder rights violated', 'No adequate remedy'],
    economicDamages: 1000000,
    attorneyFees: 200000,
    remediesRequested: ['restitution', 'injunctive-relief', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'trade-secrets': {
    id: 'trade-secrets-001',
    claimType: 'trade-secrets',
    title: 'Trade Secrets Misappropriation',
    description: 'Unauthorized use of confidential business information',
    legalTheory: 'Misappropriation of protected trade secrets',
    elements: ['Information constitutes trade secret', 'Reasonable efforts to maintain secrecy', 'Improper acquisition/use', 'Economic harm'],
    economicDamages: 750000,
    punitiveDamages: 375000,
    attorneyFees: 150000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief'],
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: true
  },

  'non-compete-agreement': {
    id: 'non-compete-001',
    claimType: 'non-compete-agreement',
    title: 'Non-Compete Violation',
    description: 'Breach of non-compete agreement',
    legalTheory: 'Violation of valid and enforceable non-compete clause',
    elements: ['Valid non-compete agreement', 'Reasonable restrictions', 'Breach of agreement', 'Competitive harm'],
    economicDamages: 200000,
    attorneyFees: 75000,
    remediesRequested: ['compensatory-damages', 'injunctive-relief', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'wage-and-hour': {
    id: 'wage-hour-001',
    claimType: 'wage-and-hour',
    title: 'Wage and Hour Violations',
    description: 'Unpaid overtime and minimum wage violations',
    legalTheory: 'Violation of Fair Labor Standards Act',
    elements: ['Employment relationship', 'Covered under FLSA', 'Unpaid wages/overtime', 'Willful violation'],
    economicDamages: 100000,
    punitiveDamages: 100000,
    attorneyFees: 50000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'attorneys-fees'],
    jurisdiction: 'federal',
    classAction: true,
    jurySuitability: true
  },

  'harassment-workplace': {
    id: 'harassment-001',
    claimType: 'harassment-workplace',
    title: 'Workplace Harassment',
    description: 'Hostile work environment based on protected characteristics',
    legalTheory: 'Severe and pervasive harassment creating hostile environment',
    elements: ['Protected class membership', 'Severe/pervasive conduct', 'Based on protected characteristic', 'Employer liability'],
    economicDamages: 125000,
    nonEconomicDamages: 175000,
    punitiveDamages: 150000,
    attorneyFees: 75000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief'],
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: true
  },

  'divorce-contested': {
    id: 'divorce-001',
    claimType: 'divorce-contested',
    title: 'Contested Divorce',
    description: 'Dissolution of marriage with disputed issues',
    legalTheory: 'Irreconcilable differences requiring court intervention',
    elements: ['Valid marriage', 'Irreconcilable differences', 'Disputed property/custody', 'Best interests of children'],
    economicDamages: 0,
    attorneyFees: 50000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'child-custody': {
    id: 'custody-001',
    claimType: 'child-custody',
    title: 'Child Custody Modification',
    description: 'Request to modify existing custody arrangement',
    legalTheory: 'Changed circumstances warranting custody modification',
    elements: ['Existing custody order', 'Material change in circumstances', 'Best interests of child', 'Need for modification'],
    economicDamages: 0,
    attorneyFees: 25000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'child-support': {
    id: 'support-001',
    claimType: 'child-support',
    title: 'Child Support Enforcement',
    description: 'Collection of unpaid child support',
    legalTheory: 'Willful non-payment of court-ordered support',
    elements: ['Valid support order', 'Obligation to pay', 'Non-payment', 'Ability to pay'],
    economicDamages: 50000,
    attorneyFees: 15000,
    remediesRequested: ['compensatory-damages', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'adoption': {
    id: 'adoption-001',
    claimType: 'adoption',
    title: 'Adoption Proceeding',
    description: 'Legal adoption of minor child',
    legalTheory: 'Adoption in best interests of child',
    elements: ['Petitioner qualification', 'Child availability', 'Consent/termination', 'Best interests'],
    economicDamages: 0,
    attorneyFees: 15000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'domestic-relations': {
    id: 'domestic-001',
    claimType: 'domestic-relations',
    title: 'Domestic Relations Matter',
    description: 'Family law dispute requiring court resolution',
    legalTheory: 'Court intervention needed for family dispute',
    elements: ['Family relationship', 'Legal dispute', 'Need for resolution', 'Best interests factors'],
    economicDamages: 0,
    attorneyFees: 20000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'state',
    classAction: false,
    jurySuitability: false
  },

  'civil-rights-violation': {
    id: 'civil-rights-001',
    claimType: 'civil-rights-violation',
    title: 'Civil Rights Violation',
    description: 'Violation of constitutional rights under color of law',
    legalTheory: 'Section 1983 civil rights violation',
    elements: ['Constitutional right', 'Violation under color of law', 'State actor involvement', 'Resulting harm'],
    economicDamages: 100000,
    nonEconomicDamages: 200000,
    punitiveDamages: 150000,
    attorneyFees: 100000,
    remediesRequested: ['compensatory-damages', 'punitive-damages', 'injunctive-relief'],
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: true
  },

  'constitutional-challenge': {
    id: 'constitutional-001',
    claimType: 'constitutional-challenge',
    title: 'Constitutional Challenge',
    description: 'Challenge to constitutionality of law or government action',
    legalTheory: 'Government action violates constitutional provisions',
    elements: ['Government action', 'Constitutional violation', 'Standing to challenge', 'Irreparable harm'],
    economicDamages: 0,
    attorneyFees: 200000,
    remediesRequested: ['declaratory-judgment', 'injunctive-relief', 'attorneys-fees'],
    jurisdiction: 'federal',
    classAction: true,
    jurySuitability: false
  },

  'administrative-appeal': {
    id: 'admin-appeal-001',
    claimType: 'administrative-appeal',
    title: 'Administrative Agency Appeal',
    description: 'Appeal of administrative agency decision',
    legalTheory: 'Agency action was arbitrary, capricious, or contrary to law',
    elements: ['Final agency action', 'Exhaustion of remedies', 'Legal error or abuse of discretion', 'Harm from decision'],
    economicDamages: 75000,
    attorneyFees: 50000,
    remediesRequested: ['declaratory-judgment', 'attorneys-fees'],
    jurisdiction: 'federal',
    classAction: false,
    jurySuitability: false
  }
};

// Helper functions
export const getClaimsByType = (jurisdiction: 'federal' | 'state' | 'local'): CivilClaim[] => {
  return Object.values(civilClaims).filter(claim => claim.jurisdiction === jurisdiction);
};

export const getCommonClaims = (): CivilClaim[] => {
  return [
    civilClaims['breach-of-contract'],
    civilClaims['negligence-personal-injury'],
    civilClaims['real-estate-dispute'],
    civilClaims['wrongful-termination'],
    civilClaims['landlord-tenant']
  ];
};

export const generateClaimsFromFacts = (facts: string[]): CivilClaim[] => {
  const claims: CivilClaim[] = [];
  const factText = facts.join(' ').toLowerCase();
  
  // Contract-related
  if (factText.includes('contract') || factText.includes('agreement') || factText.includes('breach')) {
    claims.push(civilClaims['breach-of-contract']);
  }
  
  // Injury-related
  if (factText.includes('injury') || factText.includes('negligence') || factText.includes('accident')) {
    claims.push(civilClaims['negligence-personal-injury']);
  }
  
  // Employment-related
  if (factText.includes('fired') || factText.includes('termination') || factText.includes('employment')) {
    claims.push(civilClaims['wrongful-termination']);
  }
  
  // Property-related
  if (factText.includes('property') || factText.includes('landlord') || factText.includes('tenant') || factText.includes('real estate')) {
    if (factText.includes('rent') || factText.includes('lease')) {
      claims.push(civilClaims['landlord-tenant']);
    } else {
      claims.push(civilClaims['real-estate-dispute']);
    }
  }
  
  // Default to breach of contract if no specific claims identified
  if (claims.length === 0) {
    claims.push(civilClaims['breach-of-contract']);
  }
  
  return claims;
};