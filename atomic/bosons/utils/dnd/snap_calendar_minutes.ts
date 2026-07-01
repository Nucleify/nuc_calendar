export function snapCalendarMinutes(value: number, step = 15): number {
  return Math.round(value / step) * step
}
