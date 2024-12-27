import { generateAnswerKeyboard } from "../keyboards/answerKeyboard.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
import "dotenv/config";

export const askQuestion = async (conversation, ctx) => {
	const beginning = await ctx.reply(
		"Введите Ваш вопрос, я сразу же передам его администратору",
		{
			reply_markup: cancelKeyboard,
		},
	);
	const questionCtx = await conversation.wait();
	const question = questionCtx.message?.text;
	if (!question) {
		questionCtx.msg.delete();
		return ctx.reply("Операция отменена", {
			reply_markup: toMainMenuKeyboard(),
		});
	}
	// console.log(beginning)
	await ctx.api.deleteMessage(beginning.chat.id, beginning.message_id);
	await ctx.api.sendMessage(
		762569950,
		`Вопрос от ${
			questionCtx.from.username
				? `@` + questionCtx.from.username
				: `Телеграм пользователя скрыт`
		}\n\n${question}`,
		{ reply_markup: generateAnswerKeyboard(questionCtx.from.id) },
	);
	await ctx.api.sendMessage(
		process.env.CHAT_ID,
		`Вопрос от ${
			questionCtx.from.username
				? `@` + questionCtx.from.username
				: `Телеграм пользователя скрыт`
		}\n\n${question}`,
		{ reply_markup: generateAnswerKeyboard(questionCtx.from.id) },
	);
	await ctx.reply("Ваш вопрос передан администратору!", {
		reply_markup: toMainMenuKeyboard(),
	});
};
