import supertest from "supertest";
import { app } from "../src/application/app.js";
import { createUser, removeUser } from "./test-util.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import path from "path";

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

describe("GET users/profile", () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    removeUser();
  });
  it("should succes get user profile", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .get("/api/users/profile")
      .set("Authorization", token);
    expect(result.status).toBe(200);
  });

  it("should reject user not found", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "tes@test.com" } }, secret);
    const result = await supertest(app)
      .get("/api/users/profile")
      .set("Authorization", token);
    expect(result.status).toBe(404);
  });
});

describe("PUT users/photo", () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    removeUser();
  });
  it("should succes update user photo profile", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/photo")
      .set("Authorization", token)
      .attach("photo", path.join(__dirname, "./test.png"));
    expect(result.status).toBe(200);
  });

  it("should error user not found", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "tet@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/photo")
      .set("Authorization", token)
      .attach("photo", path.join(__dirname, "./test.png"));
    expect(result.status).toBe(404);
  });
});

describe("PUT users/password", () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    removeUser();
  });
  it("should succes update user password", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/password")
      .set("Authorization", token)
      .send({
        newPassword: "testtesttest",
        confirmPassword: "testtesttest",
      });
    expect(result.status).toBe(200);
  });

  it("should error because invalid request", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/password")
      .set("Authorization", token)
      .send({
        newPassword: "",
        confirmPassword: "",
      });
    expect(result.status).toBe(400);
  });

  it("should error because password not match", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/password")
      .set("Authorization", token)
      .send({
        newPassword: "testesttest",
        confirmPassword: "hddhauhduasfafa",
      });
    expect(result.status).toBe(400);
  });

  it("should error user not found", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "tet@test.com" } }, secret);
    const result = await supertest(app)
      .put("/api/users/password")
      .set("Authorization", token)
      .send({
        newPassword: "onepiece",
        confirmPassword: "onepiece",
      });
    expect(result.status).toBe(404);
  });
});

describe("GET users/statistic", () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    removeUser();
  });
  it("should succes get user statistic", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "test@test.com" } }, secret);
    const result = await supertest(app)
      .get("/api/users/statistic")
      .set("Authorization", token);
    expect(result.status).toBe(200);
  });

  it("should error user not found", async () => {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ user: { email: "tet@test.com" } }, secret);
    const result = await supertest(app)
      .get("/api/users/statistic")
      .set("Authorization", token);
    expect(result.status).toBe(404);
  });
});
