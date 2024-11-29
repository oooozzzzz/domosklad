import { InlineKeyboard } from"grammy";


export const confirmKeyboard = new InlineKeyboard()
	.text("Подтвердить", "ok")
	.row()
	.text("Отмена", "cancel");

