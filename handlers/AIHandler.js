import { Graph } from "../RAG_class.js";
import { workflow } from "../basic_workflow.js";
import "dotenv/config";

export const agent = new Graph({ workflow: workflow }).init();
// console.log(
// 	await agent.ask("Что делают из переработанных ПЭТ-бутылок?", "123"),
// );
export const AIHandler = async (ctx) => {
	if (ctx.session.toChat) {
		const thread = ctx.session.thread_id;
		const response = await agent.ask(ctx.message.text, thread);
		await ctx.reply(response);
		await ctx.api.sendMessage(
			process.env.CHAT_ID,
			`#Вопрос_ИИ\nВопрос от @${ctx.from.username}: ${ctx.message.text}\n\nОтвет: ${response}`,
		);
	}
};
