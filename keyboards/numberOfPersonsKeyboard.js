import { Keyboard } from "grammy";

export const numberOfPersonsKeyboard = new Keyboard()
	.text("1")
	.text("2")
	.text("3")
	.row()
	.text("4")
	.text("5")
	.text("6")
	.row()
	.text("6 и более")
	.resized(true)
	.oneTime(true);
