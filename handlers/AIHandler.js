import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
// import { loader } from "../loaders.js";
import { clearMessageHistory, getAnswer, newThread } from "../services.js";
import { v4 as uuidv4 } from "uuid";
import { Graph } from "../RAG_class.js";
import { workflow } from "../basic_workflow.js";

export const agent = new Graph({ workflow: workflow }).init();
// console.log(
// 	await agent.ask("Что делают из переработанных ПЭТ-бутылок?", "123"),
// );
export const AIHandler = async (ctx) => {
	if (ctx.session.toChat) {
		const thread = ctx.session.thread_id;
		const response = await agent.ask(ctx.message.text, thread);
		await ctx.reply(response);
	}
};
