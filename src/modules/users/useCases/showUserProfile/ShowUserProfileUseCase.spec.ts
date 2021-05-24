import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })


  it("should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "Test User Name",
      email: "testUserEmail@fin-api.com",
      password: "testPassword"
    })

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile.name).toBe(user.name);
    expect(userProfile.email).toBe(user.email);
  })

  it("should not be able to show a user profile of a non-existent user", () => {
    expect(async ()=> {
      await showUserProfileUseCase.execute("user_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
