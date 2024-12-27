import { Menu } from "@grammyjs/menu";

export const adminMenu = new Menu("adminMenu")
	.text("Оповестить пользователей", async (ctx) => {
		ctx.msg.delete();
		await ctx.conversation.enter("notifyUsers");
	})
	.row()
	.text("Начислить баллы", async (ctx) => {
		// ctx.msg.delete();
		await ctx.conversation.enter("checkUser");
		// await ctx.reply("Начислить баллы");
	})
	.row()
	.text("Списать баллы", async (ctx) => {
		await ctx.conversation.enter("checkPoints");
	})
	.row()
	.url(
		"Отчеты",
		"https://docs.google.com/spreadsheets/d/1Uc8g9B0JcqmMeN8qbIK7Np3kttsnoaq-6M0Ll-cZrgQ/edit?gid=1233450005#gid=1233450005",
	)
	.row()
	.text("Закрыть", async (ctx) => {
		ctx.msg.delete();
	});
