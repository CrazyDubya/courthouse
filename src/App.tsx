import React, { useEffect, useState } from 'react';
import { Courtroom3D } from './components/Courtroom3D';
import { ControlPanel } from './components/ControlPanel';
import { TranscriptViewer } from './components/TranscriptViewer';
import { useCourtroomStore } from './store/useCourtroomStore';
import { Case, Participant, Evidence } from './types';
import { motion } from 'framer-motion';

function App() {
  const { currentCase, setCurrentCase, activeSpeaker } = useCourtroomStore();
  const [showSetup, setShowSetup] = useState(true);

  useEffect(() => {
    if (!currentCase) {
      loadSampleCase();
    }
  }, []);

  const loadSampleCase = () => {
    const sampleCase: Case = {
      id: 'case-001',
      title: 'State v. Johnson',
      type: 'criminal',
      legalSystem: 'common-law',
      summary: 'Defendant is charged with theft of property valued over $1000 from a retail establishment.',
      facts: [
        'Security footage shows defendant in the store',
        'Items were found missing after defendant left',
        'Defendant was apprehended with some items',
        'Defendant claims misunderstanding about payment',
      ],
      charges: ['Theft over $1000', 'Criminal trespass'],
      participants: generateSampleParticipants(),
      evidence: generateSampleEvidence(),
      currentPhase: 'pre-trial',
      transcript: [],
      rulings: [],
    };
    
    setCurrentCase(sampleCase);
    setShowSetup(false);
  };

  const generateSampleParticipants = (): Participant[] => {
    return [
      {
        id: 'judge-1',
        name: 'Hon. Sarah Mitchell',
        role: 'judge',
        aiControlled: true,
        personality: {
          assertiveness: 8,
          empathy: 6,
          analyticalThinking: 9,
          emotionalStability: 8,
          openness: 7,
          conscientiousness: 9,
          persuasiveness: 7,
        },
        background: {
          age: 52,
          education: 'Harvard Law School, J.D.',
          experience: '20 years judicial experience',
          specialization: 'Criminal law',
          personalHistory: 'Former prosecutor with extensive trial experience',
          motivations: ['Upholding justice', 'Ensuring fair trials', 'Protecting constitutional rights'],
        },
        currentMood: 0.7,
        knowledge: ['Criminal procedure', 'Evidence law', 'Constitutional law'],
        objectives: ['Maintain order', 'Ensure fair proceedings', 'Apply law correctly'],
      },
      {
        id: 'prosecutor-1',
        name: 'David Chen',
        role: 'prosecutor',
        aiControlled: true,
        personality: {
          assertiveness: 9,
          empathy: 4,
          analyticalThinking: 8,
          emotionalStability: 7,
          openness: 5,
          conscientiousness: 8,
          persuasiveness: 9,
        },
        background: {
          age: 38,
          education: 'Yale Law School, J.D.',
          experience: '12 years as prosecutor',
          specialization: 'White collar crime',
          personalHistory: 'Successful track record of convictions',
          motivations: ['Seeking justice', 'Protecting society', 'Career advancement'],
        },
        currentMood: 0.6,
        knowledge: ['Criminal law', 'Trial advocacy', 'Evidence presentation'],
        objectives: ['Prove guilt beyond reasonable doubt', 'Present compelling evidence'],
      },
      {
        id: 'defense-1',
        name: 'Maria Rodriguez',
        role: 'defense-attorney',
        aiControlled: true,
        personality: {
          assertiveness: 8,
          empathy: 7,
          analyticalThinking: 9,
          emotionalStability: 6,
          openness: 8,
          conscientiousness: 7,
          persuasiveness: 9,
        },
        background: {
          age: 42,
          education: 'Stanford Law School, J.D.',
          experience: '15 years criminal defense',
          specialization: 'Criminal defense',
          personalHistory: 'Public defender turned private practice',
          motivations: ['Protecting client rights', 'Ensuring fair representation', 'Challenging the system'],
        },
        currentMood: 0.6,
        knowledge: ['Criminal defense', 'Constitutional law', 'Negotiation'],
        objectives: ['Create reasonable doubt', 'Protect client interests', 'Challenge evidence'],
      },
      {
        id: 'defendant-1',
        name: 'Michael Johnson',
        role: 'defendant',
        aiControlled: true,
        personality: {
          assertiveness: 4,
          empathy: 6,
          analyticalThinking: 5,
          emotionalStability: 3,
          openness: 6,
          conscientiousness: 5,
          persuasiveness: 4,
        },
        background: {
          age: 28,
          education: 'High school diploma',
          experience: 'First offense',
          personalHistory: 'Unemployed, financial difficulties',
          motivations: ['Avoiding conviction', 'Maintaining innocence', 'Supporting family'],
        },
        currentMood: 0.3,
        knowledge: ['Basic legal rights'],
        objectives: ['Prove innocence', 'Avoid jail time'],
      },
      ...generateJuryMembers(6),
      {
        id: 'bailiff-1',
        name: 'Officer Thompson',
        role: 'bailiff',
        aiControlled: true,
        personality: {
          assertiveness: 7,
          empathy: 5,
          analyticalThinking: 5,
          emotionalStability: 8,
          openness: 4,
          conscientiousness: 9,
          persuasiveness: 3,
        },
        background: {
          age: 45,
          education: 'Police academy',
          experience: '10 years court bailiff',
          personalHistory: 'Former police officer',
          motivations: ['Maintaining order', 'Following procedures'],
        },
        currentMood: 0.7,
        knowledge: ['Court procedures', 'Security protocols'],
        objectives: ['Maintain courtroom security', 'Assist judge'],
      },
      {
        id: 'clerk-1',
        name: 'Jennifer Park',
        role: 'court-clerk',
        aiControlled: true,
        personality: {
          assertiveness: 3,
          empathy: 6,
          analyticalThinking: 7,
          emotionalStability: 7,
          openness: 5,
          conscientiousness: 10,
          persuasiveness: 2,
        },
        background: {
          age: 35,
          education: 'Paralegal certification',
          experience: '8 years court clerk',
          personalHistory: 'Detail-oriented administrator',
          motivations: ['Accuracy in records', 'Supporting justice system'],
        },
        currentMood: 0.7,
        knowledge: ['Court procedures', 'Legal documentation'],
        objectives: ['Maintain accurate records', 'Support proceedings'],
      },
    ];
  };

  const generateJuryMembers = (count: number): Participant[] => {
    const jurors: Participant[] = [];
    const names = ['John Smith', 'Jane Doe', 'Robert Brown', 'Emily White', 'James Wilson', 
                   'Patricia Garcia', 'William Davis', 'Linda Martinez', 'David Anderson', 
                   'Susan Taylor', 'Richard Thomas', 'Barbara Jackson'];
    
    for (let i = 0; i < count; i++) {
      jurors.push({
        id: `juror-${i + 1}`,
        name: names[i] || `Juror ${i + 1}`,
        role: 'jury-member',
        aiControlled: true,
        personality: {
          assertiveness: Math.random() * 10,
          empathy: Math.random() * 10,
          analyticalThinking: Math.random() * 10,
          emotionalStability: Math.random() * 10,
          openness: Math.random() * 10,
          conscientiousness: Math.random() * 10,
          persuasiveness: Math.random() * 10,
        },
        background: {
          age: 25 + Math.floor(Math.random() * 40),
          education: 'Various backgrounds',
          experience: 'Jury duty',
          personalHistory: 'Community member',
          motivations: ['Civic duty', 'Fair judgment'],
        },
        currentMood: 0.5,
        knowledge: ['Common sense', 'Life experience'],
        objectives: ['Listen to evidence', 'Make fair decision'],
      });
    }
    
    return jurors;
  };

  const generateSampleEvidence = (): Evidence[] => {
    return [
      {
        id: 'ev-001',
        type: 'video',
        title: 'Security Footage',
        description: 'Store surveillance video showing defendant in the premises',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Store manager', 'Police', 'Prosecution'],
        exhibit: 'A',
      },
      {
        id: 'ev-002',
        type: 'document',
        title: 'Receipt Records',
        description: 'Store receipts showing no purchase by defendant',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Store', 'Prosecution'],
        exhibit: 'B',
      },
      {
        id: 'ev-003',
        type: 'physical',
        title: 'Recovered Items',
        description: 'Items found in defendant possession matching store inventory',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Police', 'Evidence locker', 'Prosecution'],
        exhibit: 'C',
      },
      {
        id: 'ev-004',
        type: 'testimony',
        title: 'Character Witness',
        description: 'Testimony regarding defendant character and circumstances',
        admissible: true,
        submittedBy: 'defense-1',
        chainOfCustody: ['Defense'],
        exhibit: 'D',
      },
    ];
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
        <motion.div 
          className="max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            LLM Courtroom Simulator
          </h1>
          <p className="text-xl text-gray-400 text-center mb-8">
            An AI-powered 3D courtroom simulation with multiple LLM agents
          </p>
          
          <div className="bg-gray-900 rounded-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Welcome to the Virtual Courtroom</h2>
            <p className="text-gray-300 mb-6">
              This simulator creates realistic courtroom proceedings using AI agents powered by various LLM providers.
              Each participant has their own personality, background, and objectives.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold mb-2 text-blue-400">Features</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 3D courtroom environment</li>
                  <li>• Multiple AI personalities</li>
                  <li>• Real-time proceedings</li>
                  <li>• User role selection</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-semibold mb-2 text-purple-400">Supported LLMs</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• OpenAI GPT</li>
                  <li>• Anthropic Claude</li>
                  <li>• Ollama (local)</li>
                  <li>• And more...</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={loadSampleCase}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              Load Sample Case & Begin
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="h-screen flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            LLM Courtroom Simulator
          </h1>
          {currentCase && (
            <p className="text-gray-400 mt-1">
              {currentCase.title} - {currentCase.type.charAt(0).toUpperCase() + currentCase.type.slice(1)} Case
            </p>
          )}
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto">
            <ControlPanel />
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-800">
              {currentCase && (
                <Courtroom3D 
                  participants={currentCase.participants}
                  activeSpeaker={activeSpeaker || undefined}
                />
              )}
            </div>
          </div>
          
          <div className="w-96 bg-gray-900 border-l border-gray-800 overflow-hidden">
            <TranscriptViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;