import { updateName } from "../db.js";
import { generateAnswerKeyboard } from "../keyboards/answerKeyboard.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";

export const askName = async (conversation, ctx) => {
	const beginning = await ctx.reply(
		"Введите имя, которое будет отображаться в списке пользователей",
		{
			reply_markup: cancelKeyboard,
		},
	);
	const nameCtx = await conversation.wait();
	const name = nameCtx.message?.text;
	if (!name) {
		nameCtx.msg.delete();
		return ctx.reply("Операция отменена", {
			reply_markup: toMainMenuKeyboard(),
		});
	}
	const result = await updateName(nameCtx.message.from.id, name);
	if (!result) {
		return ctx.reply("Ошибка при обновлении имени", {
			reply_markup: toMainMenuKeyboard(),
		});
	}
	await ctx.reply("Имя обновлено", {
		reply_markup: toMainMenuKeyboard(),
	});
	await ctx.api.deleteMessage(beginning.chat.id, beginning.message_id);
};
