import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toAdminMenuKeyboard } from "../keyboards/toAdminMenuKeyboard.js";
import { copyMessageToUsers } from "../services.js";

export const notifyUsers = async (conversation, ctx) => {
	const req = await ctx.reply(
		"Введите или перешлите сообщение, которое будет отправлено всем пользователям",
		{ reply_markup: cancelKeyboard }
	);
	const notificationCtx = await conversation.wait();
	if (!notificationCtx.message) {
		await notificationCtx.msg.delete();
		return ctx.reply("Операция была отменена", {
			reply_markup: toAdminMenuKeyboard,
		});
	}
	await ctx.reply(
		"Рассылка началась. Это займет некоторое время. После завершения рассылки Вы увидите сообщение с отчетом."
	);
	await copyMessageToUsers(notificationCtx);
};

