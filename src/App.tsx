import React, { useEffect, useState } from 'react';
import { ImprovedCourtroom3D } from './components/ImprovedCourtroom3D';
import { ControlPanel } from './components/ControlPanel';
import { TranscriptViewer } from './components/TranscriptViewer';
import { SidebarWrapper, MobileSidebarFAB } from './components/SidebarWrapper';
import { CaseSelector } from './components/CaseSelector';
import { LLMStatusIndicator } from './components/LLMStatusIndicator';
import { EconomicValuationDashboard } from './components/EconomicValuation';
import { useCourtroomStore } from './store/useCourtroomStore';
import { Case, Participant, Evidence } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedJudgeFactory } from './services/EnhancedJudgeFactory';
import { CaseScenarioFactory } from './services/CaseScenarioFactory';

function App() {
  const { currentCase, setCurrentCase, activeSpeaker, showValuationPanel, setShowValuationPanel } = useCourtroomStore();
  const [showSetup, setShowSetup] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCaseGenerate = async (caseType: string, category: 'criminal' | 'civil') => {
    setIsGenerating(true);
    try {
      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate case based on type and category
      const realisticCase = CaseScenarioFactory.generateReplacementCase(caseType, category);
    
      // Convert enhanced case to basic case format for compatibility
      const sampleCase: Case = {
        id: realisticCase.id,
        title: realisticCase.title,
        type: realisticCase.type,
        legalSystem: realisticCase.legalSystem,
        summary: realisticCase.summary,
        facts: realisticCase.facts,
        charges: realisticCase.criminal ? realisticCase.criminal.charges.map(c => c.title) : [],
        participants: realisticCase.participants,
        evidence: realisticCase.evidence,
        currentPhase: realisticCase.currentPhase,
        transcript: realisticCase.transcript,
        rulings: realisticCase.rulings,
      };
      
      setCurrentCase(sampleCase);
      setShowSetup(false);
    } catch (error) {
      console.error('Error generating case:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  if (showSetup) {
    return <CaseSelector onCaseGenerate={handleCaseGenerate} isGenerating={isGenerating} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="h-screen flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                LLM Courtroom Simulator
              </h1>
              {currentCase && (
                <p className="text-gray-400 mt-1">
                  {currentCase.title} - {currentCase.type.charAt(0).toUpperCase() + currentCase.type.slice(1)} Case
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSetup(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
            >
              Select New Case
            </button>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar - Control Panel */}
          <SidebarWrapper side="left">
            <ControlPanel />
          </SidebarWrapper>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-gray-800">
              {currentCase && (
                <ImprovedCourtroom3D 
                  participants={currentCase.participants}
                  activeSpeaker={activeSpeaker || undefined}
                />
              )}
            </div>
          </div>
          
          {/* Right Sidebar - Transcript Viewer */}
          <SidebarWrapper side="right">
            <TranscriptViewer />
          </SidebarWrapper>
          
          {/* Mobile FABs for sidebar access */}
          <MobileSidebarFAB side="left" />
          <MobileSidebarFAB side="right" />

          {/* LLM Status Indicator - Fixed position overlay */}
          <LLMStatusIndicator />

          {/* Economic Valuation Modal */}
          <AnimatePresence>
            {showValuationPanel && currentCase && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => setShowValuationPanel(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="max-w-7xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EconomicValuationDashboard
                    caseId={currentCase.id}
                    onClose={() => setShowValuationPanel(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;