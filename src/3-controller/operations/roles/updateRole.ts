import { OutputUpdateRoleDto } from '@root/src/2-business/dto/role/update'
import { RolesErrors } from '@root/src/2-business/module/errors/roles/rolesErrors'
import { FindRoleByUseCase } from '@root/src/2-business/useCases/role/findRoleByUseCase'
import { UpdateRoleUseCase } from '@root/src/2-business/useCases/role/updateRoleUseCase'
import { VerifyProfileUseCase } from '@root/src/2-business/useCases/role/verifyProfileUseCase'
import { InputUpdateRole } from '@root/src/3-controller/serializers/role/inputUpdateRole'
import { left, right } from '@shared/either'
import { inject, injectable } from 'inversify'
import { AbstractOperator } from '../abstractOperator'

@injectable()
export class UpdateRoleOperator extends AbstractOperator<
  InputUpdateRole,
  OutputUpdateRoleDto
> {
  constructor(
    @inject(FindRoleByUseCase) private findRoleByUseCase: FindRoleByUseCase,
    @inject(UpdateRoleUseCase) private updateRoleUseCase: UpdateRoleUseCase,
    @inject(VerifyProfileUseCase)
    private verifyProfileUseCase: VerifyProfileUseCase
  ) {
    super()
  }

  async run(
    input: InputUpdateRole,
    user_id: number
  ): Promise<OutputUpdateRoleDto> {
    this.exec(input)
    const authUser = await this.verifyProfileUseCase.exec({
      authorizeBy: 'id',
      key: user_id,
      allowedProfiles: [],
    })

    if (authUser.isLeft()) {
      return left(authUser.value)
    }

    const existentRole = await this.findRoleByUseCase.exec({
      column: 'id',
      value: input.id,
    })

    if (existentRole.isLeft()) {
      return left(RolesErrors.roleNotFound())
    }

    const roleUpdated = await this.updateRoleUseCase.exec(
      {
        ...existentRole.value,
        profile: input.profile,
      },
      { column: 'id', value: input.id }
    )

    if (roleUpdated.isLeft()) {
      return left(roleUpdated.value)
    }

    return right(roleUpdated.value)
  }
}
