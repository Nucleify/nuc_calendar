export function clampCalendarMinutes(
  value: number,
  dayStartHour: number,
  dayEndHour: number
): number {
  return Math.max(0, Math.min((dayEndHour - dayStartHour) * 60, value))
}
