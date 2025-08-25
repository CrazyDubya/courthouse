/**
 * New York State Pattern Jury Instructions (PJI)
 * Criminal and Civil jury instructions based on NY Pattern Jury Instructions
 */

export interface JuryInstruction {
  id: string;
  title: string;
  type: 'criminal' | 'civil';
  category: 'preliminary' | 'substantive' | 'burden' | 'deliberation' | 'verdict';
  applicableCharges?: string[];
  instruction: string;
  variations?: {
    condition: string;
    text: string;
  }[];
  legalCitations: string[];
}

// New York Pattern Jury Instructions - Criminal
export const nysCriminalInstructions: Record<string, JuryInstruction> = {
  'burden-beyond-reasonable-doubt': {
    id: 'burden-beyond-reasonable-doubt',
    title: 'Burden of Proof - Beyond a Reasonable Doubt',
    type: 'criminal',
    category: 'burden',
    instruction: `The defendant is presumed innocent. This presumption continues throughout the trial and is not overcome unless from all the evidence in the case you are convinced beyond a reasonable doubt that the defendant is guilty.

The burden is always on the People to prove beyond a reasonable doubt every material element of the crime charged and that the defendant is the person who committed that crime.

The defendant is not required to prove innocence. Indeed, the defendant is not required to prove or disprove anything.

A reasonable doubt is a doubt based on reason and common sense and not a doubt based on speculation. It is the kind of doubt that would cause a reasonable person to hesitate to act in a matter of importance. 

If after a careful and impartial consideration of all the evidence, you are convinced beyond a reasonable doubt of the defendant's guilt, you must find the defendant guilty. If you are not convinced beyond a reasonable doubt, you must find the defendant not guilty.`,
    legalCitations: ['CJI2d[NY] Burden of Proof', 'People v. Antommarchi, 80 N.Y.2d 247 (1992)']
  },

  'presumption-innocence': {
    id: 'presumption-innocence',
    title: 'Presumption of Innocence',
    type: 'criminal',
    category: 'preliminary',
    instruction: `Under our law, a defendant in a criminal case is presumed to be innocent. This presumption continues throughout the entire trial unless until such time as the jury is convinced beyond a reasonable doubt that the defendant is guilty.

This means that the defendant begins the trial with a clean slate with no evidence against him or her. The presumption is not just a formality. It is a substantive part of our criminal law.

The defendant has no burden or obligation to present any evidence or to prove anything. The defendant does not even have to cross-examine witnesses or make any statement.

The presumption of innocence alone may be sufficient to raise a reasonable doubt and require a verdict of not guilty.`,
    legalCitations: ['CJI2d[NY] Presumption of Innocence']
  },

  'credibility-witnesses': {
    id: 'credibility-witnesses',
    title: 'Credibility of Witnesses',
    type: 'criminal',
    category: 'substantive',
    instruction: `In deciding the facts in this case, you must decide which testimony to believe and which testimony not to believe. You may believe everything a witness says, or part of it, or none of it.

In deciding whether testimony is truthful and accurate, use your common sense and experience. Consider the witness's opportunity to see or hear the things about which the witness testified, the witness's ability to remember and describe what happened, and the witness's behavior while testifying.

Consider whether the witness has any relationship to the prosecution or defense, whether the witness has any interest in how this case is decided, and whether the witness has any motive to lie.

Consider whether the witness made any prior statements that are consistent or inconsistent with his or her testimony here in court.

If you decide that a witness has lied about any material fact, you may disregard all of that witness's testimony, or you may disregard only the part that you find to be false and accept the rest.`,
    legalCitations: ['CJI2d[NY] Credibility of Witnesses']
  },

  'assault-second-degree': {
    id: 'assault-second-degree',
    title: 'Assault in the Second Degree',
    type: 'criminal',
    category: 'substantive',
    applicableCharges: ['assault-second'],
    instruction: `Under our law, a person is guilty of Assault in the Second Degree when he or she, with intent to cause serious physical injury to another person, causes such injury to such person or to a third person.

The following terms used in that definition have a special meaning:

INTENT means conscious objective or purpose. Thus, a person acts with intent to cause serious physical injury to another when that person's conscious objective or purpose is to cause serious physical injury to another.

SERIOUS PHYSICAL INJURY means physical injury which creates a substantial risk of death, or which causes death or serious and protracted disfigurement, protracted impairment of health or protracted loss or impairment of the function of any bodily organ.

In order for you to find the defendant guilty of this crime, the People are required to prove, from all the evidence in the case, beyond a reasonable doubt, each of the following elements:

1. That on or about [date], in the county of [county], the defendant, [defendant's name], caused serious physical injury to [victim's name]; and

2. That the defendant did so with the intent to cause serious physical injury to [victim's name].

If you find the People have proven beyond a reasonable doubt each of those elements, you must find the defendant guilty of this crime.

If you find the People have not proven beyond a reasonable doubt any one or more of those elements, you must find the defendant not guilty of this crime.`,
    legalCitations: ['Penal Law § 120.05', 'CJI2d[NY] Assault Second Degree']
  },

  'robbery-first-degree': {
    id: 'robbery-first-degree',
    title: 'Robbery in the First Degree',
    type: 'criminal',
    category: 'substantive',
    applicableCharges: ['robbery-first'],
    instruction: `Under our law, a person is guilty of Robbery in the First Degree when he or she forcibly steals property and when, in the course of the commission of the crime or of immediate flight therefrom, he or she:

[Choose applicable subsection]

1. Causes serious physical injury to any person who is not a participant in the crime; or

2. Is armed with a deadly weapon; or  

3. Uses or threatens the immediate use of a dangerous instrument; or

4. Displays what appears to be a pistol, revolver, rifle, shotgun, machine gun or other firearm.

The following terms used in that definition have a special meaning:

FORCIBLY STEALS means to commit larceny by using or threatening the immediate use of physical force upon another person for the purpose of preventing or overcoming resistance to the taking of the property or to the retention thereof immediately after the taking, or compelling the owner or other person to deliver up the property or to engage in other conduct which aids in the commission of the larceny.

DEADLY WEAPON means any loaded weapon from which a shot, readily capable of producing death or other serious physical injury, may be discharged, or a switchblade knife, gravity knife, pilum ballistic knife, metal knuckle knife, dagger, billy, blackjack, plastic knuckles, or metal knuckles.

DANGEROUS INSTRUMENT means any instrument, article or substance, including a "vehicle," which, under the circumstances in which it is used, attempted to be used or threatened to be used, is readily capable of causing death or other serious physical injury.

In order for you to find the defendant guilty of this crime, the People are required to prove, from all the evidence in the case, beyond a reasonable doubt, each of the following elements:

1. That on or about [date], in the county of [county], the defendant, [defendant's name], forcibly stole property; and

2. That in the course of the commission of that crime or immediate flight therefrom, the defendant [insert applicable element from subsections above].

If you find the People have proven beyond a reasonable doubt each of those elements, you must find the defendant guilty of this crime.

If you find the People have not proven beyond a reasonable doubt any one or more of those elements, you must find the defendant not guilty of this crime.`,
    legalCitations: ['Penal Law § 160.15', 'CJI2d[NY] Robbery First Degree']
  },

  'deliberation-process': {
    id: 'deliberation-process',
    title: 'Deliberation Process',
    type: 'criminal',
    category: 'deliberation',
    instruction: `You will now retire to deliberate. Your deliberations must be conducted in private. No one other than the twelve of you may be present while you are deliberating.

Select one of your members to act as foreperson. The foreperson should see to it that your discussions are orderly and that everyone has a fair chance to be heard.

You should discuss the case fully. Listen carefully to each other's views and keep an open mind about what others have to say. Try to reason together toward a unanimous agreement.

However, do not give up your honest convictions just to agree with others or just to reach a verdict. Each of you must decide this case for yourself, but only after full consideration of the evidence with your fellow jurors.

Take as much time as you need. There is no rush to reach a verdict.

During your deliberations, you may ask to have testimony read back to you. You may also ask to see exhibits that have been admitted into evidence. Send a note to me through the court officer if you have such a request.

If you have a question about the law, send me a note. However, please do not tell me how you are voting or ask me what you should do.`,
    legalCitations: ['CJI2d[NY] Deliberation Process']
  }
};

