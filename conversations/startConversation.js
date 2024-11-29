import { askContact } from "../keyboards/askContactKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";
import { delay, isValidCardNumber } from "../services.js";
import { skipKeyboard } from "../keyboards/skipKeyboard.js";
import { updateStartInfo } from "../db.js";

const handleInfo = async (ctx, { fio, cardNumber, phoneNumber }) => {
	const isValidCard = isValidCardNumber(cardNumber);
	if (isValidCard === true) {
		await ctx.reply(
			"Номер карты подтвержден\\. Вы всегда сможете поменять информацию о карте в личном кабинете",
			{ reply_markup: toMainMenuKeyboard() },
		);
		await updateStartInfo({
			tg_id: ctx.from.id,
			bankCard: cardNumber,
			phone_number: phoneNumber,
			fio,
		});
	} else {
		await updateStartInfo({
			tg_id: ctx.from.id,
			bankCard: null,
			phone_number: phoneNumber,
			fio,
		});
		if (isValidCard == "canceled") {
			return await ctx.reply(
				"Вы сможете добавить информацию о карте во вкладке __Профиль__",
				{
					reply_markup: toMainMenuKeyboard(),
				},
			);
		} else {
			await ctx.reply(
				"Невалидный номер карты\\. Вы сможете поменять информацию о карте в личном кабинете",
				{ reply_markup: toMainMenuKeyboard() },
			);
		}
	}
};

const askPhone = async (conversation, ctx) => {
	let i = 0;
	while (true) {
		if (i > 0) {
			await ctx.reply("Пожалуйста, воспользуйтесь кнопкой 👇 ", {
				reply_markup: askContact,
			});
		}
		const phoneCtx = await conversation.wait();
		const phoneNumber = phoneCtx.message?.contact?.phone_number;
		if (!phoneNumber) {
			i++;
			continue;
		}
		return phoneNumber;
	}
};

export const startConversation = async (conversation, ctx) => {
	const beginning = await ctx.reply("Пожалуйста, введите свои ФИО");
	const fioCtx = await conversation.wait();
	const fio = fioCtx.message?.text;
	if (!fio) {
		fioCtx.msg.delete();
		return ctx.reply("Операция отменена", {
			reply_markup: toMainMenuKeyboard(),
		});
	}
	// console.log(beginning)
	await ctx.reply("Укажите номер телефона 👇", {
		reply_markup: askContact,
	});
	// const phoneCtx = await conversation.wait();
	const phoneNumber = await askPhone(conversation, ctx);
	await ctx.reply("Спасибо\\! Подождите, пожалуйста, идёт обработка данных", {
		reply_markup: { remove_keyboard: true },
	});
	await delay(3000);
	await ctx.reply(
		"Введите номер карты, на которую Вам будут приходить деньги",
		{ reply_markup: skipKeyboard },
	);

	const cardCtx = await conversation.wait();
	const cardNumber = cardCtx?.message?.text;
	if (!cardNumber) {
		try {
			cardCtx.msg.delete();
		} catch (error) {}
		await ctx.api.answerCallbackQuery(cardCtx.update.callback_query.id);
	}
	await handleInfo(ctx, { cardNumber, phoneNumber, fio });
	// await ctx.api.deleteMessage(beginning.chat.id, beginning.message_id)
};
