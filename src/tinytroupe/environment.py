from typing import List
from .agent import TinyPerson

class TinyWorld:
    """A simplified, inspired version of the TinyWorld class."""

    def __init__(self, name: str, agents: List[TinyPerson]):
        self.name = name
        self.agents = agents
        self.current_turn = 0

    def make_everyone_accessible(self):
        """Makes all agents aware of each other. Placeholder for now."""
        print(f"In {self.name}, everyone is now aware of each other.")

    def run(self, steps: int = 1):
        """Runs the simulation for a given number of steps."""
        print(f"\n--- Starting simulation in {self.name} for {steps} steps ---")
        for i in range(steps):
            print(f"\n--- Turn {self.current_turn + 1} ---")

            # In this simplified version, we'll just go through the agents in order.
            # A more complex implementation would have a more sophisticated way
            # of determining who acts next.
            for agent in self.agents:
                # The prompt to act is implicit in the agent's memory.
                # In a more complex simulation, the world would provide a prompt.
                agent.act()

            self.current_turn += 1
        print(f"\n--- Simulation in {self.name} finished ---")
