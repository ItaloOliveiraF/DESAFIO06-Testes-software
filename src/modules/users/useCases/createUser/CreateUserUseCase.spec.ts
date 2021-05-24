import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;
describe("Create a new User", () => {
    beforeEach(() => {
      usersRepository = new InMemoryUsersRepository();
      createUserUseCase = new CreateUserUseCase(usersRepository);
    })

    it("Should be able to create a new user", async () => {
      const user = await createUserUseCase.execute({
        name: "Test User Name",
        email: "testUserEmail@fin-api.com",
        password: "testPassword"
      })

      expect(user).toHaveProperty("id");
    })

    it("Should not be able to create a new user with existent email", () => {
      expect(async () => {
        await createUserUseCase.execute({
          name: "Test User Name 1",
          email: "testUserEmail@fin-api.com",
          password: "testPassword1"
        })

        await createUserUseCase.execute({
          name: "Test User Name 2",
          email: "testUserEmail@fin-api.com",
          password: "testPassword2"
        })

      }).rejects.toBeInstanceOf(CreateUserError);
    })
})
