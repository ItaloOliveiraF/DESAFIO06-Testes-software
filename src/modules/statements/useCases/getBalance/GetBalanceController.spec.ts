import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let authToken: string;

describe("Get Balance Controller", () => {
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

  it("Should be able to get a user balance", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement")
  }, 10000)

  it("Should not be able to get a balance of a non-existent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/balance")
      .set({ Authorization: `Bearer test`})

    expect(response.status).toBe(401);
  }, 10000)

})
