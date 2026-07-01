import {
  buildIsoOnDay,
  eventMinutesInDayGrid,
  MIN_EVENT_DURATION_MINUTES,
  snapEventMinutes,
} from 'nucleify'

export function buildResizedEventTimes(
  initialStartsAt: string,
  targetDay: Date,
  endMinutes: number,
  dayStartHour: number,
  dayEndHour: number
): { startsAt: string; endsAt: string } {
  const startDate = new Date(initialStartsAt)
  const startMinutes = eventMinutesInDayGrid(
    initialStartsAt,
    targetDay,
    dayStartHour
  )
  const maxMinutes = (dayEndHour - dayStartHour) * 60
  const clampedEnd = snapEventMinutes(
    Math.max(
      startMinutes + MIN_EVENT_DURATION_MINUTES,
      Math.min(endMinutes, maxMinutes)
    ),
    dayStartHour,
    dayEndHour
  )

  return {
    startsAt: startDate.toISOString(),
    endsAt: buildIsoOnDay(targetDay, clampedEnd, dayStartHour),
  }
}
