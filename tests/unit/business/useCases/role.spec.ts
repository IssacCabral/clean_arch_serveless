import { UsersErrors } from '@business/module/errors/users/usersErrors'
import { IRoleRepositoryToken } from '@business/repositories/role/iRoleRepository'
import { IUserRepositoryToken } from '@business/repositories/user/iUserRepository'
import { VerifyProfileUseCase } from '@business/useCases/role/verifyProfileUseCase'
import { FindRoleByUseCase } from '@business/useCases/role/findRoleByUseCase'
import { container } from '@shared/ioc/container'
import { fakeRoleEntity } from '@tests/mock/fakes/entities/fakeRoleEntity'
import {
  fakeCreatedUserEntity,
  fakeUserEntity,
} from '@tests/mock/fakes/entities/fakeUserEntity'
import { FakeRoleRepository } from '@tests/mock/fakes/repositories/fakeRoleRepository'
import { FakeUserRepository } from '@tests/mock/fakes/repositories/fakeUserRepository'

describe('Roles use case', () => {
  const fakeRoleRepositoryFindBy = jest.spyOn(
    FakeRoleRepository.prototype,
    'findBy'
  )
  const fakeUserRepositoryFindBy = jest.spyOn(
    FakeUserRepository.prototype,
    'findBy'
  )

  beforeAll(() => {
    container.bind(FindRoleByUseCase).to(FindRoleByUseCase)
    container.bind(VerifyProfileUseCase).to(VerifyProfileUseCase)
    container.bind(IUserRepositoryToken).to(FakeUserRepository)
    container.bind(IRoleRepositoryToken).to(FakeRoleRepository)
  })

  afterAll(() => {
    container.unbindAll()
  })

  describe('Find role by use case', () => {
    test('Should find a existent role', async () => {
      const operator = container.get(FindRoleByUseCase)

      fakeRoleRepositoryFindBy.mockImplementation(async () => fakeRoleEntity)

      const roleResult = await operator.exec({ key: 'profile', value: 'admin' })

      expect(roleResult.isLeft()).toBeFalsy()
      expect(roleResult.isRight()).toBeTruthy()
    })

    test('Should not find a unexistent role', async () => {
      const operator = container.get(FindRoleByUseCase)

      fakeRoleRepositoryFindBy.mockImplementation(() => void 0)

      const roleResult = await operator.exec({
        key: 'profile',
        value: 'intern',
      })

      expect(roleResult.isLeft()).toBeTruthy()
      expect(roleResult.isRight()).toBeFalsy()
    })
  })

  describe('Authorize use case', () => {
    test('Should not find user', async () => {
      const operator = container.get(VerifyProfileUseCase)

      fakeUserRepositoryFindBy.mockImplementation(() => void 0)

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: ['manager'],
        authorizeBy: 'email',
        key: fakeCreatedUserEntity.email,
      })

      expect(userAuthorizerResult.isLeft()).toBeTruthy()
      expect(userAuthorizerResult.isRight()).toBeFalsy()

      if (userAuthorizerResult.isLeft()) {
        expect(userAuthorizerResult.value.statusCode).toBe(
          UsersErrors.userNotFound().statusCode
        )
      }

      expect.assertions(3)
    })

    test('Should throw if user not loaded correctly', async () => {
      const operator = container.get(VerifyProfileUseCase)

      fakeUserRepositoryFindBy.mockImplementation(async () => ({
        ...fakeUserEntity,
        role: undefined,
      }))

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: ['manager'],
        authorizeBy: 'email',
        key: fakeCreatedUserEntity.email,
      })

      expect(userAuthorizerResult.isLeft()).toBeTruthy()
      expect(userAuthorizerResult.isRight()).toBeFalsy()

      if (userAuthorizerResult.isLeft()) {
        expect(userAuthorizerResult.value.statusCode).toBe(
          UsersErrors.userNotLoadedCorrectly().statusCode
        )
      }

      expect.assertions(3)
    })
    test('Should authorize user', async () => {
      const operator = container.get(VerifyProfileUseCase)

      fakeUserRepositoryFindBy.mockImplementation(async () => fakeUserEntity)

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: ['manager'],
        authorizeBy: 'email',
        key: fakeCreatedUserEntity.email,
      })

      expect(userAuthorizerResult.isLeft()).toBeFalsy()
      expect(userAuthorizerResult.isRight()).toBeTruthy()
    })

    test('Should not authorize user', async () => {
      const operator = container.get(VerifyProfileUseCase)

      fakeUserRepositoryFindBy.mockImplementation(async () => fakeUserEntity)

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: [],
        authorizeBy: 'email',
        key: `${fakeCreatedUserEntity.email}.br`,
      })

      expect(userAuthorizerResult.isLeft()).toBeTruthy()
      expect(userAuthorizerResult.isRight()).toBeFalsy()
    })

    test('Should not authorize user with unsuficient permissions', async () => {
      const operator = container.get(VerifyProfileUseCase)

      fakeUserRepositoryFindBy.mockImplementation(async () => fakeUserEntity)

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: [],
        authorizeBy: 'email',
        key: `${fakeCreatedUserEntity.email}.br`,
      })

      expect(userAuthorizerResult.isLeft()).toBeTruthy()
      expect(userAuthorizerResult.isRight()).toBeFalsy()
    })

    test('Should authorize user not by role but by last chance', async () => {
      const operator = container.get(VerifyProfileUseCase)

      const userAuthorizerResult = await operator.exec({
        allowedProfiles: [],
        authorizeBy: 'email',
        key: `${fakeCreatedUserEntity.email}.br`,
        lastChance: async (user) => user.id === fakeUserEntity.id,
      })

      expect(userAuthorizerResult.isLeft()).toBeFalsy()
      expect(userAuthorizerResult.isRight()).toBeTruthy()
    })
  })
})
