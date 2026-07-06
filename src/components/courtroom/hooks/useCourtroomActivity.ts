import { useMemo } from 'react';
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
 *
 * Subscribes to only the three store fields it reads (via selectors) so the 3D
 * scene re-renders when *those* change rather than on every store mutation, and
 * memoizes the derivation so it is not recomputed on unrelated re-renders. Logic
 * is otherwise identical to the original composition-root computation.
 */
export function useCourtroomActivity(
  participants: Participant[],
  activeSpeaker?: string
): CourtroomActivity {
  const activeLLMAgents = useCourtroomStore((s) => s.activeLLMAgents);
  const isProcessingAI = useCourtroomStore((s) => s.isProcessingAI);
  const currentAIOperation = useCourtroomStore((s) => s.currentAIOperation);

  return useMemo(() => {
    const activeRole = activeSpeaker
      ? participants.find((p) => p.id === activeSpeaker)?.role || ''
      : '';

    const thinkingRoles: string[] = [];

    // Agents currently thinking.
    Array.from(activeLLMAgents.values()).forEach((agent) => {
      if (agent.status === 'thinking') {
        thinkingRoles.push(agent.role);
      }
    });

    // Also treat any role named in the current AI operation as thinking.
    if (isProcessingAI && currentAIOperation) {
      const operation = currentAIOperation.toLowerCase();
      participants.forEach((p) => {
        if (operation.includes(p.name.toLowerCase()) || operation.includes(p.role)) {
          if (!thinkingRoles.includes(p.role)) {
            thinkingRoles.push(p.role);
          }
        }
      });
    }

    return { activeRole, thinkingRoles };
  }, [participants, activeSpeaker, activeLLMAgents, isProcessingAI, currentAIOperation]);
}
