import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Viajes",
    "Alimentación",
    "Oficina",
    "Transporte",
    "Alojamiento",
    "Tecnología",
    "Representación",
    "Otros",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const password = hashSync("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@yaneken.cl" },
    update: {},
    create: {
      email: "admin@yaneken.cl",
      password,
      name: "Admin Yáneken",
      role: "ADMIN",
      department: "Administración",
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@yaneken.cl" },
    update: {},
    create: {
      email: "manager@yaneken.cl",
      password,
      name: "María González",
      role: "MANAGER",
      department: "Operaciones",
    },
  });

  await prisma.user.upsert({
    where: { email: "employee@yaneken.cl" },
    update: {},
    create: {
      email: "employee@yaneken.cl",
      password,
      name: "Juan Pérez",
      role: "EMPLOYEE",
      department: "Operaciones",
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
