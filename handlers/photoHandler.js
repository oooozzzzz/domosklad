const { client, directive } = require("../openai");

const initConversation = [{ role: "system", content: directive }];
let conversation = [...initConversation];
module.exports = async (ctx, text) => {
	const name = ctx.from.first_name
	const file = await ctx.getFile(); // valid for at least 1 hour
	const path = file.file_path; // file path on Bot API server
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${path}`;

	console.log(name + " " + text);
	const message = {
		role: "user",
		content: [
			{ type: "text", text },
			{ type: "image_url", image_url: { url: url } },
		],
	};
	conversation.push(message);
	ctx.api.sendChatAction(ctx.from.id, "typing");
	const chatCompletion = await client.chat.completions.create({
		messages: conversation,
		model: "gpt-4o-mini",
	});
	const response = chatCompletion.choices[0].message;
	conversation.push(response);
	console.log("АССИСТЕНТ " + response.content);
	await ctx.reply(response.content);
};
