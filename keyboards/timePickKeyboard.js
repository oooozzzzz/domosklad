import { Keyboard } from "grammy";

export const timePickKeyboard = new Keyboard()
	.text("12:00")
	.text("13:00")
	.text("14:00")
	.text("15:00")
	.row()
	.text("16:00")
	.text("17:00")
	.text("18:00")
	.text("19:00")
	.row()
	.text("20:00")
	.text("21:00")
	.text("22:00")
	.text("23:00")
	.resized()
	.oneTime(true);
