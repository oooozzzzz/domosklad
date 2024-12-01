import { Menu, MenuRange } from "@grammyjs/menu";
import { delay, getAnswer } from "../services.js";
import { discountItem, discountsMenu } from "./discountsMenu.js";
import { getUserInfo } from "../db.js";
import { withdrawHandler } from "../handlers/withdrawHandler.js";
import { profileHandler } from "../handlers/profileHandler.js";

export const startMenu = new Menu("startMenu", { autoAnswer: false })
	.text("Профиль", async (ctx) => {
		ctx.answerCallbackQuery();
		ctx.session.toChat = false;
		await profileHandler(ctx);
	})
	// .row()
	// .text("Баланс баллов", async (ctx) => {
	// 	ctx.session.toChat = false;
	// 	const userId = ctx.update.callback_query.message.chat.id;
	// 	const userInfo = await getUserInfo(userId);
	// 	ctx.menu.nav("backMenu");
	// 	await ctx.msg.editText(`Баллов на счету: ${userInfo.pointsNow}`);
	// })
	.row()
	.text("Списать баллы", async (ctx) => {
		ctx.session.toChat = false;
		await withdrawHandler(ctx);
	})
	.row()
	.text("Общая информация", async (ctx) => {
		ctx.answerCallbackQuery();
		ctx.session.toChat = false;
	})
	.row()
	.text("Написать администратору", async (ctx) => {
		ctx.answerCallbackQuery();

		ctx.session.toChat = false;
		try {
			await ctx.conversation.enter("askQuestion");
		} catch (error) {
			console.error(error);
		}
	})
	.row()
	.text("Служба поддержки", async (ctx) => {
		ctx.session.toChat = true;
		ctx.answerCallbackQuery();
		await ctx.reply(`Соеднияем с чатом поддержки... 
Чтобы покинуть диалог, просто перейдите в главное меню командой /start`);
		await ctx.api.sendChatAction(ctx.from.id, "typing");
		await delay(3000);
		await ctx.reply("Здравствуйте! Чем могу помочь?");
	});

const backMenu = new Menu("backMenu").text("Назад", async (ctx) => {
	ctx.menu.nav("startMenu");
	await ctx.msg.editText(ctx.t("start"));
});

export const profileMenu = new Menu("profileMenu")
	.text("Изменить карту", async (ctx) => {
		await ctx.conversation.enter("addCard");
	})
	.row()
	.text("Изменить ФИО", async (ctx) => {
		await ctx.conversation.enter("askName");
	})
	.row()
	.text("Назад", async (ctx) => {
		ctx.menu.nav("startMenu");
		await ctx.msg.editText(ctx.t("start"));
	});

startMenu.register([discountsMenu, discountItem, backMenu, profileMenu]);
