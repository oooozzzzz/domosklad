import { HumanMessage, RemoveMessage } from "@langchain/core/messages";
import * as XLSX from "xlsx/xlsx.mjs";
import * as fs from "fs";
import http from "http";
import { getAllUsers, getAllUsersData } from "./db.js";
import https from "https";
import { Readable } from "stream";
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import dotenv from "dotenv";
import { toAdminMenuKeyboard } from "./keyboards/toAdminMenuKeyboard.js";
import { v4 as uuidv4 } from "uuid";
import sqlite3 from "sqlite3";
import { addUser } from "./googlesheet.js";
import moment from "moment";
import { agent } from "./handlers/AIHandler.js";
dotenv.config();
XLSX.set_fs(fs);
XLSX.stream.set_readable(Readable);

export function combineDocuments(docs) {
	return docs.map((doc) => doc.pageContent).join("\n\n");
}

export const getAnswer = async (input, thread_id) => {
	console.log(input);
	const config = { configurable: { thread_id: thread_id } };
	try {
		const agentFinalState = await agent.invoke(
			{ messages: [new HumanMessage(input)] },
			config,
		);

		// console.log((await agent.getState(config)).values.messages);
		// console.log(agent.messages);

		const response =
			agentFinalState.messages[agentFinalState.messages.length - 1];
		const output = await parser.invoke(response);
		return output;
	} catch (error) {
		console.log(error);
	}
};

async function asyncForEach(arr, callback) {
	for (let i = 0; i < arr.length; i++) await callback(arr[i], i, arr);
}

export const convertFileToCSV = async (inputFilename, outputFilename) => {
	const buf = readFileSync(inputFilename);
	const workbook = read(buf);
	const ws = workbook.Sheets[workbook.SheetNames[0]];

	const csv = XLSX.utils.sheet_to_csv(ws, {
		// FS: ",",
		// RS: ";",
	});
	// console.log(csv);

	fs.writeFile(
		"./menu.csv",
		csv,
		(err) => {},
		// { bookType: "csv",}
	);
	console.log("CSV file created successfully");
};

export const downloadFile = (url, file) => {
	return new Promise((resolve, reject) => {
		let localFile = fs.createWriteStream(file);
		const client = url.startsWith("https") ? https : http;
		client.get(url, (response) => {
			response.on("end", () => {
				console.log("Download of the record is complete");
				resolve(file);
			});
			response.pipe(localFile);
		});
	});
};

export const getFileLink = async (ctx) => {
	const file = await ctx.getFile(); // valid for at least 1 hour
	const path = file.file_path;
	return `https://api.telegram.org/file/bot${process.env.TOKEN}/${path}`;
};

export const deleteFile = async (path) => {
	fs.unlinkSync(path);
};

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export const copyMessageToUsers = async (ctx) => {
	const usersList = await getAllUsers();

	const send = async (id) => {
		await delay(500);
		try {
			await ctx.message.copy(id);
			return true;
		} catch (error) {
			return false;
		}
	};

	const processUsersList = async (usersList) => {
		let success = 0;
		let failure = 0;
		let atAll = 0;
		for (let user in usersList) {
			const res = await send(usersList[user].tg_id);
			res ? success++ : failure++;
			atAll++;
		}
		return { success, failure, atAll };
	};
	const { success, failure, atAll } = await processUsersList(usersList);
	await ctx.reply(
		`Всего отправлено сообщений пользователям: ${atAll}
Успешно: ${success}, с ошибками: ${failure}.`,
		{ reply_markup: toAdminMenuKeyboard },
	);
};

export const newThread = async (ctx) => {
	await agent.clearMessageHistory(ctx.session.thread_id);
	ctx.session.thread_id = uuidv4();
};

export const toPref = (ctx) => {
	const query = ctx.callbackQuery.data;
	const index = query.match(/-/).index;
	const preference = query.slice(index + 1);
	const action = query.slice(0, index);
	return { preference, action };
};

