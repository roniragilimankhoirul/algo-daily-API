import supertest from "supertest";
import { app } from "../src/application/app.js";
import { createUser, removeUser } from "./test-util.js";

describe("POST /api/users", () => {
  afterEach(async () => {
    await removeUser();
  });
  it("should can register new user", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "test",
      email: "test@test.com",
      password: "test",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.email).toBe("test@test.com");
    expect(result.body.data.password).toBeUndefined;
  });
  it("should can reject invalid register", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "",
      email: "",
      password: "",
    });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined;
  });
  it("should cannot register duplicate user", async () => {
    let result = await supertest(app).post("/api/users").send({
      name: "test",
      email: "test@test.com",
      password: "test",
    });
    result = await supertest(app).post("/api/users").send({
      name: "test@test.com",
      email: "test@test.com",
      password: "test",
    });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined;
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeUser();
  });
  test("should can login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "test@test.com",
      password: "test",
    });
    expect(result.status).toBe(200);
  });

  test("should reject login user invalid request", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "",
      password: "",
    });
    expect(result.status).toBe(400);
  });
  test("should reject login user because wrong password", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "test@test.com",
      password: "sd",
    });
    expect(result.status).toBe(401);
  });

  test("should reject login user because wrong email", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      email: "tet@test.com",
      password: "test",
    });
    expect(result.status).toBe(401);
  });
});
