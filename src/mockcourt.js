import { LLMInterface, CourtroomAgent } from './agents.js';

const llm = new LLMInterface();

const judge = new CourtroomAgent('Judge', 'Alex Kim', 'stern but fair', llm);
const prosecutor = new CourtroomAgent('Prosecutor', 'Dana Lee', 'methodical', llm);
const defense = new CourtroomAgent('Defense', 'Riley Chen', 'empathetic', llm);

async function runDemo() {
  const opening = 'State your opening statement for a burglary case.';
  console.log('Judge:', await judge.act('Start the session.'));
  console.log('Prosecutor:', await prosecutor.act(opening));
  console.log('Defense:', await defense.act(opening));
}

runDemo();
