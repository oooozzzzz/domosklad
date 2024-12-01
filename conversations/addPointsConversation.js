import { getBookingData, signOrder } from "../bookingOrder.js";
import { getUserInfo } from "../db.js";
import { confirmBookingKeyboard } from "../keyboards/confirmBookingKeyboard.js";
import { numberOfPersonsKeyboard } from "../keyboards/numberOfPersonsKeyboard.js";
import { confirmUserKeyboard } from "../keyboards/skipKeyboard.js";
import { timePickKeyboard } from "../keyboards/timePickKeyboard.js";
import { toAdminMenuKeyboard } from "../keyboards/toAdminMenuKeyboard.js";
import { toMainMenuKeyboard } from "../keyboards/toMainMenuKeyboard.js";

const ask = async (conversation, ctx, question, item) => {
	let markup;
	switch (item) {
		case "time":
			markup = timePickKeyboard;
			break;
		case "guests":
			markup = numberOfPersonsKeyboard;
			break;
		case "wishes":
			markup = { remove_keyboard: true };
			break;
		default:
			markup = { remove_keyboard: true };
	}
	await ctx.reply(question, { reply_markup: markup });
	const { message } = await conversation.wait();
	if (message?.text) {
		ctx.session[item] = message?.text;
		return message?.text;
	} else {
		return false;
	}
};

const makeOrder = async (conversation, ctx) => {
	const cardboard = await ask(
		conversation,
		ctx,
		"Сколько грамм картона сдано?",
		"cardboard",
	);
	if (!cardboard) {
		return ctx.reply("Операция отменена", {
			reply_markup: toAdminMenuKeyboard,
		});
	}
	const pet = await ask(conversation, ctx, " сколько грамм ПЭТ сдано?", "pet");
	if (!pet) {
		return ctx.reply("Операция отменена", {
			reply_markup: toAdminMenuKeyboard,
		});
	}
	const cans = await ask(
		conversation,
		ctx,
		"Сколько грамм алюминиевых банок сдано?",
		"cans",
	);
	const paper = await ask(
		conversation,
		ctx,
		"Сколько грамм бумаги сдано?",
		"paper",
	);

	if (!paper) {
		return ctx.reply("Операция отменена", {
			reply_markup: toAdminMenuKeyboard,
		});
	}
	const other = await ask(
		conversation,
		ctx,
		"Сколько грамм других материалов сдано?",
		"other",
	);
	if (!other) {
		return ctx.reply("Операция отменена", {
			reply_markup: toAdminMenuKeyboard,
		});
	}
	const points = await ask(
		conversation,
		ctx,
		"Сколько баллов начислить?",
		"points",
	);

	const adminId = ctx.update.callback_query.message.chat.id;
	const data = getBookingData(adminId);
	const clientId = data.clientId;
	const clientInfo = await getUserInfo(clientId);
	await ctx.reply(
		`Информация о транзакции\\.
Сдал: ${clientInfo.fio}
Сдано
Картона: ${ctx.session.cardboard} грамм
ПЭТ: ${ctx.session.pet} грамм
Алюминиевых банок: ${ctx.session.cans} грамм
Бумаги: ${ctx.session.paper} грамм
Других материалов: ${ctx.session.other} грамм
Начислить баллов: ${ctx.session.points}
Все верно?
`,
		{ reply_markup: confirmBookingKeyboard },
	);
	const order = ctx.session;
	delete order.toChat;
	delete order.thread_id;
	return order;
};

export const checkUser = async (conversation, ctx) => {
	const userId = await ask(
		conversation,
		ctx,
		"Введите id пользователя",
		"userId",
	);
	const userInfo = await getUserInfo(userId);
	if (!userInfo) return ctx.reply("Пользователь не найден");
	await ctx.replyWithMarkdownV2(
		`Пользователь __${userInfo.fio}__
Используйте кнопки, чтобы продолжить`,
		{ reply_markup: confirmUserKeyboard(userId) },
	);
};

export const addPoints = async (conversation, ctx) => {
	const details = await makeOrder(conversation, ctx);
	signOrder(ctx.from.id, details);
};
