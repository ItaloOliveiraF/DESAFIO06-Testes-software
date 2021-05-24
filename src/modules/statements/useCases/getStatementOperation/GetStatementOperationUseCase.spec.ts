import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase : GetStatementOperationUseCase;
let createStatementUseCase : CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(()=> {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it("Should be able to get a statement operation",  async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string
    })

    expect(statementOperation).toEqual(deposit);
  })

  it("Should not be able to get a statement operation of a non-existent user",  async () => {
    await expect(async () => {
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

      await getStatementOperationUseCase.execute({
        statement_id: deposit.id as string,
        user_id: "No_existent_user_id"
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("Should not be able to get a non-existent statement operation",  async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Test User Name",
        email: "testUserEmail@fin-api.com",
        password: "testPassword"
      })

      await getStatementOperationUseCase.execute({
        statement_id: "Non_existent_statement_id",
        user_id: user.id as string
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
