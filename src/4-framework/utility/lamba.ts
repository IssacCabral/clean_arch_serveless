import middy from '@middy/core'
import httpCors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Context } from 'aws-lambda'

export const middyfy = (
  handler: (e: unknown, contex?: Context) => unknown
): middy.Middy<unknown, unknown, Context> =>
  middy((e: unknown, c: Context) => {
    // eslint-disable-next-line no-param-reassign
    c.callbackWaitsForEmptyEventLoop = false
    return handler(e, c)
  })
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(httpCors())
