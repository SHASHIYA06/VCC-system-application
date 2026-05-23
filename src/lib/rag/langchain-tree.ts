import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { prisma } from "@/lib/prisma";

// The Langchain Tree structure acts as a hierarchical Multi-Agent router.
// A Master Agent determines the intent, and routes to specialized leaf Agents.

const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview", // or any preferred model
  temperature: 0,
});

// 1. MASTER AGENT - Intent Router
const routerTemplate = `You are the VCC System Master Router Agent.
Analyze the user query and determine which specialized sub-agent should handle it.
Output exactly ONE word from the following options:
- DRAWINGS (if query is about drawing numbers, schematics, PDFs)
- WIRES (if query is about wire numbers, pin connections, harnesses)
- TRAINLINES (if query is about trainline logic, APS, TCMS, high voltage)
- GENERAL (for anything else)

User Query: {query}
Target Agent:`;

const routerPrompt = PromptTemplate.fromTemplate(routerTemplate);
const routerChain = RunnableSequence.from([
  routerPrompt,
  llm,
  new StringOutputParser(),
]);

// 2. LEAF AGENTS
const drawingsAgent = async (query: string) => {
  // Extract potential drawing numbers
  const drawings = await prisma.drawing.findMany({
    take: 5,
    // Add fuzzy search if needed
  });
  return `[Drawings Agent] Searched DB for drawings. Found ${drawings.length} results. Proceed to PDF viewer for mapping.`;
};

const wiresAgent = async (query: string) => {
  return `[Wires Agent] Searched SQL database for wire connections related to: ${query}. (Mock DB hit)`;
};

const trainlinesAgent = async (query: string) => {
  return `[Trainlines Agent] Extracted trainline logic for ${query} from Master Schema.`;
};

const generalAgent = async (query: string) => {
  const response = await llm.invoke(`Answer this general engineering query: ${query}`);
  return `[General Agent] ${response.content}`;
};

// 3. TREE EXECUTOR
export async function executeLangchainTree(query: string) {
  try {
    const route = (await routerChain.invoke({ query })).trim().toUpperCase();
    
    let result = '';
    switch(route) {
      case 'DRAWINGS':
        result = await drawingsAgent(query);
        break;
      case 'WIRES':
        result = await wiresAgent(query);
        break;
      case 'TRAINLINES':
        result = await trainlinesAgent(query);
        break;
      default:
        result = await generalAgent(query);
    }
    
    return {
      success: true,
      routeSelected: route,
      result
    };
  } catch (error) {
    console.error("Langchain Tree Error:", error);
    return { success: false, error: String(error) };
  }
}
