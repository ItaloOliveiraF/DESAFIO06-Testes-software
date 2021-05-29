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

  it("Should be able to get a statement operation", async () => {
    const statementResponse = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 500,
      description: "deposit test"
    })
    .set({ Authorization: `Bearer ${authToken}`})

    const { id: statementId } = statementResponse.body

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe("500.00");
  }, 10000)

  it("Should not be able to get a non-existent statement operation", async () => {
    const response = await request(app)
    .get(`/api/v1/statements/${uuidV4()}`)
    .set({ Authorization: `Bearer ${authToken}`})

    expect(response.status).toBe(404);
  }, 10000)

  it("Should not be able to get a statement operation of a non-existent user", async () => {
    const statementResponse = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 500,
      description: "deposit test"
    })
    .set({ Authorization: `Bearer ${authToken}`})

    const { id: statementId } = statementResponse.body;

    const response = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({ Authorization: "Bearer fake"});

    expect(response.status).toBe(401);
  }, 10000)

})
