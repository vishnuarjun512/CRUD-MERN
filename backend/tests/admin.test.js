import request from "supertest";
import { app, server } from "../index.js";
import mongoose from "mongoose";

describe("Admin Login Test ... ", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  });

  test("Testing Admin Login", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "admin",
      username: "admin",
      password: "admin",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.user.isAdmin).toBe(true);
  });

  test("User who has no Admin Power", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "sanketlad@gmail.com",
      username: "sanketlad@gmail.com",
      password: "sanketlad@gmail.com",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.user.isAdmin).toBe(false);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookieValue = response.headers["set-cookie"][0].split("=")[0];
    expect(cookieValue).toContain("auth_token");
  });
});
