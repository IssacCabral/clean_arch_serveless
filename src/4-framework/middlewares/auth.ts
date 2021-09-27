import middy from '@middy/core'
import {
  IHandlerInput,
  IHandlerResult,
} from '@root/src/4-framework/utility/types'
import { Context } from 'aws-lambda'
import createHttpError from 'http-errors'
import { container } from '@shared/ioc/container'
import { AuthenticatorService } from '@root/src/4-framework/services/authenticator/AuthenticatorService'
import { IError } from '@shared/IError'
import { IAuthenticatorServiceToken } from '@root/src/2-business/services/authenticator/iAuthenticator'

/**
 * This middleware must be used with @middy/http-error-handler
 */
export const AuthMiddyMiddleware = (): middy.MiddlewareObject<
  IHandlerInput,
  IHandlerResult,
  Context
> => ({
  before: async ({ event }) => {
    const authHeader = event.headers.Authorization

    if (!authHeader) {
      throw createHttpError(
        401,
        JSON.stringify({ message: 'Authorization header required' })
      )
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      throw createHttpError(401, JSON.stringify({ message: 'missing token' }))
    }

    const authenticatorService = container.get<AuthenticatorService>(
      IAuthenticatorServiceToken
    )

    const tokenPayload = await authenticatorService.verify(token)

    if (tokenPayload instanceof IError) {
      throw createHttpError(401, JSON.stringify(tokenPayload.body))
    }

    Object.defineProperty(event, 'auth', {
      value: tokenPayload,
      enumerable: true,
    })
  },
})
