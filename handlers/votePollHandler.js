const { addPreference } = require("../db");

const votePollHandler = async (ctx, preference) => {
	// TODO: Создать опрос и отправить его в чат
	const tg_id = ctx.from.id;
	ctx.reply(`Спасибо за ответ! ${preference} - потрясающий выбор`);

	await addPreference({ preference, tg_id });
};

module.exports = { votePollHandler };
