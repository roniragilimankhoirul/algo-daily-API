import supertest from "supertest";
import { app } from "../src/application/app.js";
import { prismaClient } from "../src/application/database.js";
import { logger } from "../src/application/logging.js";
import bcrypt from "bcrypt";

describe("POST /api/users", () => {
  afterEach(async () => {
    await prismaClient.user.deleteMany({
      where: {
        email: "example@gmail.com",
      },
    });
  });
  it("should can register new user", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "Roni Ragil Iman Khoirul",
      email: "example@gmail.com",
      password: "12345678",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("Roni Ragil Iman Khoirul");
    expect(result.body.data.email).toBe("example@gmail.com");
    expect(result.body.data.password).toBeUndefined;
  });
  it("should can reject invalid register", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "",
      email: "",
      password: "",
    });

    logger.info(result);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined;
  });
  it("should cannot register duplicate user", async () => {
    let result = await supertest(app).post("/api/users").send({
      name: "Roni Ragil Iman Khoirul",
      email: "example@gmail.com",
      password: "12345678",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("Roni Ragil Iman Khoirul");
    expect(result.body.data.email).toBe("example@gmail.com");
    expect(result.body.data.password).toBeUndefined;

    result = await supertest(app).post("/api/users").send({
      name: "Roni Ragil Iman Khoirul",
      email: "example@gmail.com",
      password: "12345678",
    });

    logger.info(result.body);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined;
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await prismaClient.user.create({
      data: {
        name: "test",
        email: "test@gmail.com",
        password: await bcrypt.hash("test", 10),
      },
    });
  });

  afterEach(async () => {
    await prismaClient.user.deleteMany({
      where: {
        email: "test@gmail.com",
      },
    });
  });
  test("should can login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "test@gmail.com",
      password: "test",
    });
    logger.info(result.body);
    expect(result.status).toBe(200);
  });

  test("should reject login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "",
      password: "",
    });
    logger.info(result.body);
    expect(result.status).toBe(400);
  });
  test("should reject login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "test@gmail.com",
      password: "sd",
    });
    logger.info(result.body);
    expect(result.status).toBe(401);
  });

  test("should reject login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "tet@gmail.com",
      password: "test",
    });
    logger.info(result.body);
    expect(result.status).toBe(401);
  });
});
