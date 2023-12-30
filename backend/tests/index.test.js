const request = require("supertest");
const mongoose = require("mongoose");
const { server, app } = require("../index.js");

describe("Testing ...", () => {
  afterAll(() => {
    if (server) {
      server.close();
    }
  });
  test("Should be 200 to start off with Unit Testing", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});