// New York Pattern Jury Instructions - Civil
export const nysCivilInstructions: Record<string, JuryInstruction> = {
  'burden-preponderance': {
    id: 'burden-preponderance',
    title: 'Burden of Proof - Preponderance of the Evidence',
    type: 'civil',
    category: 'burden',
    instruction: `In this civil case, the plaintiff has the burden of proving the claim by a preponderance of the evidence. This means that the plaintiff must prove that it is more likely than not that the claim is true.

A preponderance of the evidence means the greater weight of credible evidence. It refers to evidence that is more convincing than the evidence offered in opposition to it.

In determining whether any fact has been proved by a preponderance of the evidence, you may consider the credibility of the witnesses, the reasonableness or unreasonableness of the evidence, and all of the other evidence in the case.

If the evidence on a particular issue appears to you to be equally balanced, then you must find that the party having the burden of proof on that issue has failed to establish it by a preponderance of the evidence.

The burden is on the plaintiff throughout the entire case. The defendant is not required to prove anything unless specifically instructed otherwise.`,
    legalCitations: ['PJI 1:15 Burden of Proof - Preponderance']
  },

  'negligence-elements': {
    id: 'negligence-elements',
    title: 'Negligence - Elements',
    type: 'civil',
    category: 'substantive',
    instruction: `The plaintiff claims that the defendant was negligent. To establish this claim, the plaintiff must prove by a preponderance of the evidence each of the following:

1. That the defendant owed a duty of care to the plaintiff;

2. That the defendant breached that duty by failing to use reasonable care;

3. That the defendant's breach of duty was a substantial cause of the plaintiff's injury; and

4. That the plaintiff suffered damages.

DUTY OF CARE means the obligation to use that degree of care that a reasonably prudent person would use under the same or similar circumstances.

REASONABLE CARE means that degree of care that a reasonably prudent person would use under the same or similar circumstances.

SUBSTANTIAL CAUSE means that the defendant's conduct was a substantial factor in bringing about the injury. There may be more than one substantial cause of an injury.

If you find that the plaintiff has proved each of these elements by a preponderance of the evidence, then you must find for the plaintiff. If the plaintiff has failed to prove any one of these elements by a preponderance of the evidence, then you must find for the defendant.`,
    legalCitations: ['PJI 2:10 Negligence', 'Palsgraf v. Long Island Railroad Co., 248 N.Y. 339 (1928)']
  },

  'comparative-negligence': {
    id: 'comparative-negligence',
    title: 'Comparative Negligence',
    type: 'civil',
    category: 'substantive',
    instruction: `Under New York law, if you find that both the plaintiff and defendant were negligent, you must determine the percentage of fault attributable to each.

Even if you find that the plaintiff was also negligent, the plaintiff may still recover damages, but those damages will be reduced by the percentage of fault you attribute to the plaintiff.

For example, if you find that the total damages are $100,000, but that the plaintiff was 30% at fault, then the plaintiff would recover $70,000 (that is, $100,000 reduced by 30%).

You should consider all the evidence regarding the conduct of both parties and determine what percentage of the total fault should be attributed to each party. The percentages of fault attributed to all parties must total 100%.

If you find that the plaintiff was more than 50% at fault, then the plaintiff cannot recover any damages.`,
    legalCitations: ['CPLR § 1411', 'PJI 2:26 Comparative Negligence']
  },

  'breach-contract-elements': {
    id: 'breach-contract-elements',
    title: 'Breach of Contract - Elements',
    type: 'civil',
    category: 'substantive',
    instruction: `The plaintiff claims that the defendant breached a contract. To establish this claim, the plaintiff must prove by a preponderance of the evidence each of the following:

1. That a contract existed between the plaintiff and defendant;

2. That the plaintiff performed under the contract or was excused from performance;

3. That the defendant failed to perform under the contract; and

4. That the plaintiff was damaged as a result of defendant's failure to perform.

A CONTRACT is an agreement between parties that creates obligations that are enforceable by law. To form a contract, there must be an offer, acceptance of that offer, and consideration (something of value exchanged between the parties).

BREACH means the failure to perform any duty or obligation specified in the contract.

DAMAGES in a breach of contract case are intended to put the plaintiff in the position he or she would have been in if the contract had been performed as promised.

If you find that the plaintiff has proved each of these elements by a preponderance of the evidence, then you must find for the plaintiff on the breach of contract claim. If the plaintiff has failed to prove any one of these elements by a preponderance of the evidence, then you must find for the defendant on this claim.`,
    legalCitations: ['PJI 4:10 Breach of Contract']
  },

  'damages-personal-injury': {
    id: 'damages-personal-injury',
    title: 'Damages in Personal Injury Cases',
    type: 'civil',
    category: 'substantive',
    instruction: `If you find for the plaintiff, you must determine the amount of money that will fairly and reasonably compensate the plaintiff for the injuries and damages that you find were caused by the defendant's negligence.

The damages you may consider are:

1. PAST MEDICAL EXPENSES: The reasonable cost of medical care, treatment, and services received by the plaintiff from the time of injury to the present.

2. FUTURE MEDICAL EXPENSES: The reasonable cost of medical care, treatment, and services that the plaintiff is likely to require in the future as a result of the injury.

3. PAST LOST EARNINGS: The earnings that the plaintiff lost from the time of injury to the present because of inability to work.

4. FUTURE LOST EARNINGS: The earnings that the plaintiff is likely to lose in the future because of the injury and its effects.

5. PAIN AND SUFFERING: Compensation for the physical pain, mental anguish, and suffering that the plaintiff has experienced and is likely to experience in the future as a result of the injury.

In determining pain and suffering, you may consider the nature and extent of the injury, the duration of pain and suffering (both past and future), and the impact on the plaintiff's daily life and activities.

You should not award damages for pain and suffering that existed before the occurrence in question or that resulted from causes unrelated to defendant's conduct.

There is no exact formula for calculating pain and suffering. You must use your judgment based on the evidence and your common sense and experience.`,
    legalCitations: ['PJI 2:280 Damages - Personal Injury']
  },

  'credibility-civil': {
    id: 'credibility-civil',
    title: 'Credibility of Witnesses (Civil)',
    type: 'civil',
    category: 'substantive',
    instruction: `You are the sole judges of the credibility of the witnesses and the weight to be given to their testimony. In evaluating the testimony of each witness, you may consider:

1. The witness's opportunity and ability to see, hear, know or remember the facts about which the witness testified;

2. The witness's interest, if any, in the outcome of the case;

3. The witness's bias, prejudice or hostility, if any;

4. The witness's age, experience and mental capacity;

5. The witness's manner while testifying;

6. The reasonableness of the witness's testimony in light of all the evidence; and

7. Any other factors that bear on believability.

You may believe all, part, or none of any witness's testimony. If you decide that a witness has testified falsely about any important matter, you may disregard all of that witness's testimony, or you may disregard the false testimony and accept the rest.

You should use your common sense, knowledge, and experience in weighing the testimony and deciding what happened.`,
    legalCitations: ['PJI 1:11 Credibility of Witnesses']
  },

  'verdict-civil': {
    id: 'verdict-civil',
    title: 'Verdict in Civil Cases',
    type: 'civil',
    category: 'verdict',
    instruction: `Your verdict must be based solely on the evidence presented during this trial and the law as I have instructed you.

In this civil case, your verdict need not be unanimous. A verdict agreed to by at least five-sixths of you (that is, at least 5 of the 6 jurors) is sufficient.

However, the same jurors must agree on each part of the verdict. You cannot have some jurors agree on one part and different jurors agree on another part.

When you have reached a verdict, your foreperson should fill out the verdict form and sign and date it. The foreperson should then notify the court officer that you have reached a verdict.

Remember that there are no winners or losers in the search for justice. Your role is to determine the facts and apply the law as I have instructed you, regardless of the consequences.`,
    legalCitations: ['CPLR § 4113', 'PJI 1:27 Verdict']
  }
};

