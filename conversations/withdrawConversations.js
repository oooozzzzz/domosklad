import { addCardNumber, getUserInfo, handleWithdrawal } from "../db.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
import { toMainMenu } from "../routes.js";

export const withdrawConversation = async (conversation, ctx) => {
	const userId = ctx.update.callback_query.message.chat.id;
	const userInfo = await getUserInfo(userId);
	await ctx.reply(
		` У вас на счету __${userInfo.pointsNow}__ баллов\\.
Сколько вы хотите списать?`,
		{
			reply_markup: cancelKeyboard,
		},
	);
	while (true) {
		const answerCtx = await conversation.wait();
		const points = answerCtx.message?.text;
		if (!points) {
			// console.log(answerCtx);
			await answerCtx.update.callback_query.message.delete();
			return await ctx.reply("Вы отменили списание баллов", {
				reply_markup: toMainMenuKeyboard(),
			});
		}
		if (points > userInfo.pointsNow) {
			await ctx.reply(
				"Недостаточно баллов на счету\\. Введите другое количество",
				{
					reply_markup: cancelKeyboard,
				},
			);
			continue;
		}
		if (points <= userInfo.pointsNow) {
			handleWithdrawal(userId, points);
			await ctx.reply("Вы списали __" + points + "__ баллов\\.", {
				reply_markup: toMainMenuKeyboard(),
			});
			break;
		}
	}
};
