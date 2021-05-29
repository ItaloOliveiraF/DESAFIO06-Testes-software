import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user controller", () => {
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

  it("Should be able to authenticate a user", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "mainUser@finapi.com",
      password: "test"
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  })

  it("Should not be able to authenticate a user with non-existent email", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "nonexist@finapi.com",
      password: "test"
    })

    expect(response.status).toBe(401);
  })

  it("Should not be able to authenticate a user with wrong password", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "mainUser@finapi.com",
      password: "wrongPassword"
    })

    expect(response.status).toBe(401);
  })
})