export const execute = async (db, sql, params = []) => {
	if (params && params.length > 0) {
		return new Promise((resolve, reject) => {
			db.run(sql, params, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}
	return new Promise((resolve, reject) => {
		db.exec(sql, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
};

export const clearMessageHistory = async (thread_id) => {
	const db = new sqlite3.Database("checkpoints.db", sqlite3.OPEN_READWRITE);
	const sql = `DELETE FROM checkpoints WHERE thread_id = '${thread_id}'`;
	try {
		await execute(db, sql);
	} catch (err) {
		// console.log(err);
	} finally {
		db.close();
	}
};
export const isValidCardNumber = (cardNumber) => {
	// Удаляем все пробелы и нечисловые символы
	if (!cardNumber) return "canceled";
	cardNumber = cardNumber.replace(/\D/g, "");

	// Проверка, что номер состоит только из цифр и его длина больше 0
	if (!/^\d+$/.test(cardNumber) || cardNumber.length === 0) {
		return false;
	}

	// Применяем алгоритм Луна
	let sum = 0;
	let alternate = false;

	// Проходим по номеру карты с конца к началу
	for (let i = cardNumber.length - 1; i >= 0; i--) {
		let n = parseInt(cardNumber.charAt(i), 10);

		// Удваиваем каждую вторую цифру
		if (alternate) {
			n *= 2;
			// Если результат больше 9, отнимаем 9
			if (n > 9) {
				n -= 9;
			}
		}
		// Добавляем полученное значение к сумме
		sum += n;
		alternate = !alternate; // Меняем флаг для следующей цифры
	}

	// Если сумма делится на 10, номер карты валиден
	return sum % 10 === 0;
};

export function isValidCreditCardNumber(cardNumber) {
	// Удаляем все пробелы и нечисловые символы
	cardNumber = cardNumber.replace(/\D/g, "");

	// Проверяем, что номер состоит только из цифр
	if (!/^\d+$/.test(cardNumber)) {
		return false;
	}

	let sum = 0;
	let shouldDouble = false;

	// Проходимся по цифрам с конца
	for (let i = cardNumber.length - 1; i >= 0; i--) {
		let digit = parseInt(cardNumber.charAt(i), 10);

		if (shouldDouble) {
			digit *= 2;
			// Если результат больше 9, вычитаем 9
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		shouldDouble = !shouldDouble; // Переключаем флаг
	}

	// Проверяем, делится ли сумма на 10
	return sum % 10 === 0;
}

export const createSheet = async () => {
	const users = await getAllUsersData();
	await asyncForEach(users, async (user) => {
		const data = [
			user.fio,
			user.tg_id,
			user.phone_number,
			user.bankCard,
			user.cardboardTaken,
			user.petTaken,
			user.paperTaken,
			user.cansTaken,
			user.otherTaken,
			user.pointsCollected,
			user.pointsWithdrawn,
			user.pointsNow,
		];
		await addUser(data);
	});
};

export const getDateTime = () => {
	return {
		time: moment().format("HH:mm"),
		date: moment().format("DD.MM.YYYY"),
	};
};

export const formatBankCard = (cardNumber) => {
	// Удаляем все пробелы и нечисловые символы
	cardNumber = cardNumber.replace(/\D/g, "");

	// Добавляем пробелы между группами по 4 цифры
	return cardNumber.replace(/(.{4})/g, "$1 ");
};

const replaceAll = (str, find, replace) => {
	try {
		const res = str.replace(new RegExp(find, "g"), replace);

		return res;
	} catch (error) {
		console.log(error);
	}
};

const formatToMarkdown = (text) => {
	let result;
	const symbols = ["_", "*", "[", "!", ".", ",", "-", ")", "("];
	symbols.forEach((symbol) => {
		result = replaceAll(text, symbol, `\\${symbol}`);
	});
	console.log(result);
};

// formatToMarkdown(`1. **ПЭТ (пластиковые бутылки)**:
//    - Что сдавать: бутылки от напитков (вода, соки, газировка), пластиковые флаконы от шампуней или бытовой химии.
//    - Что не сдавать: бутылки с остатками жидкости, жирные или загрязнённые пластики, непрозрачные бутылки (например, от молочных продуктов).

// 2. **Пластиковые крышечки**: принимаются от любых бутылок.

// 3. **Металлы**: включая алюминиевые банки.

// 4. **Макулатура**: бумага и картон.

// 5. **Пластик**: в том числе ПЭТ-бутылки.

// Компания также уточняет, что условия приема могут варьироваться, и рекомендуется уточнять информацию в пункте приема или по телефону.`);
