import { Annotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { LLM, Retriever } from "./RAG_class.js";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
dotenv.config();

const model = new LLM().model;

const StateAnnotation = Annotation.Root({
	messages: Annotation({
		reducer: (x, y) => x.concat(y),
	}),
});

const retriever = await new Retriever({
	splitter: new RecursiveCharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 100,
	}),
}).init(3);

const getInfo = tool(
	async ({ question }) => {
		console.log(question);
		const result = await retriever.invoke(question);
		// console.log(result);
		const response = result.map((r) => r.pageContent).join("\n\n");
		const prompt = PromptTemplate.fromTemplate(
			`Ты мастерски выделяешь главную суть в тексте. Твоя задача выделить информацию, которая относится к вопросу "{question}"
Если в этой информации не будет ответа на вопрос, ответь "Нет информации для ответа на вопрос"
Информация: {context}			
			`,
		);
		const chain = prompt.pipe(model).pipe(new StringOutputParser());
		const output = await chain.invoke({ context: response, question });
		console.log(output);
		return output;
	},
	{
		name: "get_info",
		description: "Получить информацию по вопросу",
		schema: z.object({
			question: z.string().describe("Вопрос"),
		}),
	},
);

const tools = [getInfo];
const toolNode = new ToolNode(tools);

function shouldContinue(state) {
	const messages = state.messages;
	const lastMessage = messages[messages.length - 1];
	// If the LLM makes a tool call, then we route to the "tools" node
	if (lastMessage.tool_calls?.length) {
		return "tools";
	}
	// Otherwise, we stop (reply to the user)
	return "__end__";
}

// Define the function that calls the model
async function callModel(state) {
	const modelWithTools = model.bindTools(tools);
	const systemPrompt = `Ты вежливый сотрудник техподдержки компании "Домосклад". Ищи ответы на все мои вопросы с помощью инструментов. Если не найдешь информацию с помощью инструмента, то ответь "Я не могу Вам с этим помочь. Попробуйте обратиться к администратору с помощью кнопки в стартовом меню".
Формат твоих ответов: избегай использования символов "*"	`;
	const messages = [
		{ role: "system", content: systemPrompt },
		...state.messages,
	];
	const response = await modelWithTools.invoke(messages);
	return { messages: [response] };
}

// Define a new graph
export const workflow = new StateGraph(StateAnnotation)
	.addNode("agent", callModel)
	.addNode("tools", toolNode)
	.addEdge("__start__", "agent")
	.addConditionalEdges("agent", shouldContinue)
	.addEdge("tools", "agent");
