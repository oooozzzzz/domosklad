import { getUserInfo } from "../db.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { WithdrawKeyboard } from "../keyboards/withdrawKeyboard.js";

export const checkPoints = async (conversation, ctx) => {
	await ctx.reply("Введите id пользователя", { reply_markup: cancelKeyboard });
	const userIdCtx = await conversation.wait();
	const userId = userIdCtx.message?.text;
	if (!userId) {
		userIdCtx.msg.delete();
		return ctx.reply("Операция отменена", {
			reply_markup: toMainMenuKeyboard(),
		});
	}
	const userInfo = await getUserInfo(userId);
	if (!userInfo) return ctx.reply("Пользователь не найден");
	await ctx.replyWithMarkdownV2(
		`Пользователь *${userInfo.fio}*
Баллов на счету: ${userInfo.pointsNow}
Номер карты: *${userInfo.bankCard}*
Использейте кнопки, чтобы продолжить`,
		{ reply_markup: WithdrawKeyboard(userId) },
	);
};
