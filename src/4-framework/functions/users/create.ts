import { container } from '@shared/ioc/container'
import '@root/src/4-framework/ioc/inversify.config'
import { middyfy } from '@root/src/4-framework/utility/lamba'
import { InputCreateUser } from '@root/src/3-controller/serializers/user/inputCreateUser'
import { CreateUserOperator } from '@root/src/3-controller/operations/user/createUser'
import { IError } from '@shared/IError'
import {
  IHandlerInput,
  IHandlerResult,
} from '@root/src/4-framework/utility/types'
import { httpResponse } from '../../utility/httpResponse'

const create = async (event: IHandlerInput): Promise<IHandlerResult> => {
  try {
    const input = new InputCreateUser(event.body)

    const operator = container.get(CreateUserOperator)

    const userResult = await operator.run(input)

    if (userResult.isLeft()) {
      throw userResult.value
    }

    return httpResponse('created', userResult.value)
  } catch (error) {
    if (error instanceof IError) {
      return httpResponse(error.statusCode, error.body)
    }

    console.error(error)

    return httpResponse(
      'internalError',
      'Internal server error in user creation'
    )
  }
}

export const handler = middyfy(create)
