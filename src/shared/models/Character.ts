import { Character, Role, LLMConfig, PersonalityTrait } from '../types/index.js';
import { nanoid } from 'nanoid';

export class CharacterGenerator {
  static generatePersonality(): PersonalityTrait[] {
    const traits = [
      'aggressiveness', 'confidence', 'empathy', 'intelligence', 'charisma',
      'patience', 'attention_to_detail', 'creativity', 'stubbornness', 'ambition'
    ];

    return traits.map(name => ({
      name,
      value: Math.floor(Math.random() * 100),
      description: this.getTraitDescription(name)
    }));
  }

  private static getTraitDescription(trait: string): string {
    const descriptions: Record<string, string> = {
      aggressiveness: 'Tendency to pursue goals forcefully',
      confidence: 'Self-assurance in abilities and decisions',
      empathy: 'Ability to understand and share feelings',
      intelligence: 'Capacity for learning and problem-solving',
      charisma: 'Compelling attractiveness or charm',
      patience: 'Ability to wait calmly for extended periods',
      attention_to_detail: 'Thoroughness in examining particulars',
      creativity: 'Ability to create original ideas or solutions',
      stubbornness: 'Determination to maintain position despite opposition',
      ambition: 'Strong desire to achieve success or distinction'
    };
    return descriptions[trait] || 'Character trait';
  }

  static generateBackground(role: Role): Partial<Character> {
    const names = this.getNamesByRole(role);
    const careers = this.getCareersByRole(role);
    const name = names[Math.floor(Math.random() * names.length)];
    const career = careers[Math.floor(Math.random() * careers.length)];
    const age = Math.floor(Math.random() * 30) + 25; // 25-55 years old

    return {
      name,
      age,
      birthday: this.generateBirthday(age),
      career,
      education: this.generateEducation(role),
      experience: this.generateExperience(role, age),
      personality: this.generatePersonality(),
      motivations: this.generateMotivations(role),
      background: this.generatePersonalBackground(role),
      specialties: this.generateSpecialties(role),
      weaknesses: this.generateWeaknesses()
    };
  }

  private static getNamesByRole(_role: Role): string[] {
    const maleNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph'];
    const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    const firstNames = [...maleNames, ...femaleNames];
    return firstNames.map(first => 
      lastNames.map(last => `${first} ${last}`)
    ).flat();
  }

  private static getCareersByRole(role: Role): string[] {
    switch (role) {
      case Role.JUDGE:
        return ['Former District Attorney', 'Former Private Practice Attorney', 'Legal Scholar'];
      case Role.PROSECUTOR:
        return ['District Attorney', 'Assistant District Attorney', 'Federal Prosecutor'];
      case Role.DEFENSE_LAWYER:
      case Role.PLAINTIFF_LAWYER:
        return ['Criminal Defense Attorney', 'Civil Rights Lawyer', 'Corporate Lawyer', 'Public Defender'];
      case Role.WITNESS:
        return ['Doctor', 'Engineer', 'Teacher', 'Business Owner', 'Police Officer', 'Expert Witness'];
      default:
        return ['Professional', 'Civilian', 'Expert'];
    }
  }

