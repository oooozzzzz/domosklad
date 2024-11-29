import { getOwnerPassword } from "../db.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toOwnerMenuKeyboard } from "../keyboards/toOwnerMenu.js";
import { setNewOwnerPassword } from "../password.js";

export const changeOwnerPassword = async (conversation, ctx) => {
	ctx.reply("Введите старый пароль владельца", {
		reply_markup: cancelKeyboard,
	});
	const curPasswordCtx = await conversation.wait();
	const curPassword = curPasswordCtx.message?.text;
	if (!curPassword) {
		curPasswordCtx.msg.delete();
		return await ctx.reply("Вы отменили смену пароля", {
			reply_markup: toOwnerMenuKeyboard,
		});
	}
	if (curPassword !== (await getOwnerPassword())) {
		return await ctx.reply(
			"Неверный пароль. Начните процедуру смены пароля заново.",
			{
				reply_markup: toOwnerMenuKeyboard,
			}
		);
	}
	ctx.reply(`Введите новый пароль`);
	const newPasswordCtx = await conversation.wait();
	const newPassword = newPasswordCtx.message.text;
	setNewOwnerPassword(newPassword);
	await ctx.reply("Новый пароль администратора установлен!", {
		reply_markup: toOwnerMenuKeyboard,
	});
};
