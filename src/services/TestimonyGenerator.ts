import { DetailedWitness } from './WitnessFactory';
import { DetailedEvidence } from './EvidenceFactory';

export interface TestimonyExchange {
  id: string;
  questionType: 'direct' | 'cross' | 'redirect' | 'recross' | 'court';
  questioner: string; // attorney or judge name
  question: string;
  objection?: {
    type: string;
    attorney: string;
    ruling: 'sustained' | 'overruled';
    basis: string;
  };
  answer: string;
  followUp?: string[];
  impeachment?: {
    priorStatement: string;
    inconsistency: string;
  };
  exhibit?: string; // If evidence is being presented
}

export interface TestimonySequence {
  witness: DetailedWitness;
  direct: TestimonyExchange[];
  cross: TestimonyExchange[];
  redirect?: TestimonyExchange[];
  recross?: TestimonyExchange[];
  sidebar?: string[]; // Sidebar conferences during testimony
}

export class TestimonyGenerator {

  /**
   * Generate complete testimony sequence for a witness
   */
  static generateCompleteTestimony(
    witness: DetailedWitness,
    directExaminer: string,
    crossExaminer: string,
    evidenceList: DetailedEvidence[] = []
  ): TestimonySequence {
    
    const directTestimony = this.generateDirectExamination(witness, directExaminer, evidenceList);
    const crossTestimony = this.generateCrossExamination(witness, crossExaminer, directTestimony);
    
    let redirectTestimony: TestimonyExchange[] | undefined;
    let recrossTestimony: TestimonyExchange[] | undefined;

    // Generate redirect if cross-examination raised issues
    if (this.needsRedirect(crossTestimony)) {
      redirectTestimony = this.generateRedirectExamination(witness, directExaminer, crossTestimony);
    }

    // Generate recross if redirect introduced new matters
    if (redirectTestimony && this.needsRecross(redirectTestimony)) {
      recrossTestimony = this.generateRecrossExamination(witness, crossExaminer, redirectTestimony);
    }

    return {
      witness,
      direct: directTestimony,
      cross: crossTestimony,
      redirect: redirectTestimony,
      recross: recrossTestimony
    };
  }

  /**
   * Generate direct examination Q&A
   */
  private static generateDirectExamination(
    witness: DetailedWitness, 
    examiner: string,
    evidenceList: DetailedEvidence[]
  ): TestimonyExchange[] {
    const testimony: TestimonyExchange[] = [];

    // Background qualification questions
    testimony.push(...this.generateBackgroundQuestions(witness, examiner));

    // Knowledge-based questions specific to witness type
    switch (witness.witnessType) {
      case 'police':
        testimony.push(...this.generatePoliceDirectQuestions(witness, examiner));
        break;
      case 'eyewitness':
        testimony.push(...this.generateEyewitnessDirectQuestions(witness, examiner));
        break;
      case 'victim':
        testimony.push(...this.generateVictimDirectQuestions(witness, examiner));
        break;
      case 'expert':
        testimony.push(...this.generateExpertDirectQuestions(witness, examiner, evidenceList));
        break;
      case 'character':
        testimony.push(...this.generateCharacterDirectQuestions(witness, examiner));
        break;
    }

    return testimony;
  }

  /**
   * Generate background qualification questions
   */
  private static generateBackgroundQuestions(witness: DetailedWitness, examiner: string): TestimonyExchange[] {
    return [
      {
        id: `bg-${Date.now()}-1`,
        questionType: 'direct',
        questioner: examiner,
        question: `Please state your name for the record.`,
        answer: `My name is ${witness.name}.`
      },
      {
        id: `bg-${Date.now()}-2`,
        questionType: 'direct',
        questioner: examiner,
        question: `What is your occupation?`,
        answer: `I am a ${witness.background.experience}.`
      },
      {
        id: `bg-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `How long have you been in this position?`,
        answer: `I have ${witness.background.experience} in this field.`
      }
    ];
  }

  /**
   * Generate police officer direct examination
   */
  private static generatePoliceDirectQuestions(witness: DetailedWitness, examiner: string): TestimonyExchange[] {
    const testimony: TestimonyExchange[] = [];

    // Response to scene
    testimony.push({
      id: `police-${Date.now()}-1`,
      questionType: 'direct',
      questioner: examiner,
      question: `Officer ${witness.name.split(' ')[1]}, did you respond to a call on the evening in question?`,
      answer: witness.knowledge.directObservations[0] || `Yes, I responded to a 911 call at approximately 10:47 PM.`
    });

    // Scene observations
    testimony.push({
      id: `police-${Date.now()}-2`,
      questionType: 'direct',
      questioner: examiner,
      question: `What did you observe when you arrived at the scene?`,
      answer: witness.knowledge.directObservations[1] || `I observed the defendant at the scene with visible blood on his clothing, and the victim was on the ground with apparent stab wounds.`
    });

    // Spontaneous statement
    if (witness.knowledge.directObservations.some(obs => obs.includes('statement') || obs.includes('said'))) {
      testimony.push({
        id: `police-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `Did the defendant make any statements to you?`,
        answer: witness.knowledge.directObservations.find(obs => obs.includes('statement') || obs.includes('said')) || 
                `Yes, without any questioning from me, the defendant stated "I didn't mean to hurt anyone."`,
        objection: {
          type: 'Hearsay',
          attorney: 'Defense Attorney',
          ruling: 'overruled',
          basis: 'Spontaneous utterance exception to hearsay rule'
        }
      });
    }

