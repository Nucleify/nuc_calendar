export function buildIsoOnDay(
  day: Date,
  minutesFromStart: number,
  dayStartHour: number
): string {
  const next = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  next.setHours(dayStartHour, 0, 0, 0)
  next.setMinutes(next.getMinutes() + minutesFromStart)
  return next.toISOString()
}
