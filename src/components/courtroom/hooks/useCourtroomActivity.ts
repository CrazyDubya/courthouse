import { Participant } from '../../../types';
import { useCourtroomStore } from '../../../store/useCourtroomStore';

export interface CourtroomActivity {
  /** Role of the currently-speaking participant, or '' if none. */
  activeRole: string;
  /** Roles whose LLM agent is currently thinking. */
  thinkingRoles: string[];
}

/**
 * Derives which role is speaking and which roles are "thinking" from the
 * participant list, the active speaker id, and the live LLM agent state.
 * Extracted verbatim from the original ImprovedCourtroom3D composition root.
 */
export function useCourtroomActivity(
  participants: Participant[],
  activeSpeaker?: string
): CourtroomActivity {
  const { activeLLMAgents, isProcessingAI, currentAIOperation } = useCourtroomStore();

  const getActiveParticipantRole = (speakerId: string): string => {
    const participant = participants.find(p => p.id === speakerId);
    return participant?.role || '';
  };

  const getThinkingParticipants = (): string[] => {
    const thinkingRoles: string[] = [];

    // Check which agents are currently thinking
    Array.from(activeLLMAgents.values()).forEach(agent => {
      if (agent.status === 'thinking') {
        thinkingRoles.push(agent.role);
      }
    });

    // Also check if current AI operation mentions specific roles
    if (isProcessingAI && currentAIOperation) {
      const operation = currentAIOperation.toLowerCase();
      participants.forEach(p => {
        if (operation.includes(p.name.toLowerCase()) || operation.includes(p.role)) {
          if (!thinkingRoles.includes(p.role)) {
            thinkingRoles.push(p.role);
          }
        }
      });
    }

    return thinkingRoles;
  };

  const activeRole = activeSpeaker ? getActiveParticipantRole(activeSpeaker) : '';
  const thinkingRoles = getThinkingParticipants();

  return { activeRole, thinkingRoles };
}
