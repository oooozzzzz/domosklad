import { PrismaClient } from "@prisma/client";
import { addTransaction, addWithdrawal } from "./googlesheet.js";
import { getDateTime } from "./services.js";

const prisma = new PrismaClient();

export const createUser = async (tg_id, name) => {
	const id = tg_id.toString();
	try {
		await prisma.user.create({
			data: {
				tg_id: id,
				first_name: name,
				pointsNow: 0,
			},
		});
		return true;
	} catch (error) {
		return false;
	}
};

export const makeAdmin = async (id) => {
	id = id.toString();
	await prisma.user.update({
		where: { tg_id: id },
		data: { isAdmin: true },
	});
};

export const getAllUsers = async () => {
	try {
		const users = await prisma.user.findMany({
			select: { tg_id: true },
		});
		return users;
	} catch (error) {
		return false;
	}
};

export const getOwnerPassword = async () => {
	try {
		const password = await prisma.password.findUnique({
			where: { label: "owner" },
			select: { value: true },
		});
		return password.value;
	} catch (error) {
		return false;
	}
};

export const setPassrword = async (label, value) => {
	try {
		await prisma.password.update({
			where: { label },
			data: { value },
		});
	} catch (error) {
		return false;
	}
};

export const getAdminPassword = async () => {
	try {
		const password = await prisma.password.findUnique({
			where: { label: "admin" },
			select: { value: true },
		});
		return password.value;
	} catch (error) {
		console.log(error);
		return false;
	}
};

export const getUserInfo = async (tg_id) => {
	tg_id = tg_id.toString();
	try {
		const user = await prisma.user.findUnique({
			where: { tg_id: tg_id },
		});
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
};

const formatPhoneNumber = (phone_number) => {
	if (phone_number[0] !== "+") {
		return `+${phone_number}`;
	}
	return phone_number;
};

export const updateStartInfo = async ({
	tg_id,
	fio,
	phone_number,
	bankCard,
}) => {
	phone_number = formatPhoneNumber(phone_number);
	tg_id = tg_id.toString();
	if (bankCard) {
		try {
			await prisma.user.update({
				where: { tg_id },
				data: {
					fio,
					phone_number,
					bankCard,
				},
			});
		} catch (error) {
			console.log(error);
			return false;
		}
	} else {
		try {
			await prisma.user.update({
				where: { tg_id },
				data: {
					fio,
					phone_number,
				},
			});
		} catch (error) {
			console.log(error);
			return false;
		}
	}
};

export const getAllUsersData = async () => {
	try {
		const users = await prisma.user.findMany();
		return users;
	} catch (error) {
		return false;
	}
};

export const addCardNumber = async (card, tg_id) => {
	tg_id = tg_id.toString();
	try {
		await prisma.user.update({
			where: { tg_id },
			data: { bankCard: card },
		});
		return true;
	} catch (error) {
		return false;
	}
};

export const handleTransaction = async (data) => {
	try {
		const userUpdate = await prisma.user.update({
			where: { tg_id: data.clientId },
			data: {
				pointsCollected: {
					increment: parseInt(data.points),
				},
				pointsNow: {
					increment: parseInt(data.points),
				},
				cansTaken: {
					increment: parseInt(data.cans),
				},
				paperTaken: {
					increment: parseInt(data.paper),
				},
				petTaken: {
					increment: parseInt(data.pet),
				},
				cardboardTaken: {
					increment: parseInt(data.cardboard),
				},
				otherTaken: {
					increment: parseInt(data.other),
				},
			},
		});
		const { date, time } = getDateTime();

		await addTransaction([
			time,
			date,
			data.cardboard,
			data.pet,
			data.paper,
			data.cans,
			data.other,
			data.clientId,
			data.adminId,
			data.points,
		]);
		return true;
	} catch (error) {
		return false;
	}
};

export const handleWithdrawal = async (tg_ig, points, admin = "0") => {
	tg_ig = tg_ig.toString();
	points = parseInt(points);
	try {
		await prisma.user.update({
			where: { tg_id: tg_ig },
			data: {
				pointsWithdrawn: {
					increment: points,
				},
				pointsNow: {
					decrement: points,
				},
			},
		});
		const { date, time } = getDateTime();
		await addWithdrawal([time, date, tg_ig, points, admin]);
		return true;
	} catch (error) {
		return false;
	}
};

export const updateName = async (tg_id, name) => {
	tg_id = tg_id.toString();
	try {
		await prisma.user.update({
			where: { tg_id },
			data: { fio: name },
		});
		return true;
	} catch (error) {
		return false;
	}
};
