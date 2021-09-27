import { IRelation } from '@root/src/2-business/repositories/relation'
import {
  IInputUpdateUser,
  IUserRepository,
  UserEntityKeys,
} from '@root/src/2-business/repositories/user/iUserRepository'
import { IUserEntity } from '@root/src/1-domain/entities/userEntity'
import { UserModel } from '@root/src/4-framework/models/users/userModel'
import { inject, injectable } from 'inversify'

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(UserModel) private userModel: typeof UserModel) {}

  async create(
    inputUserEntity: Omit<IUserEntity, 'id'>,
    role_id: number
  ): Promise<IUserEntity> {
    const user = await this.userModel.create({
      ...inputUserEntity,
      role_id,
    })

    return user as unknown as IUserEntity
  }
  async findBy(
    column: UserEntityKeys,
    value: IUserEntity[UserEntityKeys],
    relations?: IRelation<string, UserEntityKeys>[]
  ): Promise<void | IUserEntity> {
    try {
      const user = await this.userModel.findOne({
        where: { [column]: value },
        include:
          relations &&
          relations.map((relation) => ({
            association: relation.tableName,
          })),
      })

      const plainUser = user.get({ plain: true })

      return plainUser
    } catch {
      return void 0
    }
  }
  async update(input: IInputUpdateUser): Promise<Partial<IUserEntity> | void> {
    const { newData, updateWhere } = input

    await this.userModel.update(newData, {
      where: { [updateWhere.column]: updateWhere.value },
    })

    return input.newData
  }
}
