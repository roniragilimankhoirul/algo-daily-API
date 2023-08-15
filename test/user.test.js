import supertest from "supertest";
import { app } from "../src/application/app.js";
import { prismaClient } from "../src/application/database.js";

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
});
