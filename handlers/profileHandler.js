import { parseMode } from "@grammyjs/parse-mode";
import { getUserInfo } from "../db.js";
import { profileMenu } from "../menus/startMenu.js";
import { formatBankCard } from "../services.js";

export const profileHandler = async (ctx) => {
	try {
	} catch (error) {}
	let userId;
	if (ctx?.update?.callback_query?.message?.chat?.id) {
		userId = ctx.update.callback_query.message.chat.id;
	} else {
		await ctx.msg.delete();
		userId = ctx.msg.from.id;
	}
	const userInfo = await getUserInfo(userId);
	const text = `Информаиция о Вашем профиле:
Рублей на счету: *${userInfo.pointsNow}*
Уникальный код: *${userInfo.tg_id}*
ФИО: *${userInfo.fio}*
Номер телефона: *${"\\" + userInfo.phone_number}*
Номер банковской карты: 
__*${
		userInfo.bankCard === "Не указан"
			? "Не указан"
			: formatBankCard(userInfo.bankCard)
	}*__
Рублей выведено: *${userInfo.pointsWithdrawn}*
Сдано бумаги: *${userInfo.paperTaken}*
Сдано алюминиевых банок: *${userInfo.cansTaken}*	
Сдано картона: *${userInfo.cardboardTaken}*
Сдано ПЭТ: *${userInfo.petTaken}*
Сдано других материалов: *${userInfo.otherTaken}*
	`;
	// await ctx.reply(text, { reply_markup: profileMenu });
	if (ctx?.update?.callback_query?.message?.chat?.id) {
		ctx.menu.nav("profileMenu");
		await ctx.msg.editText(text, { parse_mode: "markdownV2" });
		return;
	}
	await ctx.replyWithMarkdownV2(text, { reply_markup: profileMenu });
};
