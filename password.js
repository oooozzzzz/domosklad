import { setPassrword } from "./db.js";

export const setNewAdminPassword = async (newPassword) => {
	await setPassrword("admin", newPassword);
	console.log("New admin password set");
};

export const setNewOwnerPassword = async (newPassword) => {
	await setPassrword("owner", newPassword);
	console.log("New owner password set");
};

