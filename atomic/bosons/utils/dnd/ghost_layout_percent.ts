export function ghostLayoutPercent(
  startsAt: string,
  endsAt: string,
  day: Date,
  dayStartHour: number,
  dayEndHour: number
): { top: number; height: number } {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  dayStart.setHours(dayStartHour, 0, 0, 0)
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  dayEnd.setHours(dayEndHour, 0, 0, 0)
  const totalMs = Math.max(dayEnd.getTime() - dayStart.getTime(), 1)

  const eventStart = Math.max(new Date(startsAt).getTime(), dayStart.getTime())
  const eventEnd = Math.min(new Date(endsAt).getTime(), dayEnd.getTime())
  const top = ((eventStart - dayStart.getTime()) / totalMs) * 100
  const height = Math.max(((eventEnd - eventStart) / totalMs) * 100, 3)

  return { top, height }
}
