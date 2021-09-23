import { UsersErrors } from '@business/module/errors/users/usersErrors'
import { IRoleRepositoryToken } from '@business/repositories/role/iRoleRepository'
import { IUserRepositoryToken } from '@business/repositories/user/iUserRepository'
import { CreateRoleUseCase } from '@business/useCases/role/createRoleUseCase'
import { VerifyProfileUseCase } from '@business/useCases/role/verifyProfileUseCase'
import { CreateRoleOperator } from '@controller/operations/roles/createRole'
import { InputCreateRole } from '@controller/serializers/role/inputCreateRole'
import { container } from '@shared/ioc/container'
import { fakeUserAdminEntity } from '@tests/mock/fakes/entities/fakeUserEntity'
import { FakeRoleRepository } from '@tests/mock/fakes/repositories/fakeRoleRepository'
import { FakeUserRepository } from '@tests/mock/fakes/repositories/fakeUserRepository'

describe('CreateRoleOperator', () => {
  const fakeUserRepositoryFindBy = jest.spyOn(
    FakeUserRepository.prototype,
    'findBy'
  )

  beforeAll(() => {
    container.bind(CreateRoleOperator).to(CreateRoleOperator)
    container.bind(VerifyProfileUseCase).to(VerifyProfileUseCase)
    container.bind(CreateRoleUseCase).to(CreateRoleUseCase)
    container.bind(IUserRepositoryToken).to(FakeUserRepository)
    container.bind(IRoleRepositoryToken).to(FakeRoleRepository)
  })

  afterAll(() => {
    container.unbindAll()
  })

  test('Should create a role', async () => {
    const operator = container.get(CreateRoleOperator)
    fakeUserRepositoryFindBy.mockImplementationOnce(
      async () => fakeUserAdminEntity
    )

    const inputRole = new InputCreateRole({
      profile: 'newProfile',
    })

    const roleResult = await operator.run(inputRole, 1)

    expect(roleResult.isLeft()).toBeFalsy()
    expect(roleResult.isRight()).toBeTruthy()
  })

  test('Should create a role', async () => {
    const operator = container.get(CreateRoleOperator)

    const inputRole = new InputCreateRole({
      profile: 'newProfile',
    })

    const roleResult = await operator.run(inputRole, 1)

    expect(roleResult.isRight()).toBeFalsy()

    if (roleResult.isLeft()) {
      expect(roleResult.value.statusCode).toBe(
        UsersErrors.userNotFound().statusCode
      )
      expect(roleResult.value.body).toStrictEqual(
        UsersErrors.userNotFound().body
      )
    }

    expect.assertions(3)
  })
})
