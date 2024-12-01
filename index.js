import { clearOrder, getBookingData, signOrder } from "./bookingOrder.js";
import { bot } from "./bot.js";
import { getAdminPassword, getOwnerPassword, handleTransaction } from "./db.js";
import { clearSheet, reloadSheet } from "./googlesheet.js";
import { adminHandler } from "./handlers/adminHandler.js";
import { AIHandler } from "./handlers/AIHandler.js";
import { ownerHandler } from "./handlers/ownerHandler.js";
import { profileHandler } from "./handlers/profileHandler.js";
import { questionHandler } from "./handlers/questionsHandler.js";
import { startHandler } from "./handlers/startHandler.js";

import { startMenu } from "./menus/startMenu.js";
import { toAdminMenu, toMainMenu, toOwnerMenu } from "./routes.js";
import { createSheet, toPref } from "./services.js";

bot.command("start", async (ctx) => startHandler(ctx));
bot.command("chatid", async (ctx) => {
	await ctx.reply(ctx.chat.id);
});
bot.command("profile", async (ctx) => {
	await profileHandler(ctx);
});

bot.command("create", async (ctx) => {
	await reloadSheet();
});

bot.callbackQuery("toMenu", async (ctx) => {
	toMainMenu(ctx);
	ctx.answerCallbackQuery();
});
bot.callbackQuery("yes", async (ctx) => {
	ctx.answerCallbackQuery();
	const adminId = ctx.update.callback_query.message.chat.id;
	const transaction = getBookingData(adminId);
	clearOrder(adminId);
	const result = await handleTransaction(transaction);
	if (!result) {
		await ctx.reply("Транзакция не прошла");
		return;
	}
	await ctx.reply("Транзакция прошла успешно");
	await ctx.api.sendMessage(
		transaction.clientId,
		`Вам начислено __${transaction.points} 	баллов__\\. Вы можете списать их прямо сейчас\\!`,
		{ parse_mode: "MarkdownV2" },
	);
	// await ctx.conversation.enter("checkUser");
	ctx.answerCallbackQuery();
});
bot.callbackQuery("toAdminMenu", async (ctx) => {
	toAdminMenu(ctx);
	ctx.answerCallbackQuery();
});
bot.callbackQuery("toOwnerMenu", async (ctx) => {
	toOwnerMenu(ctx);
	ctx.answerCallbackQuery();
});
bot.callbackQuery("ok", async (ctx) => {
	ctx.answerCallbackQuery();
});
bot.callbackQuery("cancel", async (ctx) => {
	try {
		ctx.msg.delete();
	} catch (error) {}
	ctx.conversation.exit();
	ctx.answerCallbackQuery();
});

bot.callbackQuery("correct", async (ctx) => {
	console.log(ctx.callbackQuery.data);
	// await ctx.conversation.enter("addPoints");
	const res = toPref(ctx);
	console.log(res);
});

bot.callbackQuery("cancelTransaction", async (ctx) => {
	try {
		// ctx.msg.delete();
	} catch (error) {}
	ctx.conversation.exit();
	ctx.answerCallbackQuery();
	await toAdminMenu(ctx);
});

bot.on(":text", async (ctx) => {
	const text = ctx.msg.text;
	switch (text) {
		case await getAdminPassword():
			await adminHandler(ctx);
			break;
		case await getOwnerPassword():
			await ownerHandler(ctx);
			break;
		default:
			await AIHandler(ctx);
			break;
	}
});

bot.on(":contact", async (ctx) => {});

bot.callbackQuery(/-/, async (ctx) => {
	// Взаимодействие с категориями
	// try {
	// 	await ctx.msg.delete();
	// } catch (error) {}

	const { preference, action } = toPref(ctx);
	switch (action) {
		case "pref":
			try {
				votePollHandler(ctx, preference);
			} catch (error) {}
			break;
		case "question":
			ctx.session.userId = preference;
			await questionHandler(ctx);
			break;
		case "correct":
			const adminId = ctx.update.callback_query.message.chat.id;
			const clientId = preference;
			signOrder(adminId, { clientId, adminId });
			await ctx.conversation.enter("addPoints");
		default:
			break;
	}
	ctx.answerCallbackQuery();
});

bot.catch((error) => {
	console.error(error);
	bot.start();
});
bot.start();
