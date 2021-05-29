import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let authToken: string;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection;
    await connection.runMigrations()

    const id = uuidV4()
    const password = await hash("test", 8);

    await connection.query(`INSERT INTO USERS(id, name, email, password) values('${id}', 'mainUser', 'mainUser@finapi.com', '${password}')`)

    const authenticateResponse = await request(app).post("/api/v1/sessions").send({
      email: "mainUser@finapi.com",
      password: "test"
    })

    authToken = authenticateResponse.body.token;
  }, 10000)

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  }, 10000)

  it("Should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit test"
      })
      .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(201);
  }, 10000)

  it("Should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "withdraw test"
      })
      .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(201);
  }, 10000)

  it("Should not be able to create a withdraw statement with insufficient founds", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 600,
        description: "withdraw test"
      })
      .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(400);
  }, 10000)

  it("Should not be able to create a statement with a invalid user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 600,
        description: "deposit test"
      })
      .set({ Authorization: `invalid token`})

    expect(response.status).toBe(401);
  }, 10000)
})
