import type { CalendarDragPointerState } from 'nucleify'
import {
  buildMovedEventTimes,
  buildResizedEventTimes,
  dayFromPointer,
  formatLocalDateKey,
  minutesFromPointerInBody,
  snapEventMinutes,
} from 'nucleify'

export function resolveDragTimes(
  state: CalendarDragPointerState,
  event: PointerEvent,
  body: HTMLElement | null,
  fallbackDay: Date,
  dayStartHour: number,
  dayEndHour: number,
  hourHeight: number
): { startsAt: string; endsAt: string; targetDay: Date } | null {
  if (!body) return null

  const targetDay = dayFromPointer(event, fallbackDay)
  const targetDayKey = formatLocalDateKey(targetDay)
  const minutesRaw = minutesFromPointerInBody(event, body, hourHeight)
  const snapped = snapEventMinutes(minutesRaw, dayStartHour, dayEndHour)

  const useMove = state.mode === 'move' || targetDayKey !== state.originDayKey

  if (useMove) {
    const startMinutes = snapEventMinutes(
      snapped - state.grabOffsetMinutes,
      dayStartHour,
      dayEndHour
    )
    const { startsAt, endsAt } = buildMovedEventTimes(
      targetDay,
      startMinutes,
      state.durationMs,
      dayStartHour,
      dayEndHour
    )
    return { startsAt, endsAt, targetDay }
  }

  const { startsAt, endsAt } = buildResizedEventTimes(
    state.initialStartsAt,
    targetDay,
    snapped,
    dayStartHour,
    dayEndHour
  )
  return { startsAt, endsAt, targetDay }
}
