import { Menu, MenuRange } from "@grammyjs/menu";
import { delay, getAnswer } from "../services.js";
import { discountItem, discountsMenu } from "./discountsMenu.js";
import { getUserInfo } from "../db.js";
import { withdrawHandler } from "../handlers/withdrawHandler.js";
import { profileHandler } from "../handlers/profileHandler.js";
import { parse } from "dotenv";

export const startMenu = new Menu("startMenu", { autoAnswer: false })
	.text("👤 Профиль", async (ctx) => {
		ctx.answerCallbackQuery();
		ctx.session.toChat = false;
		await profileHandler(ctx);
	})
	.row()
	.text("💰 Списать баллы", async (ctx) => {
		ctx.session.toChat = false;
		// await withdrawHandler(ctx);
		ctx.menu.nav("backMenu");
		await ctx.msg.editText(
			"Для того, чтобы списать баллы, придите в пункт приема вторсырья. Он находится по адресу г. Тюмень, ул. Т. Чаркова, 81 стр. 1. Мы работаем в будни с 18.00 до 20.00 и в субботу с 15.00 до 18.00.\nМинимальная сумма списания - 500 рублей",
		);
	})
	.row()
	.text("ℹ️ Общая информация", async (ctx) => {
		ctx.answerCallbackQuery();
		ctx.menu.nav("backMenu");
		await ctx.msg.editText(
			`Наш пункт приема находится по адресу г. Тюмень, ул. Т. Чаркова, 81 стр. 1. Мы работаем в будни с 18.00 до 20.00 и в субботу с 15.00 до 18.00.  
Добро пожаловать!
Связаться с нами Вы можете по номеру телефона 8 (800) 222-95-27 (доб. 3), в пунктах приема или на нашем сайте eco.domosklad.com

Порядок начисления бонусных рублей:
1) Приходите в пункт приема вторсырья
2) Сдайте вторсырье и назовите администратору свой уникальный код, который можно посмотреть во вкладке "Профиль"
3) Получите бонусные рубли
`,
			{ parse_mode: "HTML" },
		);
		ctx.session.toChat = false;
	})
	.row()
	.text("📝 Написать администратору", async (ctx) => {
		ctx.answerCallbackQuery();

		ctx.session.toChat = false;
		try {
			await ctx.conversation.enter("askQuestion");
		} catch (error) {
			console.error(error);
		}
	})
	.row()
	.text("📞 Служба поддержки", async (ctx) => {
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
	await ctx.msg.editText(ctx.t("start"), {
		parse_mode: "HTML",
	});
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
		await ctx.msg.editText(ctx.t("start"), {
			parse_mode: "HTML",
		});
	});

startMenu.register([discountsMenu, discountItem, backMenu, profileMenu]);
