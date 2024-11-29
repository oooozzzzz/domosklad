import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	const adminPass = await prisma.password.create({
		data: { label: "admin", value: "admin" },
	});
	const ownerPass = await prisma.password.create({
		data: { label: "owner", value: "owner" },
	});
	console.log(adminPass, ownerPass);
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
