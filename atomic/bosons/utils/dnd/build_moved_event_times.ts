import { buildIsoOnDay, snapEventMinutes } from 'nucleify'

export function buildMovedEventTimes(
  targetDay: Date,
  startMinutes: number,
  durationMs: number,
  dayStartHour: number,
  dayEndHour: number
): { startsAt: string; endsAt: string } {
  const maxMinutes = (dayEndHour - dayStartHour) * 60
  const durationMinutes = durationMs / 60_000
  let clampedStart = snapEventMinutes(startMinutes, dayStartHour, dayEndHour)

  if (clampedStart + durationMinutes > maxMinutes) {
    clampedStart = snapEventMinutes(
      Math.max(0, maxMinutes - durationMinutes),
      dayStartHour,
      dayEndHour
    )
  }

  const startsAt = buildIsoOnDay(targetDay, clampedStart, dayStartHour)
  const endsAt = new Date(
    new Date(startsAt).getTime() + durationMs
  ).toISOString()

  return { startsAt, endsAt }
}
