import { addCardNumber, getUserInfo, handleWithdrawal } from "../db.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { confirmKeyboard } from "../keyboards/confirmKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
import { toMainMenu } from "../routes.js";

export const withdrawConversation = async (conversation, ctx) => {
	const userId = ctx.update.callback_query.message.chat.id;
	const userInfo = await getUserInfo(userId);
	await ctx.replyWithMarkdownV2(
		` У вас на счету __${userInfo.pointsNow}__ баллов\\.
Сколько вы хотите списать?`,
		{
			reply_markup: cancelKeyboard,
		},
	);
	while (true) {
		const answerCtx = await conversation.wait();
		const points = parseInt(answerCtx.message?.text);
		if (!points) {
			// console.log(answerCtx);
			await answerCtx.update.callback_query.message.delete();
			return await ctx.reply("Вы отменили списание баллов", {
				reply_markup: toMainMenuKeyboard(),
			});
		}
		if (points > userInfo.pointsNow) {
			await ctx.reply(
				"Недостаточно баллов на счету. Введите другое количество",
				{
					reply_markup: cancelKeyboard,
				},
			);
			continue;
		}
		if (points == NaN) {
			await ctx.reply(
				"Сумма списываемых баллов должна быть числом. Введите корректное значение",
				{
					reply_markup: cancelKeyboard,
				},
			);
			continue;
		}
		if (points == 0) {
			await ctx.reply(
				"Сумма списываемых баллов должна быть больше нуля. Введите другое количество",
				{
					reply_markup: cancelKeyboard,
				},
			);
			continue;
		}
		if (points <= userInfo.pointsNow) {
			await ctx.replyWithMarkdownV2(
				`С Вашего счета будет списано __${points}__ баллов\\. Начислим на Вашу карту *${points}* рублей`,
				{
					reply_markup: confirmKeyboard,
				},
			);
			const confirmation = await conversation.waitForCallbackQuery(
				["ok", "cancel"],
				{
					otherwise: async (ctx) => {
						await ctx.reply("Пожалуйста, воспользуйтесь кнопками", {
							reply_markup: confirmKeyboard,
						});
					},
				},
			);
			if (confirmation.match === "ok") {
				console.log(confirmation);
				await handleWithdrawal(userId, points);
				await ctx.replyWithMarkdownV2(
					"Вы списали __" + points + "__ баллов\\.",
					{
						reply_markup: toMainMenuKeyboard(),
					},
				);
				await confirmation.update.callback_query.message.delete();
				break;
			} else {
				await ctx.reply("Вы отменили списание баллов", {
					reply_markup: toMainMenuKeyboard(),
				});
				await confirmation.update.callback_query.message.delete();
				break;
			}
		}
	}
};
