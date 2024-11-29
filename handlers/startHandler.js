import { createUser, getUserInfo } from "../db.js";
import { startMenu } from "../menus/startMenu.js";
import { createSheet, delay, newThread } from "../services.js";

export const startHandler = async (ctx) => {
	await ctx.msg.delete();
	await newThread(ctx);
	if (ctx.session.toChat) {
		await ctx.reply("Диалог со службой поддержки завершен.");
		await delay(1500);
	}
	ctx.session.toChat = false;
	await createUser(ctx.from.id, ctx.from.first_name);
	const user = await getUserInfo(ctx.from.id);
	if (user.fio === "Не указан") {
		await ctx.conversation.enter("startConversation");
	} else {
		await ctx.reply(ctx.t("start"), {
			reply_markup: startMenu,
		});
	}
};
