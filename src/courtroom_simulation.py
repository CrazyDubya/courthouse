import sys
import os
import json
import asyncio
from enum import Enum, auto

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tinytroupe.agent import TinyPerson
from case_manager import load_case, Case

class TrialPhase(Enum):
    PRE_TRIAL, OPENING_STATEMENTS, WITNESS_EXAMINATION, CLOSING_STATEMENTS, DELIBERATION, VERDICT = auto(), auto(), auto(), auto(), auto(), auto()

class SimulationController:
    def __init__(self, case: Case, agents: dict, websocket, user_input_queue: asyncio.Queue):
        self.case = case
        self.agents = agents
        self.websocket = websocket
        self.user_input_queue = user_input_queue
        self.phase = TrialPhase.PRE_TRIAL

    async def send_event(self, event_data: dict):
        if self.websocket:
            await self.websocket.send(json.dumps(event_data))

    async def get_agent_action(self, agent: TinyPerson, prompt: str) -> str:
        agent.listen(prompt)
        if agent.is_user_controlled:
            await self.send_event({"event": "request_user_input", "role": agent.persona.get("role", "unknown")})
            user_message = await self.user_input_queue.get()
            agent.memory.append(f"Said: {user_message}")
            return user_message
        else:
            return agent.act()

    async def run(self):
        await self.send_event({"event": "trial_starts", "case_title": self.case.title})
        self.phase = TrialPhase.OPENING_STATEMENTS
        await self.run_opening_statements()
        await self.send_event({"event": "trial_finished"})
        print("Trial simulation finished.")

    async def run_opening_statements(self):
        await self.send_event({"event": "phase_starts", "phase": "Opening Statements"})

        prosecutor = self.agents['prosecutor']
        defense_lawyer = self.agents['defense_lawyer']

        prompt_p = f"The trial for '{self.case.title}' has begun. As the prosecutor, present your opening statement. Summarize the case: {self.case.summary}."
        prosecutor_statement = await self.get_agent_action(prosecutor, prompt_p)
        await self.send_event({"event": "agent_speaks", "agent_name": prosecutor.persona['name'], "message": prosecutor_statement})
        await asyncio.sleep(1)

        prompt_d = f"Thank you, {prosecutor.persona['name']}. Now, {defense_lawyer.persona['name']}, you may present your opening statement."
        defense_statement = await self.get_agent_action(defense_lawyer, prompt_d)
        await self.send_event({"event": "agent_speaks", "agent_name": defense_lawyer.persona['name'], "message": defense_statement})
        await asyncio.sleep(1)

def create_courtroom_agents(case: Case, llm_provider: str = 'ollama'):
    agents = {}

    judge = TinyPerson("Judge Reynolds", llm_provider=llm_provider)
    judge.define("age", 65)
    judge.define("occupation", {"title": "Judge", "organization": "District Court"})
    judge.define("personality", {"traits": ["impartial", "stern", "knowledgeable in law", "patient"]})
    agents["judge"] = judge

    prosecutor = TinyPerson(case.plaintiff['lawyer'], llm_provider=llm_provider)
    prosecutor.define("age", 35)
    prosecutor.define("occupation", {"title": "Prosecutor", "organization": "District Attorney's Office"})
    prosecutor.define("personality", {"traits": ["ambitious", "skilled orator", "determined", "believes in evidence"]})
    agents["prosecutor"] = prosecutor

    defense_lawyer = TinyPerson(case.defendant['lawyer'], llm_provider=llm_provider)
    defense_lawyer.define("age", 42)
    defense_lawyer.define("occupation", {"title": "Defense Lawyer", "organization": "Faye & Associates"})
    defense_lawyer.define("personality", {"traits": ["charismatic", "persuasive", "staunch defender", "empathetic"]})
    agents["defense_lawyer"] = defense_lawyer

    return agents
