import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe( "Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it("Should be able to authenticate a user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test User Name",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    const authenticateResponse =  await authenticateUserUseCase.execute({
      email: user.email,
      password: "testPassword"
    });

    expect(authenticateResponse).toHaveProperty("token");
  })

  it("Should not be able to authenticate a user with incorrect email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test User Name",
        email: "testUserEmail@fin-api.com",
        password: "testPassword"
      })

      await authenticateUserUseCase.execute({
        email: "wrongEmail",
        password: "testPassword"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("Should not be able to authenticate a user with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test User Name",
        email: "testUserEmail@fin-api.com",
        password: "testPassword"
      })

      await authenticateUserUseCase.execute({
        email: "testUserEmail@fin-api.com",
        password: "wrongTestPassword"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })


})
