import {
  buildFloatingGhost,
  CalendarDragPointerState,
  CalendarDragSession,
  formatLocalDateKey,
  parseLocalDateKey,
  resolveDragTimes,
} from 'nucleify'

export function buildDragSessionUpdate(
  state: CalendarDragPointerState,
  event: PointerEvent,
  body: HTMLElement | null,
  fallbackDay: Date,
  dayStartHour: number,
  dayEndHour: number,
  hourHeight: number,
  previousSession: CalendarDragSession | null,
  formatTime: (startsAt: string, endsAt: string) => string
): CalendarDragSession {
  const resolved = body
    ? resolveDragTimes(
        state,
        event,
        body,
        fallbackDay,
        dayStartHour,
        dayEndHour,
        hourHeight
      )
    : null

  const targetStartsAt =
    resolved?.startsAt ??
    previousSession?.targetStartsAt ??
    state.initialStartsAt
  const targetEndsAt =
    resolved?.endsAt ?? previousSession?.targetEndsAt ?? state.initialEndsAt
  const targetDayKey = resolved
    ? formatLocalDateKey(resolved.targetDay)
    : (previousSession?.targetDayKey ?? state.originDayKey)
  const targetDay = resolved?.targetDay ?? parseLocalDateKey(targetDayKey)

  return {
    mode: state.mode,
    eventId: state.id,
    durationMs: state.durationMs,
    grabOffsetMinutes: state.grabOffsetMinutes,
    initialStartsAt: state.initialStartsAt,
    initialEndsAt: state.initialEndsAt,
    originDayKey: state.originDayKey,
    ghostBase: state.ghostBase,
    targetDayKey,
    targetStartsAt,
    targetEndsAt,
    floatingGhost: buildFloatingGhost(
      state,
      event,
      formatTime(targetStartsAt, targetEndsAt),
      {
        body,
        targetStartsAt,
        targetEndsAt,
        targetDay,
        dayStartHour,
        dayEndHour,
        hourHeight,
      }
    ),
  }
}
