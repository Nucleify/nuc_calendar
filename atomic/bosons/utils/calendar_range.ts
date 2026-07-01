export type CalendarView = 'month' | 'week' | 'day'

export const CALENDAR_VIEWS: CalendarView[] = ['day', 'week', 'month']

export function parseCalendarView(value: unknown): CalendarView {
  if (value === 'day' || value === 'week' || value === 'month') return value
  return 'week'
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function endOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const day = date.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  return startOfDay(addDays(date, -diff))
}

export function endOfWeek(date: Date, weekStartsOn = 1): Date {
  return endOfDay(addDays(startOfWeek(date, weekStartsOn), 6))
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function getRangeForView(
  view: CalendarView,
  anchor: Date,
  weekStartsOn = 1
): { from: Date; to: Date } {
  if (view === 'day') {
    return { from: startOfDay(anchor), to: endOfDay(anchor) }
  }
  if (view === 'week') {
    return {
      from: startOfWeek(anchor, weekStartsOn),
      to: endOfWeek(anchor, weekStartsOn),
    }
  }
  const monthStart = startOfMonth(anchor)
  const gridStart = startOfWeek(monthStart, weekStartsOn)
  const monthEnd = endOfMonth(anchor)
  const gridEnd = endOfWeek(monthEnd, weekStartsOn)
  return { from: gridStart, to: gridEnd }
}

export function formatRangeLabel(
  view: CalendarView,
  anchor: Date,
  weekStartsOn = 1,
  locale = 'en'
): string {
  const { from, to } = getRangeForView(view, anchor, weekStartsOn)
  const monthFmt = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  })
  const dayFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  })

  if (view === 'month') return monthFmt.format(anchor)
  if (view === 'day') return dayFmt.format(anchor)
  return `${dayFmt.format(from)} – ${dayFmt.format(to)}`
}

export function toIsoRange(from: Date, to: Date): { from: string; to: string } {
  return { from: from.toISOString(), to: to.toISOString() }
}

export function hoursInRange(
  dayStartHour: number,
  dayEndHour: number
): number[] {
  const hours: number[] = []
  for (let hour = dayStartHour; hour <= dayEndHour; hour += 1) {
    hours.push(hour)
  }
  return hours
}

export function hourOffsetPercent(
  hour: number,
  dayStartHour: number,
  dayEndHour: number
): number {
  const total = dayEndHour - dayStartHour
  if (total <= 0) return 0
  return ((hour - dayStartHour) / total) * 100
}

export function hourLabelStyle(
  hour: number,
  dayStartHour: number,
  dayEndHour: number
): { top: string; transform: string } {
  if (hour === dayStartHour) {
    return { top: '0', transform: 'translateY(0)' }
  }

  const top = hourOffsetPercent(hour, dayStartHour, dayEndHour)
  return { top: `${top}%`, transform: 'translateY(-50%)' }
}

export function hourSlotStyle(
  hour: number,
  hourIndex: number,
  hours: number[],
  dayStartHour: number,
  dayEndHour: number
): { top: string; height: string } {
  const top = hourOffsetPercent(hour, dayStartHour, dayEndHour)
  const nextHour = hours[hourIndex + 1]
  if (nextHour === undefined) {
    return { top: `${top}%`, height: '0%' }
  }
  const bottom = hourOffsetPercent(nextHour, dayStartHour, dayEndHour)
  return {
    top: `${top}%`,
    height: `${bottom - top}%`,
  }
}

export function bookableHours(
  dayStartHour: number,
  dayEndHour: number
): number[] {
  const hours = hoursInRange(dayStartHour, dayEndHour)
  if (hours.length <= 1) return []
  return hours.slice(0, -1)
}

export function calendarGridHeightPx(
  dayStartHour: number,
  dayEndHour: number,
  hourHeight: number
): number {
  return Math.max(dayEndHour - dayStartHour, 1) * hourHeight
}

export function calendarScrollTopForNow(
  scrollEl: HTMLElement,
  dayStartHour: number,
  dayEndHour: number,
  hourHeight: number
): number {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60
  if (hour < dayStartHour || hour > dayEndHour) return 0
  const gridHeight = calendarGridHeightPx(dayStartHour, dayEndHour, hourHeight)
  const offset =
    (hourOffsetPercent(hour, dayStartHour, dayEndHour) / 100) * gridHeight
  return Math.max(0, offset - scrollEl.clientHeight / 3)
}

export function defaultNewEventHour(
  dayStartHour: number,
  dayEndHour: number
): number {
  const now = new Date().getHours()
  return Math.min(
    Math.max(now, dayStartHour),
    Math.max(dayEndHour - 1, dayStartHour)
  )
}

export function eventsForDay<T extends { starts_at: string; ends_at: string }>(
  events: T[],
  day: Date
): T[] {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)
  return events.filter((event) => {
    const starts = new Date(event.starts_at)
    const ends = new Date(event.ends_at)
    return starts < dayEnd && ends > dayStart
  })
}

export function weekDays(anchor: Date, weekStartsOn = 1): Date[] {
  const start = startOfWeek(anchor, weekStartsOn)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function monthGridDays(anchor: Date, weekStartsOn = 1): Date[] {
  const { from, to } = getRangeForView('month', anchor, weekStartsOn)
  const days: Date[] = []
  let cursor = new Date(from)
  while (cursor <= to) {
    days.push(new Date(cursor))
    cursor = addDays(cursor, 1)
  }
  return days
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function shiftCalendarAnchor(
  view: CalendarView,
  anchor: Date,
  direction: -1 | 1
): Date {
  if (view === 'day') return addDays(anchor, direction)
  if (view === 'week') return addDays(anchor, direction * 7)
  return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
}

export function formatHourLabel(hour: number, locale = 'en'): string {
  if (hour >= 24) return ''
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatWeekdayLabel(
  date: Date,
  locale = 'en',
  weekday: 'short' | 'long' = 'short'
): string {
  return new Intl.DateTimeFormat(locale, { weekday }).format(date)
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate())
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}
