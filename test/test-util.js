import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";

export const createUser = async () => {
  await prismaClient.user.create({
    data: {
      name: "test",
      email: "test@test.com",
      password: await bcrypt.hash("test", 10),
    },
  });
};

export const removeUser = async () => {
  await prismaClient.user.deleteMany({
    where: {
      email: "test@test.com",
    },
  });
};