/**
 * Get applicable jury instructions for case type and charges
 */
export function getApplicableJuryInstructions(
  caseType: 'criminal' | 'civil',
  charges?: string[],
  includeStandard: boolean = true
): JuryInstruction[] {
  const instructions: JuryInstruction[] = [];
  const source = caseType === 'criminal' ? nysCriminalInstructions : nysCivilInstructions;

  // Always include standard instructions
  if (includeStandard) {
    // Add burden of proof instruction
    if (caseType === 'criminal') {
      instructions.push(source['burden-beyond-reasonable-doubt']);
      instructions.push(source['presumption-innocence']);
    } else {
      instructions.push(source['burden-preponderance']);
    }

    // Add credibility instruction
    instructions.push(source[caseType === 'criminal' ? 'credibility-witnesses' : 'credibility-civil']);
  }

  // Add charge-specific instructions
  if (charges && charges.length > 0) {
    Object.values(source).forEach(instruction => {
      if (instruction.applicableCharges) {
        const hasMatchingCharge = instruction.applicableCharges.some(charge =>
          charges.some(c => c.includes(charge) || charge.includes(c))
        );
        if (hasMatchingCharge) {
          instructions.push(instruction);
        }
      }
    });
  }

  // Add procedural instructions
  if (caseType === 'criminal') {
    instructions.push(source['deliberation-process']);
  } else {
    instructions.push(source['verdict-civil']);
  }

  return instructions;
}

