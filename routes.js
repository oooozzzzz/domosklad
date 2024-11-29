import { adminMenu } from "./menus/adminMenu.js";
import { ownerMenu } from "./menus/ownerMenu.js";
import { startMenu } from "./menus/startMenu.js";

export const toMainMenu = async (ctx, toDelete = false) => {
	try {
		toDelete ? await ctx.msg.delete() : null;
	} catch (error) {}
	await ctx.reply(ctx.t("start"), {
		reply_markup: startMenu,
	});
};

export const toAdminMenu = async (ctx, toDelete) => {
	try {
		toDelete ? await ctx.msg.delete() : null;
	} catch (error) {}
	await ctx.reply(`Доброй пожаловать в панель администратора`, {
		reply_markup: adminMenu,
	});
};

export const toOwnerMenu = async (ctx) => {
	try {
		await ctx.msg.delete();
	} catch (error) {}
	await ctx.reply(`Доброй пожаловать в панель владельца`, {
		reply_markup: ownerMenu,
	});
};
