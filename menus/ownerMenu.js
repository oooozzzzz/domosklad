import { Menu } from "@grammyjs/menu";

export const ownerMenu = new Menu("ownerMenu")
	.text("Сменить пароль администратора", async (ctx) => {
		try {
			await ctx.msg.delete();
		} catch (error) {}
		await ctx.conversation.enter("changeAdminPassword");
	})
	.row()
	.text("Сменить пароль владельца", async (ctx) => {
		try {
			await ctx.msg.delete();
		} catch (error) {}
		await ctx.conversation.enter("changeOwnerPassword");
	})
	.row()
	.text("Закрыть", async (ctx) => {ctx.msg.delete()})
