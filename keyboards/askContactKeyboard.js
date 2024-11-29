import { Keyboard } from "grammy";

export const askContact = new Keyboard()
	.requestContact("Отправить номер телефона")
	.oneTime(true)
	.resized(true);
