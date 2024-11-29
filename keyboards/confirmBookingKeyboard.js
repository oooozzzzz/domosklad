import { InlineKeyboard } from "grammy";

export const confirmBookingKeyboard = new InlineKeyboard()
	.text("Да, все верно", "yes")
	.row()
	.text("Заполнить анкету заново", "no")
	.row()
	.text("Отменить", "cancelTransaction");
