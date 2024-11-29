const { getUserDiscounts } = require("../db");

const discountsHandler = async (ctx) => {
	const discounts = await getUserDiscounts(ctx.from.id);
	console.log(discounts)
	if (discounts.length > 0) {
		console.log(ctx)
		ctx.menu.nav("my-discounts-menu");
		ctx.msg.editText(ctx.t("my_discounts_text"));
	} else {
		await ctx.api.answerCallbackQuery(ctx.update.callback_query.id, {
			text: "У вас пока нет доступных скидок",
			show_alert: true
		});
	}
};

module.exports = { discountsHandler };
