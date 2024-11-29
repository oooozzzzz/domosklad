import { Bot, session } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { I18n } from "@grammyjs/i18n";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { startMenu } from "./menus/startMenu.js";
import { v4 as uuidv4 } from "uuid";
import { adminMenu } from "./menus/adminMenu.js";
import { ownerMenu } from "./menus/ownerMenu.js";
import { changeAdminPassword } from "./conversations/changeAdminPassword.js";
import { changeOwnerPassword } from "./conversations/changeOwnerPassword.js";
import { answerQuestion } from "./conversations/answerConversation.js";
import { askQuestion } from "./conversations/askConversation.js";
import { notifyUsers } from "./conversations/notifyUsers.js";
import * as dotenv from "dotenv";
import { startConversation } from "./conversations/startConversation.js";
import { addPoints, checkUser } from "./conversations/addPointsConversation.js";
import { addCard } from "./conversations/addCardConversation.js";
import { withdrawConversation } from "./conversations/withdrawConversations.js";
dotenv.config();

const token = process.env.TOKEN;

export const bot = new Bot(token);

bot.use(hydrateReply);

// Set the default parse mode for ctx.reply.
// bot.api.config.use(parseMode("MarkdownV2"));

const i18n = new I18n({
	defaultLocale: "ru",
	useSession: true, // whether to store user language in session
	directory: "locales", // Load all translation files from locales/.
});

bot.use(hydrate());
bot.use(
	session({
		initial() {
			return {
				toChat: false,
				thread_id: uuidv4(),
			};
		},
	}),
);

bot.use(i18n);

bot.api.setMyCommands([
	{
		command: "start",
		description: "Перейте в главное меню",
	},
	{
		command: "profile",
		description: "Посмотреть свой профиль",
	},
]);

bot.use(conversations());
// bot.use(createConversation(setShopUrl));
bot.use(createConversation(changeAdminPassword));
bot.use(createConversation(changeOwnerPassword));
bot.use(createConversation(answerQuestion));
bot.use(createConversation(askQuestion));
bot.use(createConversation(addCard));
bot.use(createConversation(startConversation));
bot.use(createConversation(addPoints));
bot.use(createConversation(checkUser));
bot.use(createConversation(withdrawConversation));
bot.use(createConversation(notifyUsers));
bot.use(startMenu);
bot.use(adminMenu);
bot.use(ownerMenu);