    // Evidence recovery
    if (witness.knowledge.directObservations.some(obs => obs.includes('recovered') || obs.includes('found'))) {
      testimony.push({
        id: `police-${Date.now()}-4`,
        questionType: 'direct',
        questioner: examiner,
        question: `Did you recover any evidence from the defendant?`,
        answer: witness.knowledge.directObservations.find(obs => obs.includes('recovered') || obs.includes('knife')) ||
                `Yes, I recovered a kitchen knife from the defendant's jacket pocket.`,
        exhibit: `People's 2`
      });
    }

    return testimony;
  }

  /**
   * Generate eyewitness direct examination
   */
  private static generateEyewitnessDirectQuestions(witness: DetailedWitness, examiner: string): TestimonyExchange[] {
    return [
      {
        id: `eye-${Date.now()}-1`,
        questionType: 'direct',
        questioner: examiner,
        question: `Where were you on the evening of the incident?`,
        answer: witness.locationDuringIncident
      },
      {
        id: `eye-${Date.now()}-2`,
        questionType: 'direct',
        questioner: examiner,
        question: `What did you observe?`,
        answer: witness.knowledge.directObservations[0] || `I saw two men struggling near the dumpster in the alley.`
      },
      {
        id: `eye-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `Were you able to see the faces of the individuals involved?`,
        answer: `Yes, there was sufficient light from the streetlight, and I was approximately 40 feet away.`
      },
      {
        id: `eye-${Date.now()}-4`,
        questionType: 'direct',
        questioner: examiner,
        question: `Do you see the person who attacked the victim in the courtroom today?`,
        answer: `Yes, that's the defendant sitting at the defense table.`,
        followUp: [`Let the record reflect that the witness has identified the defendant.`]
      },
      {
        id: `eye-${Date.now()}-5`,
        questionType: 'direct',
        questioner: examiner,
        question: `What did you do after witnessing this incident?`,
        answer: witness.knowledge.directObservations.find(obs => obs.includes('911')) || `I immediately called 911 to report the attack.`
      }
    ];
  }

  /**
   * Generate victim direct examination
   */
  private static generateVictimDirectQuestions(witness: DetailedWitness, examiner: string): TestimonyExchange[] {
    return [
      {
        id: `victim-${Date.now()}-1`,
        questionType: 'direct',
        questioner: examiner,
        question: `${witness.name}, I know this is difficult, but can you tell us what happened on the night you were attacked?`,
        answer: witness.knowledge.directObservations[0] || `I was walking home from work when the defendant approached me from behind.`
      },
      {
        id: `victim-${Date.now()}-2`,
        questionType: 'direct',
        questioner: examiner,
        question: `What did the defendant do?`,
        answer: witness.knowledge.directObservations[1] || `He demanded my money and phone. When I tried to comply, he stabbed me anyway.`
      },
      {
        id: `victim-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `Had you ever seen the defendant before this incident?`,
        answer: `No, I had never seen him before in my life. This was completely unprovoked.`
      },
      {
        id: `victim-${Date.now()}-4`,
        questionType: 'direct',
        questioner: examiner,
        question: `How has this incident affected your life?`,
        answer: `I still have nightmares. I'm afraid to walk alone at night. My family has been traumatized by this attack.`,
        objection: {
          type: 'Relevance',
          attorney: 'Defense Attorney',
          ruling: 'overruled',
          basis: 'Victim impact testimony is relevant to show the nature and extent of the crime'
        }
      }
    ];
  }

  /**
   * Generate expert witness direct examination
   */
  private static generateExpertDirectQuestions(
    witness: DetailedWitness, 
    examiner: string, 
    evidenceList: DetailedEvidence[]
  ): TestimonyExchange[] {
    const testimony: TestimonyExchange[] = [];

    // Qualification questions
    if (witness.expertQualifications) {
      testimony.push({
        id: `expert-${Date.now()}-1`,
        questionType: 'direct',
        questioner: examiner,
        question: `Dr. ${witness.name.split(' ')[1]}, please describe your educational background.`,
        answer: witness.expertQualifications.slice(0, 2).join('. ') + '.'
      });

      testimony.push({
        id: `expert-${Date.now()}-2`,
        questionType: 'direct',
        questioner: examiner,
        question: `How many times have you testified as an expert witness?`,
        answer: witness.expertQualifications.find(q => q.includes('testified')) || `I have testified as an expert witness in over 150 cases.`
      });
    }

    // Opinion testimony
    if (witness.knowledge.expertKnowledge) {
      testimony.push({
        id: `expert-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `Based on your analysis of the evidence, do you have an opinion regarding the cause of death?`,
        answer: witness.knowledge.expertKnowledge[0] || `Yes, in my opinion, the cause of death was exsanguination from multiple stab wounds.`
      });

      testimony.push({
        id: `expert-${Date.now()}-4`,
        questionType: 'direct',
        questioner: examiner,
        question: `Can you explain the significance of the DNA evidence found in this case?`,
        answer: witness.knowledge.expertKnowledge[1] || `The DNA evidence provides a statistical probability of 1 in 7.8 billion that the blood on the weapon came from the victim.`
      });
    }

    return testimony;
  }

  /**
   * Generate character witness direct examination
   */
  private static generateCharacterDirectQuestions(witness: DetailedWitness, examiner: string): TestimonyExchange[] {
    return [
      {
        id: `char-${Date.now()}-1`,
        questionType: 'direct',
        questioner: examiner,
        question: `How do you know the defendant?`,
        answer: witness.knowledge.directObservations[0] || `I have known the defendant for three years through our community center.`
      },
      {
        id: `char-${Date.now()}-2`,
        questionType: 'direct',
        questioner: examiner,
        question: `Are you familiar with the defendant's reputation in the community for peacefulness?`,
        answer: `Yes, he has an excellent reputation for being peaceful and helping others.`
      },
      {
        id: `char-${Date.now()}-3`,
        questionType: 'direct',
        questioner: examiner,
        question: `In your opinion, is the defendant a peaceful person?`,
        answer: witness.knowledge.opinions[0] || `Absolutely. This behavior is completely out of character for him.`,
        objection: {
          type: 'Leading',
          attorney: 'Prosecutor',
          ruling: 'sustained',
          basis: 'Question suggests the answer'
        }
      }
    ];
  }

  /**
   * Generate cross-examination
   */
  private static generateCrossExamination(
    witness: DetailedWitness, 
    crossExaminer: string,
    directTestimony: TestimonyExchange[]
  ): TestimonyExchange[] {
    const testimony: TestimonyExchange[] = [];

    switch (witness.witnessType) {
      case 'police':
        testimony.push(...this.generatePoliceCrossExamination(witness, crossExaminer));
        break;
      case 'eyewitness':
        testimony.push(...this.generateEyewitnessCrossExamination(witness, crossExaminer));
        break;
      case 'victim':
        testimony.push(...this.generateVictimCrossExamination(witness, crossExaminer));
        break;
      case 'expert':
        testimony.push(...this.generateExpertCrossExamination(witness, crossExaminer));
        break;
      case 'character':
        testimony.push(...this.generateCharacterCrossExamination(witness, crossExaminer));
        break;
    }

    return testimony;
  }

  /**
   * Generate police officer cross-examination
   */
  private static generatePoliceCrossExamination(witness: DetailedWitness, crossExaminer: string): TestimonyExchange[] {
    const impeachmentRisks = witness.credibility.impeachmentRisks;
    const testimony: TestimonyExchange[] = [];

    // Challenge procedures
    testimony.push({
      id: `cross-police-${Date.now()}-1`,
      questionType: 'cross',
      questioner: crossExaminer,
      question: `Officer, you didn't read my client his Miranda rights until after he made that statement, correct?`,
      answer: `The statement was spontaneous. Miranda warnings are required before custodial interrogation, not for spontaneous statements.`
    });

    // Challenge bias
    testimony.push({
      id: `cross-police-${Date.now()}-2`,
      questionType: 'cross',
      questioner: crossExaminer,
      question: `You're hoping for a promotion to detective, aren't you?`,
      answer: `I do my job professionally regardless of any personal career goals.`,
      objection: {
        type: 'Relevance',
        attorney: 'Prosecutor',
        ruling: 'sustained',
        basis: 'Officer\'s career aspirations are not relevant to his observations'
      }
    });

    // Impeachment with prior inconsistent statement
    if (impeachmentRisks.some(risk => risk.includes('inconsistency'))) {
      testimony.push({
        id: `cross-police-${Date.now()}-3`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `In your initial report, you wrote that you arrived at 10:50 PM, but today you testified it was 10:47 PM. Which is correct?`,
        answer: `I arrived at approximately 10:47 PM. The report may contain a minor timing error, but the important facts remain the same.`,
        impeachment: {
          priorStatement: 'Police report states arrival at 10:50 PM',
          inconsistency: 'Testimony states 10:47 PM - 3 minute discrepancy'
        }
      });
    }

    return testimony;
  }

  /**
   * Generate eyewitness cross-examination
   */
  private static generateEyewitnessCrossExamination(witness: DetailedWitness, crossExaminer: string): TestimonyExchange[] {
    return [
      {
        id: `cross-eye-${Date.now()}-1`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `Ms. Martinez, you were carrying heavy grocery bags at the time, weren't you?`,
        answer: `Yes, I had been shopping, but I could still see what was happening clearly.`
      },
      {
        id: `cross-eye-${Date.now()}-2`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `And you need reading glasses, correct?`,
        answer: `Only for reading. My distance vision is fine.`
      },
      {
        id: `cross-eye-${Date.now()}-3`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `When you called 911, you described this as a "fight," not an "attack," didn't you?`,
        answer: `I was scared and upset. I may not have used the exact right words initially, but I saw what I saw.`,
        impeachment: {
          priorStatement: '911 call transcript shows witness said "there\'s a fight"',
          inconsistency: 'Trial testimony describes "attack" - suggests different interpretation'
        }
      },
      {
        id: `cross-eye-${Date.now()}-4`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `You were 40 feet away, it was dark, and the incident lasted only 2-3 minutes?`,
        answer: `Yes, but there was enough light from the streetlight for me to see clearly.`
      }
    ];
  }

  /**
   * Generate victim cross-examination (must be gentle due to trauma)
   */
  private static generateVictimCrossExamination(witness: DetailedWitness, crossExaminer: string): TestimonyExchange[] {
    return [
      {
        id: `cross-victim-${Date.now()}-1`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `Mr. Garcia, I understand this was a traumatic experience for you, and I'll be brief. You were in shock immediately after the incident, correct?`,
        answer: `Yes, I was in shock and losing blood.`
      },
      {
        id: `cross-victim-${Date.now()}-2`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `And the doctors gave you pain medication that affected your memory?`,
        answer: `Yes, but I remember clearly what happened during the attack.`
      },
      {
        id: `cross-victim-${Date.now()}-3`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `You told the police that everything happened very quickly, didn't you?`,
        answer: `Yes, it happened fast, but I remember the defendant stabbing me even after I gave him my wallet.`
      }
    ];
  }

  /**
   * Generate expert cross-examination
   */
  private static generateExpertCrossExamination(witness: DetailedWitness, crossExaminer: string): TestimonyExchange[] {
    return [
      {
        id: `cross-expert-${Date.now()}-1`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `Dr. Chen, you performed how many autopsies that week?`,
        answer: `I performed seven autopsies that week, which is typical for my caseload.`
      },
      {
        id: `cross-expert-${Date.now()}-2`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `And your time of death estimate could be off by up to 30 minutes in either direction?`,
        answer: `That's correct. Time of death estimation has inherent limitations based on various factors.`
      },
      {
        id: `cross-expert-${Date.now()}-3`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `Dr. Foster, you're being paid $500 per hour for your testimony today, correct?`,
        answer: `Yes, that is my standard expert witness fee, which compensates for time away from my laboratory duties.`,
        objection: {
          type: 'Argumentative',
          attorney: 'Prosecutor',
          ruling: 'overruled',
          basis: 'Bias and financial interest are proper subjects for cross-examination'
        }
      }
    ];
  }

  /**
   * Generate character witness cross-examination
   */
  private static generateCharacterCrossExamination(witness: DetailedWitness, crossExaminer: string): TestimonyExchange[] {
    return [
      {
        id: `cross-char-${Date.now()}-1`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `Father Rodriguez, you didn't witness the incident in question, did you?`,
        answer: `No, I was not present during the incident.`
      },
      {
        id: `cross-char-${Date.now()}-2`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `And you've never seen the defendant when he's been drinking alcohol, have you?`,
        answer: `Not to my knowledge, no.`
      },
      {
        id: `cross-char-${Date.now()}-3`,
        questionType: 'cross',
        questioner: crossExaminer,
        question: `As a priest, isn't it your mission to see the good in people and offer forgiveness?`,
        answer: `My mission is to speak the truth. I'm testifying because I know this defendant's character, and this behavior is not consistent with the person I know.`,
        objection: {
          type: 'Argumentative',
          attorney: 'Defense Attorney',
          ruling: 'overruled',
          basis: 'Goes to witness bias and motivation for testifying'
        }
      }
    ];
  }

  /**
   * Generate redirect examination if needed
   */
  private static generateRedirectExamination(
    witness: DetailedWitness, 
    redirectExaminer: string,
    crossTestimony: TestimonyExchange[]
  ): TestimonyExchange[] {
    // Only address matters raised on cross-examination
    const testimony: TestimonyExchange[] = [];

    // Look for areas that need clarification from cross
    const needsClarification = crossTestimony.filter(exchange => 
      exchange.impeachment || exchange.answer.includes('may') || exchange.answer.includes('possibly')
    );

    if (needsClarification.length > 0) {
      testimony.push({
        id: `redirect-${Date.now()}-1`,
        questionType: 'redirect',
        questioner: redirectExaminer,
        question: `When you mentioned that timing might be approximate, does that change your core observations of what occurred?`,
        answer: `No, the essential facts of what I observed remain the same regardless of minor timing variations.`
      });
    }

    return testimony;
  }

  /**
   * Generate recross examination if needed
   */
  private static generateRecrossExamination(
    witness: DetailedWitness,
    recrossExaminer: string, 
    redirectTestimony: TestimonyExchange[]
  ): TestimonyExchange[] {
    // Only if redirect raised new matters
    const testimony: TestimonyExchange[] = [];

    if (redirectTestimony.length > 0) {
      testimony.push({
        id: `recross-${Date.now()}-1`,
        questionType: 'recross',
        questioner: recrossExaminer,
        question: `But you just admitted that your timing could be wrong, correct?`,
        answer: `The timing estimate may have minor variations, but my observations of the incident itself are accurate.`
      });
    }

    return testimony;
  }

  /**
   * Determine if redirect examination is needed
   */
  private static needsRedirect(crossTestimony: TestimonyExchange[]): boolean {
    return crossTestimony.some(exchange => 
      exchange.impeachment !== undefined || 
      exchange.answer.includes('possibly') ||
      exchange.answer.includes('may not')
    );
  }

  /**
   * Determine if recross examination is needed
   */
  private static needsRecross(redirectTestimony: TestimonyExchange[]): boolean {
    return redirectTestimony.length > 0;
  }

  /**
   * Generate realistic objections during testimony
   */
  static generateObjectionOpportunities(question: string, questionType: string): string[] {
    const objections: string[] = [];

    // Leading question on direct
    if (questionType === 'direct' && (
      question.includes('didn\'t you') || 
      question.includes('isn\'t it true') ||
      question.includes('correct?')
    )) {
      objections.push('Leading');
    }

    // Compound question
    if (question.split(' and ').length > 2) {
      objections.push('Compound question');
    }

    // Argumentative
    if (questionType === 'cross' && (
      question.includes('you claim') ||
      question.includes('you would have us believe')
    )) {
      objections.push('Argumentative');
    }

    // Asked and answered
    if (question.includes('again') || question.includes('repeat')) {
      objections.push('Asked and answered');
    }

    return objections;
  }

  /**
   * Generate sidebar conference discussions
   */
  static generateSidebarConference(issue: string, witness: DetailedWitness): string[] {
    const sidebar: string[] = [];

    switch (issue) {
      case 'hearsay':
        sidebar.push('DEFENSE: Your Honor, this is clearly hearsay.');
        sidebar.push('PROSECUTION: It falls under the present sense impression exception.');
        sidebar.push('COURT: I\'ll allow it, but limit it to what the witness personally observed.');
        break;
      
      case 'prior_bad_acts':
        sidebar.push('PROSECUTION: Your Honor, defense is getting into prior bad acts.');
        sidebar.push('DEFENSE: This goes to bias and credibility under Rule 608.');
        sidebar.push('COURT: I\'ll allow limited inquiry into bias, but no details about specific acts.');
        break;
      
      case 'expert_reliability':
        sidebar.push('DEFENSE: We request a Frye hearing on this novel scientific technique.');
        sidebar.push('PROSECUTION: This methodology is well-established in the scientific community.');
        sidebar.push('COURT: I\'ll take judicial notice of the reliability. Proceed with the testimony.');
        break;
    }

    return sidebar;
  }
}