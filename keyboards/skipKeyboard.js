import { InlineKeyboard } from "grammy";

export const skipKeyboard = new InlineKeyboard().text(
	"Пропустить",
	`skip`,
);
export const confirmUserKeyboard = (id) => {
	return new InlineKeyboard()
		.text("Подтвердить", "correct-" + id)
		.row()
		.text("Отменить", "cancel");
};
