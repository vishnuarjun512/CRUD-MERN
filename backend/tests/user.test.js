import { app, server } from "../index.js";
import mongoose from "mongoose";
import request from "supertest";

describe("User Authentication Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  });

  test("Logging in a with Genuine Credentials", async () => {
    const response = await request(app).post("/api/user/login/").send({
      username: "test",
      email: "test",
      password: "test",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login Success");
  });

  test("Logging in a with Dummy Credentials", async () => {
    const response = await request(app).post("/api/user/login/").send({
      username: "test123",
      email: "test123",
      password: "test123",
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User not found");
  });
});

describe("Register Testing ...", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    if (server) server.close();
    await mongoose.disconnect();
  });

  test("Registering with Existing User", async () => {
    const response = await request(app).post("/api/user/register/").send({
      username: "test",
      email: "test",
      password: "test",
      mobile: "9845174522",
      profilePic: undefined,
    });
    expect(response.body.error).toBe(true);
    expect(response.statusCode).toBe(201);
  });

  test("Registering with New User", async () => {
    const generateFakeData = Math.random().toString(36).substring(2, 6);
    console.log(generateFakeData);
    const response = await request(app)
      .post("/api/user/register/")
      .send({
        username: generateFakeData,
        email: generateFakeData + "@gmail.com",
        password: generateFakeData,
        mobile: generateFakeData,
        profilePic: undefined,
      });
    expect(response.body.error).toBe(false);
    expect(response.statusCode).toBe(200);
  });
});
