import { getUserInfo } from "../db.js";

export const withdrawHandler = async (ctx) => {
	const userId = ctx.update.callback_query.message.chat.id;
	const userInfo = await getUserInfo(userId);
	if (userInfo.bankCard === "Не указан") {
		await ctx.reply(`У вас не указана банковская карта`);
		return await ctx.conversation.enter("addCard");
	}
	if (userInfo.pointsNow === 0) {
		console.log("No points");
		// await ctx.api.answerCallbackQuery({
		// 	callback_query_id: ctx.update.callback_query.id,
		// 	text: "У вас нет баллов на счету",
		// 	show_alert: true,
		// });
		await ctx.answerCallbackQuery({
			text: "У вас нет баллов на счету",
			show_alert: true,
		});
		return;
	}
	if (userInfo.pointsNow > 0) {
		await ctx.answerCallbackQuery();
		await ctx.conversation.enter("withdrawConversation");
	}
};
