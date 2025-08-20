import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class LLMInterface {
  constructor(options = {}) {
    const { apiKey = process.env.OPENAI_API_KEY, baseURL = process.env.OPENAI_BASE_URL } = options;
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async complete(prompt, model = 'gpt-3.5-turbo') {
    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }
}

export class CourtroomAgent {
  constructor(role, name, personality, llm) {
    this.role = role;
    this.name = name;
    this.personality = personality;
    this.llm = llm;
  }

  async act(context) {
    const prompt = `${this.role} ${this.name} (${this.personality}) responding to: ${context}`;
    return this.llm.complete(prompt);
  }
}
