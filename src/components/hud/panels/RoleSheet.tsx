import React, { useState } from 'react';
import { HiUser, HiMicrophone, HiExclamation } from 'react-icons/hi';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { ParticipantRole, ObjectionType } from '../../../types';
import { HudSheet } from '../HudSheet';
import { HudButton } from '../HudButton';
import { glassField, sectionLabel } from '../theme';

interface RoleSheetProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  judge: 'Presides over proceedings, makes legal rulings, and ensures fair trial.',
  prosecutor: 'Represents the state/government in criminal cases, seeks to prove guilt.',
  'defense-attorney': 'Defends the accused, challenges evidence, protects client rights.',
  'plaintiff-attorney': 'Represents the plaintiff in civil cases, seeks damages/remedies.',
  defendant: 'Person accused of crime or being sued, has right to defense.',
  plaintiff: 'Person bringing civil lawsuit, seeking damages or relief.',
  witness: 'Provides testimony about facts relevant to the case.',
  'jury-member': 'Listens to evidence and decides on verdict based on facts presented.',
  observer: 'Watches proceedings without participating in the trial.',
  default: 'AI controls all participants. You can observe the automated simulation.',
};

const ROLE_TIPS: Partial<Record<ParticipantRole, string>> = {
  judge: 'Maintain neutrality, make rulings on objections, control courtroom proceedings.',
  prosecutor: 'Present evidence methodically, object to improper defense tactics, prove guilt beyond reasonable doubt.',
  'defense-attorney': "Challenge prosecution evidence, create reasonable doubt, protect client's constitutional rights.",
  'plaintiff-attorney': 'Prove liability by preponderance of evidence, demonstrate damages clearly.',
  defendant: 'Work with your attorney, answer questions honestly, exercise your right to remain silent.',
  plaintiff: 'Provide clear testimony about damages and how they occurred.',
  witness: 'Answer questions truthfully, stick to facts you personally observed.',
  'jury-member': 'Listen carefully to all evidence, deliberate based on facts presented, not emotions.',
};

const AVAILABLE_ROLES: ParticipantRole[] = [
  'judge',
  'prosecutor',
  'defense-attorney',
  'plaintiff-attorney',
  'defendant',
  'plaintiff',
  'witness',
  'jury-member',
  'observer',
];

const OBJECTION_TYPES: ObjectionType[] = [
  'relevance',
  'hearsay',
  'speculation',
  'leading-question',
  'argumentative',
  'asked-and-answered',
  'compound-question',
  'foundation',
  'privilege',
];

function labelize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Role selection plus a deliberately minimal "speak / object" affordance — the
 * brief calls user speech/objection input secondary, so it lives tucked inside
 * this sheet rather than as its own dock button.
 */
export const RoleSheet: React.FC<RoleSheetProps> = ({ open, onClose }) => {
  const { userRole, setUserRole, isSimulationRunning, processUserInput, triggerObjection } = useCourtroomStore();
  const [userInput, setUserInput] = useState('');
  const [objectionType, setObjectionType] = useState<ObjectionType>('relevance');

  const canAct = !!userRole && userRole !== 'observer' && userRole !== 'jury-member';
  const canObject = userRole === 'prosecutor' || userRole === 'defense-attorney' || userRole === 'plaintiff-attorney';

  const submit = () => {
    if (userInput.trim()) {
      processUserInput(userInput);
      setUserInput('');
    }
  };

  return (
    <HudSheet open={open} onClose={onClose} title="Your Role" icon={<HiUser className="w-4 h-4" />} widthClassName="w-80">
      <select
        value={userRole ?? ''}
        onChange={(e) => setUserRole((e.target.value || null) as ParticipantRole | null)}
        disabled={isSimulationRunning}
        className={glassField}
      >
        <option value="">AI Controlled (Observer)</option>
        {AVAILABLE_ROLES.map((role) => (
          <option key={role} value={role}>
            {labelize(role)}
          </option>
        ))}
      </select>

      <p className="text-xs text-[#f2ead8]/60 leading-relaxed">
        <span className="text-[#c9a227]">Responsibility &mdash; </span>
        {ROLE_DESCRIPTIONS[userRole ?? ''] ?? ROLE_DESCRIPTIONS.default}
      </p>

      {userRole && userRole !== 'observer' && (
        <p className="text-xs text-[#f2ead8]/50 leading-relaxed border-l-2 border-[#c9a227]/30 pl-2">
          {ROLE_TIPS[userRole]}
        </p>
      )}

      {canAct && (
        <div className="pt-2 border-t border-[#c9a227]/15 space-y-2">
          <div className={sectionLabel}>Speak</div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Enter your statement..."
            className={glassField}
          />
          <HudButton variant="primary" onClick={submit}>
            <HiMicrophone className="w-4 h-4" /> Speak
          </HudButton>

          {canObject && (
            <>
              <select
                value={objectionType}
                onChange={(e) => setObjectionType(e.target.value as ObjectionType)}
                className={glassField}
              >
                {OBJECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {labelize(t)}
                  </option>
                ))}
              </select>
              <HudButton variant="secondary" onClick={() => triggerObjection(objectionType)}>
                <HiExclamation className="w-4 h-4" /> Object!
              </HudButton>
            </>
          )}
        </div>
      )}
    </HudSheet>
  );
};