/**
 * Generate jury instruction for specific legal element
 */
export function generateElementInstruction(
  element: string,
  caseType: 'criminal' | 'civil'
): string {
  const commonElements: Record<string, string> = {
    'intent': `INTENT means conscious objective or purpose. A person acts with intent when that person's conscious objective or purpose is to accomplish a particular result.`,
    
    'knowledge': `A person acts knowingly when that person is aware of the nature of his or her conduct or that circumstances exist.`,
    
    'recklessness': `A person acts recklessly when he or she is aware of and consciously disregards a substantial and unjustifiable risk.`,
    
    'negligence': `Negligence is the failure to use reasonable care. Reasonable care is that degree of care that a reasonably prudent person would use under the same or similar circumstances.`,
    
    'causation': `Causation means that the defendant's conduct was a substantial factor in bringing about the harm. There may be more than one cause of an event.`,
    
    'damages': caseType === 'criminal' 
      ? `The People must prove that actual harm or injury resulted from the defendant's conduct.`
      : `Damages are the amount of money that will fairly and reasonably compensate for the harm suffered.`
  };

  return commonElements[element.toLowerCase()] || `The element of ${element} must be proven based on the evidence presented.`;
}

/**
 * Get instruction variations based on case circumstances
 */
export function getInstructionVariations(
  instructionId: string,
  circumstances: string[]
): JuryInstruction | null {
  const criminal = nysCriminalInstructions[instructionId];
  const civil = nysCivilInstructions[instructionId];
  const instruction = criminal || civil;

  if (!instruction || !instruction.variations) {
    return instruction || null;
  }

  // Find applicable variation
  const applicableVariation = instruction.variations.find(variation =>
    circumstances.some(circumstance => 
      variation.condition.toLowerCase().includes(circumstance.toLowerCase())
    )
  );

  if (applicableVariation) {
    return {
      ...instruction,
      instruction: applicableVariation.text
    };
  }

  return instruction;
}

/**
 * Format instruction for court use with case-specific details
 */
export function formatInstruction(
  instruction: JuryInstruction,
  caseDetails: {
    defendantName?: string;
    victimName?: string;
    date?: string;
    county?: string;
    specificFacts?: string[];
  }
): string {
  let formatted = instruction.instruction;

  // Replace placeholders with actual case details
  if (caseDetails.defendantName) {
    formatted = formatted.replace(/\[defendant's name\]/g, caseDetails.defendantName);
  }
  
  if (caseDetails.victimName) {
    formatted = formatted.replace(/\[victim's name\]/g, caseDetails.victimName);
  }
  
  if (caseDetails.date) {
    formatted = formatted.replace(/\[date\]/g, caseDetails.date);
  }
  
  if (caseDetails.county) {
    formatted = formatted.replace(/\[county\]/g, caseDetails.county);
  }

  return formatted;
}