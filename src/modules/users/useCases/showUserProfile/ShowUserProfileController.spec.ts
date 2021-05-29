import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection;
    await connection.runMigrations()

    const id = uuidV4()
    const password = await hash("test", 8);

    await connection.query(`INSERT INTO USERS(id, name, email, password) values('${id}', 'mainUser', 'mainUser@finapi.com', '${password}')`)
  }, 10000)

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  }, 10000)

  it("Should be able to show a user profile", async () => {
    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "mainUser@finapi.com",
      password: "test"
    });

    const { token } = authenticateResponse.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  }, 10000)

  it("Should not be able to show a profile without a valid token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer invalidToken`
    });

    expect(response.status).toBe(401);
  }, 10000)

  it("Should not be able to show a profile without a authorization token", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
  }, 10000)
})
