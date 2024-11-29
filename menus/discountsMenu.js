import { Menu, MenuRange } from "@grammyjs/menu";

const menu = [
	{ label: "Женский день в понедельник", text: "womens_day_text" },
	{ label: "Скидка в День Рождения", text: "bd_text" },
	{ label: "Скидка на самовывоз", text: "takeaway_text" },
	{ label: "Бизнес-ланчи по будням", text: "lanches_text" },
];

export const discountsMenu = new Menu("discountsMenu").dynamic(() => {
	const range = new MenuRange();
	menu.forEach((item) => {
		range.text(item.label, async (ctx) => {
			ctx.menu.nav("discountItem");
			await ctx.msg.editText(ctx.t(item.text));
		});
		range.row();
	});
	range.text("Назад", async (ctx) => {
		ctx.menu.nav("startMenu")
		await ctx.msg.editText(ctx.t("start"));
	})
	return range;
});

export const discountItem = new Menu("discountItem").text(
	"Назад",
	async (ctx) => {
		ctx.menu.nav("discountsMenu");
		await ctx.msg.editText(ctx.t("discounts_menu"));
	}
);
