const order = {};

export const signOrder = (id, details) => {
	const obj = { ...order[id] };
	order[id] = { ...obj, ...details };
};

export const getBookingData = (id) => {
	return order[id];
};

export const clearOrder = (id) => {
	delete order[id];
};
