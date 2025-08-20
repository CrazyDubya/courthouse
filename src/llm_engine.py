import os
from abc import ABC, abstractmethod
import openai
import requests
import json

class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text from a prompt."""
        pass

class OpenAIProvider(LLMProvider):
    """LLM provider for OpenAI API."""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided. Set the OPENAI_API_KEY environment variable.")
        openai.api_key = self.api_key

    def generate(self, prompt: str, max_tokens: int = 150) -> str:
        try:
            response = openai.Completion.create(
                engine="text-davinci-003",  # Or another suitable model
                prompt=prompt,
                max_tokens=max_tokens
            )
            return response.choices[0].text.strip()
        except Exception as e:
            return f"Error generating text with OpenAI: {e}"

class OllamaProvider(LLMProvider):
    """LLM provider for Ollama."""

    def __init__(self, host: str = "http://localhost:11434"):
        self.host = host

    def generate(self, prompt: str, max_tokens: int = 150) -> str:
        try:
            response = requests.post(
                f"{self.host}/api/generate",
                json={
                    "model": "llama2",  # Or another model you have pulled
                    "prompt": prompt,
                    "stream": False,
                    "max_tokens": max_tokens
                }
            )
            response.raise_for_status()
            # The actual text is in the 'response' field of the JSON
            return json.loads(response.text)['response'].strip()
        except requests.exceptions.RequestException as e:
            return f"Error communicating with Ollama: {e}"
        except Exception as e:
            return f"Error generating text with Ollama: {e}"


def get_llm_provider(provider_name: str, **kwargs) -> LLMProvider:
    """
    Factory function to get an instance of an LLM provider.

    :param provider_name: The name of the provider (e.g., 'openai', 'ollama').
    :param kwargs: Additional arguments for the provider's constructor.
    :return: An instance of the LLM provider.
    """
    if provider_name.lower() == 'openai':
        return OpenAIProvider(**kwargs)
    elif provider_name.lower() == 'ollama':
        return OllamaProvider(**kwargs)
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}")

if __name__ == '__main__':
    # Example usage (requires OPENAI_API_KEY to be set in the environment)
    # or Ollama to be running locally

    # Test OpenAI
    try:
        openai_provider = get_llm_provider('openai')
        prompt = "In a courtroom, the prosecutor said:"
        response = openai_provider.generate(prompt)
        print(f"OpenAI Response: {response}")
    except ValueError as e:
        print(e)

    # Test Ollama
    try:
        ollama_provider = get_llm_provider('ollama')
        prompt = "In a courtroom, the defense attorney said:"
        response = ollama_provider.generate(prompt)
        print(f"Ollama Response: {response}")
    except Exception as e:
        print(f"Could not connect to Ollama. Please make sure it is running. {e}")
