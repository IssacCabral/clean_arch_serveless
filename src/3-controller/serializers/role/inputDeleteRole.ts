import { IInputDeleteRoleDto } from '@root/src/2-business/dto/role/delete'
import { IsNumber } from 'class-validator'
import { AbstractSerializer } from '../abstractSerializer'

export class InputDeleteRole extends AbstractSerializer<IInputDeleteRoleDto> {
  @IsNumber()
  id: number
}
