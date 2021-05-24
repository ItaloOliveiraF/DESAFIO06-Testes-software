import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase : CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get a user balance", () => {
  beforeEach(()=> {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it("Should be able to get a user balance", async () => {
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

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 500,
      description: "Test Deposit",
      type: OperationType["WITHDRAW"],
    })

    const balanceResponse = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balanceResponse.balance).toBe(deposit.amount - withdraw.amount);
    expect(balanceResponse.statement).toHaveLength(2);
    expect(balanceResponse.statement).toEqual([deposit, withdraw])
  })

  it("Should not be able to get a balance of a non-existent user", async () => {
    await expect(async () => {
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
        amount: 500,
        description: "Test Deposit",
        type: OperationType["WITHDRAW"],
      })

      await getBalanceUseCase.execute({
        user_id: "Non_existent_user_id"
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
