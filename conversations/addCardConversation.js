import { addCardNumber } from "../db.js";
import { cancelKeyboard } from "../keyboards/cancelKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
import { toMainMenu } from "../routes.js";
import { isValidCreditCardNumber } from "../services.js";

export const addCard = async (conversation, ctx) => {
	const beginning = await ctx.reply("Введите номер своей банковской карты", {
		reply_markup: cancelKeyboard,
	});
	while (true) {
		const answerCtx = await conversation.wait();
		let card = answerCtx.message?.text;
		card = card.replace(/\s/g, "");
		if (!card) {
			answerCtx.msg.delete();
			return await ctx.reply("Вы отменили добавление карты", {
				reply_markup: toMainMenuKeyboard(),
			});
		}
		if (isValidCreditCardNumber(card)) {
			const userId = answerCtx.msg.from.id;
			if (await addCardNumber(card, userId)) {
				await ctx.reply("Карта добавлена", {
					reply_markup: toMainMenuKeyboard(),
				});
			} else {
				await ctx.reply("Ошибка при добавлении карты");
			}
			break;
		} else {
			await ctx.reply(
				"Указан некорректный номер карты\\. Пожалуйста\\, проверьте правильность вводимых данных",
				{ reply_markup: cancelKeyboard },
			);
			continue;
		}
	}
};
