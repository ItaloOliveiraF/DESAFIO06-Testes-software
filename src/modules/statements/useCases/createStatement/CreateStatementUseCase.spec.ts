import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase : CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create a new statement", () => {
  beforeEach(()=> {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it("Should be able to create a deposit statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Test User Name",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Test Deposit",
      type: OperationType["DEPOSIT"],
    })

    expect(deposit).toHaveProperty("id");
  })

  it("Should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Test User Name",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Test Deposit",
      type: OperationType["DEPOSIT"],
    })

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Test Deposit",
      type: OperationType["WITHDRAW"],
    })

    expect(withdraw).toHaveProperty("id");
  })

  it("Should not be able to create a withdraw statement if resultant balance is less then total amount", async () => {
    await expect(
      async () => {
        const user = await createUserUseCase.execute({
          name: "Test User Name",
          email: "testUserEmail@fin-api.com",
          password: "testPassword"
        })

        await createStatementUseCase.execute({
          user_id: user.id as string,
          amount: 1000,
          description: "Test Deposit",
          type: OperationType["DEPOSIT"],
        })

        await createStatementUseCase.execute({
          user_id: user.id as string,
          amount: 1001,
          description: "Test Deposit",
          type: OperationType["WITHDRAW"],
        })
      }
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("Should not be able to create a statement of a non-existent user", async () => {
    await expect(async () =>
      {
        const user = await createUserUseCase.execute({
          name: "Test User Name",
          email: "testUserEmail@fin-api.com",
          password: "testPassword"
        })

        await createStatementUseCase.execute({
          user_id: "wrong_user_id",
          amount: 1000,
          description: "Test Deposit",
          type: OperationType["DEPOSIT"],
        })
      }
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
