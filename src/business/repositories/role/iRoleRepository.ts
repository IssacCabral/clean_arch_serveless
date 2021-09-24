import { RoleEntityKeys } from '@business/dto/role/findBy'
import { InputCreateRoleEntity, IRoleEntity } from '@domain/entities/roleEntity'

export const IRoleRepositoryToken = Symbol.for('IRoleRepositoryToken')

export interface IInputUpdateRole {
  updateWhere: { type: RoleEntityKeys; key: string | number }
  newData: IRoleEntity
}
export interface IRoleRepository {
  create(input: InputCreateRoleEntity): Promise<IRoleEntity>
  findBy(
    key: RoleEntityKeys,
    value: IRoleEntity[RoleEntityKeys]
  ): Promise<void | IRoleEntity>
  update(input: IInputUpdateRole): Promise<IRoleEntity | void>
}