  private static generateBirthday(age: number): string {
    const year = new Date().getFullYear() - age;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  private static generateEducation(role: Role): string {
    switch (role) {
      case Role.JUDGE:
      case Role.PROSECUTOR:
      case Role.DEFENSE_LAWYER:
      case Role.PLAINTIFF_LAWYER:
        return 'J.D. from prestigious law school, undergraduate degree';
      default:
        return 'College degree or relevant professional training';
    }
  }

  private static generateExperience(role: Role, age: number): string {
    const years = Math.max(1, age - 25);
    switch (role) {
      case Role.JUDGE:
        return `${years} years in legal practice before appointment to the bench`;
      case Role.PROSECUTOR:
      case Role.DEFENSE_LAWYER:
      case Role.PLAINTIFF_LAWYER:
        return `${years} years of legal practice with focus on relevant areas`;
      default:
        return `${years} years of professional experience`;
    }
  }

  private static generateMotivations(role: Role): string[] {
    const common = ['Justice', 'Truth', 'Professional success', 'Financial security'];
    const specific: Record<Role, string[]> = {
      [Role.JUDGE]: ['Impartial justice', 'Upholding the law', 'Maintaining court order'],
      [Role.PROSECUTOR]: ['Public safety', 'Conviction rate', 'Serving victims'],
      [Role.DEFENSE_LAWYER]: ['Client advocacy', 'Constitutional rights', 'Due process'],
      [Role.PLAINTIFF_LAWYER]: ['Client compensation', 'Corporate accountability', 'Precedent setting'],
      [Role.DEFENDANT]: ['Freedom', 'Vindication', 'Family protection'],
      [Role.WITNESS]: ['Truth telling', 'Civic duty', 'Personal closure'],
      [Role.JURY_MEMBER]: ['Fair verdict', 'Civic responsibility', 'Justice for all'],
      [Role.PLAINTIFF]: ['Compensation', 'Justice', 'Recognition of harm'],
      [Role.COURT_REPORTER]: ['Accuracy', 'Professionalism', 'Court efficiency'],
      [Role.BAILIFF]: ['Court security', 'Order maintenance', 'Public safety']
    };
    
    return [...common, ...(specific[role] || [])];
  }

  private static generatePersonalBackground(_role: Role): string {
    const backgrounds = [
      'Grew up in a middle-class family with strong moral values',
      'Overcame significant challenges in early life to achieve success',
      'Comes from a family with legal tradition',
      'Started career in different field before entering law',
      'Has personal experience with the justice system'
    ];
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }

  private static generateSpecialties(role: Role): string[] {
    const specialties: Record<Role, string[]> = {
      [Role.JUDGE]: ['Constitutional law', 'Criminal procedure', 'Evidence rules'],
      [Role.PROSECUTOR]: ['Criminal prosecution', 'Evidence presentation', 'Witness preparation'],
      [Role.DEFENSE_LAWYER]: ['Criminal defense', 'Constitutional rights', 'Cross-examination'],
      [Role.PLAINTIFF_LAWYER]: ['Civil litigation', 'Personal injury', 'Contract law'],
      [Role.WITNESS]: ['Expert testimony', 'Fact recollection', 'Technical knowledge'],
      [Role.JURY_MEMBER]: ['Common sense reasoning', 'Fact evaluation', 'Group deliberation'],
      [Role.DEFENDANT]: ['Personal knowledge of events', 'Self-advocacy'],
      [Role.PLAINTIFF]: ['Personal testimony', 'Damage evidence'],
      [Role.COURT_REPORTER]: ['Stenography', 'Legal terminology', 'Transcript accuracy'],
      [Role.BAILIFF]: ['Security procedures', 'Court protocol', 'Crowd control']
    };
    
    return specialties[role] || [];
  }

  private static generateWeaknesses(): string[] {
    const weaknesses = [
      'Sometimes too emotional', 'Can be overly aggressive', 'Tends to overthink',
      'May miss important details', 'Can be easily distracted', 'Sometimes impatient'
    ];
    return weaknesses.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  static createCharacter(role: Role, llmConfig: LLMConfig): Character {
    const background = this.generateBackground(role);
    
    return {
      id: nanoid(),
      role,
      llmConfig: {
        ...llmConfig,
        systemPrompt: this.generateSystemPrompt(role, background)
      },
      currentThoughts: [],
      currentGoals: this.generateInitialGoals(role),
      currentPlans: [],
      memoryLog: [],
      active: true,
      ...background
    } as Character;
  }

  private static generateSystemPrompt(role: Role, background: Partial<Character>): string {
    const basePrompt = `You are ${background.name}, a ${background.age}-year-old ${background.career} serving as the ${role} in a legal proceeding.

Background:
- Education: ${background.education}
- Experience: ${background.experience}
- Personal Background: ${background.background}
- Motivations: ${background.motivations?.join(', ')}
- Specialties: ${background.specialties?.join(', ')}

Personality Traits:
${background.personality?.map(trait => `- ${trait.name}: ${trait.value}/100 (${trait.description})`).join('\n')}

You should act according to your role, background, and personality. Stay in character at all times. Make decisions based on your motivations and use your specialties when relevant. Be aware of your weaknesses and how they might affect your performance.

When responding:
1. Stay true to your character's personality and motivations
2. Use appropriate legal terminology and procedures for your role
3. Consider the evidence and arguments presented
4. Make realistic objections, rulings, or statements based on your role
5. Show your character's thinking process and reasoning
6. Maintain professional courtroom decorum while expressing your character's personality

Remember: You are participating in a realistic legal simulation. Act professionally but show your character's unique traits and motivations.`;

    return basePrompt;
  }

  private static generateInitialGoals(role: Role): string[] {
    const goals: Record<Role, string[]> = {
      [Role.JUDGE]: ['Ensure fair trial', 'Apply law correctly', 'Maintain courtroom order'],
      [Role.PROSECUTOR]: ['Prove guilt beyond reasonable doubt', 'Present compelling case', 'Secure conviction'],
      [Role.DEFENSE_LAWYER]: ['Protect client rights', 'Create reasonable doubt', 'Secure acquittal'],
      [Role.PLAINTIFF_LAWYER]: ['Prove liability', 'Demonstrate damages', 'Secure favorable verdict'],
      [Role.DEFENDANT]: ['Prove innocence', 'Avoid conviction', 'Maintain dignity'],
      [Role.WITNESS]: ['Tell the truth', 'Answer questions clearly', 'Help justice prevail'],
      [Role.JURY_MEMBER]: ['Evaluate evidence fairly', 'Follow jury instructions', 'Reach just verdict'],
      [Role.PLAINTIFF]: ['Obtain compensation', 'Prove harm', 'Hold defendant accountable'],
      [Role.COURT_REPORTER]: ['Record proceedings accurately', 'Maintain transcript quality'],
      [Role.BAILIFF]: ['Maintain order', 'Ensure security', 'Assist court operations']
    };
    
    return goals[role] || ['Perform role effectively'];
  }
}