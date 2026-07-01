export function eventMinutesInDayGrid(
  iso: string,
  day: Date,
  dayStartHour: number
): number {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  dayStart.setHours(dayStartHour, 0, 0, 0)
  return (new Date(iso).getTime() - dayStart.getTime()) / 60_000
}
