import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection;
    await connection.runMigrations()
  }, 10000)

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  }, 10000)

  it("Should be able to create a new user", async () => {

    const response = await request(app).post("/api/v1/users").send({
      name: "Test User Name",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    expect(response.status).toBe(201);
  })

  it("Should not be able to create a new user with the same email", async () => {

    const response = await request(app).post("/api/v1/users").send({
      name: "Test User Name With Same Email",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    expect(response.status).toBe(400);
  })
})
