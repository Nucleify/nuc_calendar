import {
  apiMethodNotAllowed,
  apiNotHandled,
  dispatchAuthRoutes,
  withGatewayUser,
} from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'

import { calendarRoutes } from './calendar_handlers'

export async function handleCalendarApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  if (ctx.segments[0] !== 'calendar') return apiNotHandled()

  return withGatewayUser(ctx, async (gatewayCtx, userId) => {
    const result = await dispatchAuthRoutes(calendarRoutes, gatewayCtx, userId)
    return result ?? apiMethodNotAllowed()
  })
}
