import { google } from "googleapis";
import { createSheet } from "./services.js";

// ID of the spreadsheet to access
const spreadsheetId = "1Uc8g9B0JcqmMeN8qbIK7Np3kttsnoaq-6M0Ll-cZrgQ";

// Set up authentication
const auth = new google.auth.GoogleAuth({
	// Path to the credentials file
	keyFile: "credentials.json",
	// Scopes to request access to
	scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Create client instance for auth
const client = await auth.getClient();

// Create the sheets client
const sheets = google.sheets({
	version: "v4",
	auth: client,
});

// Get the metadata for the spreadsheet
// const metadata = await sheets.spreadsheets.get({
// 	auth,
// 	spreadsheetId,
// });

// Get the values in the range A1:A
const getRows = await sheets.spreadsheets.values.get({
	auth,
	spreadsheetId,
	range: "Пользователи!B1:B",
});

/**
 * Appends a new user to the spreadsheet.
 *
 * @param {Array} data - An array of values representing the user data to be appended.
 * @returns {boolean} - True if the user was successfully appended, false otherwise.
 */
export const addUser = async (data) => {
	await sheets.spreadsheets.values.append({
		auth,
		spreadsheetId,
		range: "Пользователи!A:K",
		valueInputOption: "USER_ENTERED",
		resource: {
			values: [data],
		},
	});
	console.log("Success");
	return true;
};

/**
 * Appends a new transaction to the spreadsheet.
 *
 * @param {Array} data - An array of values representing the transaction data to be appended.
 * @returns {boolean} - True if the transaction was successfully appended, false otherwise.
 */
export const addTransaction = async (data) => {
	const res = await sheets.spreadsheets.values.append({
		auth,
		spreadsheetId,
		range: "Начисления!A:K",
		valueInputOption: "USER_ENTERED",
		resource: {
			values: [data],
		},
	});
	console.log("Transaction added");
	return true;
};
export const addWithdrawal = async (data) => {
	const res = await sheets.spreadsheets.values.append({
		auth,
		spreadsheetId,
		range: "Списания!A:D",
		valueInputOption: "USER_ENTERED",
		resource: {
			values: [data],
		},
	});
	console.log("Withdrawal added");
	return true;
};

export const isSheetEmpty = async () => {
	const response = await sheets.spreadsheets.values.get({
		auth,
		spreadsheetId,
		range: "Пользователи!A2:A3",
	});

	const result = response.data.values;
	if (!result) {
		return true;
	} else {
		return false;
	}
};

export const clearSheet = async () => {
	while (!(await isSheetEmpty())) {
		await sheets.spreadsheets.values.clear({
			spreadsheetId,
			range: "Пользователи!A2:L100",
		});
	}
};

export const reloadSheet = async () => {
	await clearSheet();
	await createSheet();
	console.log("Sheet reloaded");
};
// Print the values
