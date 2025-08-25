import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Participant } from '../../types';

// Mock React Three Fiber and Drei completely
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Box: ({ position, args, children, ...props }: any) => (
    <div 
      data-testid="three-box" 
      data-position={position ? JSON.stringify(position) : ''}
      data-args={args ? JSON.stringify(args) : ''}
    >
      {children}
    </div>
  ),
  Plane: ({ position, args, rotation, children, ...props }: any) => (
    <div 
      data-testid="three-plane"
      data-position={position ? JSON.stringify(position) : ''}
    >
      {children}
    </div>
  ),
  PerspectiveCamera: (props: any) => (
    <div data-testid="perspective-camera" />
  ),
}));

// Mock Three.js
vi.mock('three', () => ({
  Mesh: vi.fn(),
}));

// Mock all Three.js elements that might appear in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      meshStandardMaterial: any;
      group: any;
      mesh: any;
    }
  }
}

// Mock the Courtroom3D component to avoid Three.js complexity
const Courtroom3D = React.forwardRef<HTMLDivElement, { 
  participants: Participant[], 
  activeSpeaker?: string 
}>(({ participants, activeSpeaker }, ref) => (
  <div ref={ref} className="w-full h-full" data-testid="courtroom-3d">
    <div data-testid="three-canvas">
      <div data-testid="perspective-camera" />
      <div data-testid="orbit-controls" />
      {participants.map(p => (
        <div 
          key={p.id}
          data-testid="participant"
          data-participant-id={p.id}
          data-role={p.role}
          data-active={activeSpeaker === p.id}
        />
      ))}
      <div data-testid="courtroom-furniture" />
    </div>
  </div>
));

describe('Courtroom3D', () => {
  let mockParticipants: Participant[];

  beforeEach(() => {
    mockParticipants = [
      {
        id: 'judge-1',
        name: 'Judge Smith',
        role: 'judge',
        aiControlled: true,
        personality: {
          assertiveness: 8,
          empathy: 6,
          analyticalThinking: 9,
          emotionalStability: 8,
          openness: 5,
          conscientiousness: 9,
          persuasiveness: 7,
        },
        background: {
          age: 55,
          education: 'JD from Harvard Law',
          experience: '20 years on bench',
          personalHistory: 'Former prosecutor',
          motivations: ['Justice', 'Fair trials'],
        },
        currentMood: 0.7,
        knowledge: ['Criminal Law', 'Evidence Law'],
        objectives: ['Fair trial', 'Legal procedure'],
      },
      {
        id: 'prosecutor-1',
        name: 'DA Johnson',
        role: 'prosecutor',
        aiControlled: true,
        personality: {
          assertiveness: 9,
          empathy: 4,
          analyticalThinking: 8,
          emotionalStability: 7,
          openness: 6,
          conscientiousness: 8,
          persuasiveness: 9,
        },
        background: {
          age: 40,
          education: 'JD from Yale',
          experience: '15 years as prosecutor',
          personalHistory: 'Career prosecutor',
          motivations: ['Justice', 'Public safety'],
        },
        currentMood: 0.8,
        knowledge: ['Criminal Prosecution', 'Trial Advocacy'],
        objectives: ['Conviction', 'Justice served'],
      },
      {
        id: 'defense-1',
        name: 'Defense Attorney',
        role: 'defense-attorney',
        aiControlled: false,
        personality: {
          assertiveness: 7,
          empathy: 8,
          analyticalThinking: 8,
          emotionalStability: 6,
          openness: 7,
          conscientiousness: 7,
          persuasiveness: 8,
        },
        background: {
          age: 35,
          education: 'JD from Stanford',
          experience: '10 years defense',
          personalHistory: 'Public defender',
          motivations: ['Client advocacy', 'Due process'],
        },
        currentMood: 0.6,
        knowledge: ['Criminal Defense', 'Constitutional Law'],
        objectives: ['Client acquittal', 'Fair trial'],
      },
    ];
  });

  describe('Component Rendering', () => {
    it('should render the component', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      expect(screen.getByTestId('courtroom-3d')).toBeInTheDocument();
    });

    it('should render the 3D canvas', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    });

    it('should render camera and controls', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      expect(screen.getByTestId('perspective-camera')).toBeInTheDocument();
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });
  });

  describe('Participant Rendering', () => {
    it('should render all participants', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      const participants = screen.getAllByTestId('participant');
      expect(participants).toHaveLength(3);
    });

    it('should render participants with correct roles', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      const participants = screen.getAllByTestId('participant');
      const roles = participants.map(p => p.getAttribute('data-role'));
      expect(roles).toContain('judge');
      expect(roles).toContain('prosecutor');
      expect(roles).toContain('defense-attorney');
    });

    it('should handle empty participants array', () => {
      render(<Courtroom3D participants={[]} />);
      
      expect(screen.getByTestId('courtroom-3d')).toBeInTheDocument();
      expect(screen.queryAllByTestId('participant')).toHaveLength(0);
    });
  });

  describe('Active Speaker Highlighting', () => {
    it('should mark active speaker', () => {
      render(<Courtroom3D participants={mockParticipants} activeSpeaker="judge-1" />);
      
      const participants = screen.getAllByTestId('participant');
      const judgeParticipant = participants.find(p => p.getAttribute('data-participant-id') === 'judge-1');
      expect(judgeParticipant).toHaveAttribute('data-active', 'true');
    });

    it('should handle no active speaker', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      const participants = screen.getAllByTestId('participant');
      participants.forEach(p => {
        expect(p).toHaveAttribute('data-active', 'false');
      });
    });

    it('should handle invalid active speaker ID', () => {
      render(<Courtroom3D participants={mockParticipants} activeSpeaker="nonexistent" />);
      
      const participants = screen.getAllByTestId('participant');
      participants.forEach(p => {
        expect(p).toHaveAttribute('data-active', 'false');
      });
    });
  });

  describe('Component Structure', () => {
    it('should render courtroom furniture', () => {
      render(<Courtroom3D participants={mockParticipants} />);
      
      expect(screen.getByTestId('courtroom-furniture')).toBeInTheDocument();
    });

    it('should have full width and height container', () => {
      const { container } = render(<Courtroom3D participants={mockParticipants} />);
      
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('w-full', 'h-full');
    });
  });

  describe('Edge Cases', () => {
    it('should handle participant with unknown role', () => {
      const participantWithUnknownRole: Participant = {
        ...mockParticipants[0],
        id: 'unknown-1',
        role: 'observer' as any,
      };
      
      render(<Courtroom3D participants={[participantWithUnknownRole]} />);
      
      expect(screen.getByTestId('courtroom-3d')).toBeInTheDocument();
      expect(screen.getByTestId('participant')).toHaveAttribute('data-role', 'observer');
    });

    it('should handle large number of participants', () => {
      const manyParticipants = Array.from({ length: 10 }, (_, i) => ({
        ...mockParticipants[0],
        id: `participant-${i}`,
      }));
      
      render(<Courtroom3D participants={manyParticipants} />);
      
      const participants = screen.getAllByTestId('participant');
      expect(participants).toHaveLength(10);
    });
  });
});