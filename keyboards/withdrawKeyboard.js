import { InlineKeyboard } from "grammy";

export const WithdrawKeyboard = (id) =>
	new InlineKeyboard()
		.text("Создать запись о списании", `withdraw-${id}`)
		.row()
		.text("Отмена", `cancel`);
