import React, { useState } from 'react';
import { ImprovedCourtroom3D } from './components/ImprovedCourtroom3D';
import { CaseSelector } from './components/CaseSelector';
import { HudRoot } from './components/hud';
import { EconomicValuationDashboard } from './components/EconomicValuation';
import { useCourtroomStore } from './store/useCourtroomStore';
import { Case } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseScenarioFactory } from './services/CaseScenarioFactory';

function App() {
  const { currentCase, setCurrentCase, activeSpeaker, showValuationPanel, setShowValuationPanel } =
    useCourtroomStore();
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
    // Full-bleed stage: the 3D courtroom is the entire viewport. Every control
    // lives in <HudRoot> as translucent, auto-hiding, position:fixed glass
    // overlays that summon on hover (desktop) or tap (mobile) — nothing here
    // reserves layout space for them, so the scene is never letterboxed by a
    // sidebar or header again.
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black text-white">
      {currentCase && (
        <ImprovedCourtroom3D
          participants={currentCase.participants}
          activeSpeaker={activeSpeaker || undefined}
        />
      )}

      {currentCase && <HudRoot onNewCase={() => setShowSetup(true)} />}

      {/* Economic Valuation Modal — a deliberate full-screen takeover, so it
          sits above the HUD's z-[60]/z-[70]/z-[95] chrome layers. */}
      <AnimatePresence>
        {showValuationPanel && currentCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
            onClick={() => setShowValuationPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-7xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <EconomicValuationDashboard caseId={currentCase.id} onClose={() => setShowValuationPanel(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
