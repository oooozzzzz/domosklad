import { InlineKeyboard } from"grammy";

export const generateAnswerKeyboard = (id) => {
	const answerKeyboard = new InlineKeyboard().text(
		"Ответить пользователю",
		`question-${id}`
	);
	return answerKeyboard
}

