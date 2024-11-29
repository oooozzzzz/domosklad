import { InlineKeyboard } from"grammy";


export const toMainMenuKeyboard = () => {
	const menu = new InlineKeyboard()
		.text("Продолжить работу с ботом", "toMenu");
	return menu;
};

