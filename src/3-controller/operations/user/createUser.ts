import { IOutputCreateUserDto } from '@root/src/2-business/dto/user/create'
import { UsersErrors } from '@root/src/2-business/module/errors/users/usersErrors'
import { CreateUserUseCase } from '@root/src/2-business/useCases/user/createUserUseCase'
import { FindUserByUseCase } from '@root/src/2-business/useCases/user/findUserByUseCase'
import { InputCreateUser } from '@root/src/3-controller/serializers/user/inputCreateUser'
import { left, right } from '@shared/either'
import { inject, injectable } from 'inversify'
import { FindRoleByUseCase } from '@root/src/2-business/useCases/role/findRoleByUseCase'
import { RolesErrors } from '@root/src/2-business/module/errors/roles/rolesErrors'
import { AbstractOperator } from '../abstractOperator'

@injectable()
export class CreateUserOperator extends AbstractOperator<
  InputCreateUser,
  IOutputCreateUserDto
> {
  constructor(
    @inject(CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(FindUserByUseCase) private findUserUseCase: FindUserByUseCase,
    @inject(FindRoleByUseCase) private findRoleUseCase: FindRoleByUseCase
  ) {
    super()
  }

  async run(input: InputCreateUser): Promise<IOutputCreateUserDto> {
    this.exec(input)

    const isUserAlreadyRegistered = await this.findUserUseCase.exec({
      key: 'email',
      value: input.email,
    })

    if (isUserAlreadyRegistered.isRight()) {
      return left(UsersErrors.userEmailAlreadyInUse())
    }

    const role = await this.findRoleUseCase.exec({
      column: 'profile',
      value: 'manager',
    })

    if (role.isLeft()) {
      return left(RolesErrors.roleNotFound())
    }

    const userResult = await this.createUserUseCase.exec({
      ...input,
      role_id: role.value.id,
    })

    if (userResult.isLeft()) {
      return left(userResult.value)
    }

    return right(userResult.value)
  }
}
