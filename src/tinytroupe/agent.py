import sys
import os

# Add src to the Python path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from llm_engine import get_llm_provider, LLMProvider

class TinyPerson:
    """A simplified, inspired version of the TinyPerson class."""

    def __init__(self, name: str, llm_provider: str = 'ollama'):
        self.persona = {"name": name}
        self.memory = []
        self.llm_provider: LLMProvider = get_llm_provider(llm_provider)
        self.is_user_controlled = False

    def define(self, key: str, value):
        """Defines a part of the agent's persona."""
        self.persona[key] = value

    def listen(self, message: str):
        """Receives a message and stores it in memory."""
        print(f"{self.persona['name']} heard: {message}")
        self.memory.append(f"Heard: {message}")

    def act(self) -> str:
        """Generates an action based on the persona and memory."""
        if self.is_user_controlled:
            # The simulation controller will handle waiting for user input.
            # This method will be called after the user has provided input.
            # The user's message will be in the memory.
            return self.memory[-1] # Return the last message, which is the user's input

        prompt = self._build_prompt()
        response = self.llm_provider.generate(prompt)
        print(f"{self.persona['name']} says: {response}")
        self.memory.append(f"Said: {response}")
        return response

    def _build_prompt(self) -> str:
        """Builds a prompt for the LLM based on the agent's state."""
        persona_desc = f"You are {self.persona['name']}. "
        for key, value in self.persona.items():
            if key != 'name':
                persona_desc += f"Your {key} is {value}. "

        memory_str = "\n".join(self.memory[-5:]) # Use last 5 memories

        prompt = f"{persona_desc}\n\nRecent conversation:\n{memory_str}\n\nWhat do you say or do next?"
        return prompt
