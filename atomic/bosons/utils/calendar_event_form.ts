import type { NucCalendarEventObjectInterface } from '../types/object/event/interfaces'

export type CalendarEventDraft = Partial<NucCalendarEventObjectInterface>

export function defaultEventTimezone(): string {
  if (typeof Intl === 'undefined') return 'UTC'
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function buildEventDraftFromSlot(
  day: Date,
  hour: number,
  durationMinutes = 30
): CalendarEventDraft {
  const starts = new Date(day)
  starts.setHours(hour, 0, 0, 0)
  const ends = new Date(starts)
  ends.setMinutes(ends.getMinutes() + durationMinutes)

  return {
    title: '',
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    all_day: false,
    timezone: defaultEventTimezone(),
    status: 'confirmed',
    show_as: 'busy',
    source: 'nucleify',
  }
}

export function readCalendarEventFieldValue(
  draft: CalendarEventDraft,
  name: string
): string | Date | null {
  if (name === 'starts_at' || name === 'ends_at') {
    const iso = draft[name]
    return iso ? new Date(iso) : null
  }

  const value = draft[name as keyof CalendarEventDraft]
  if (value === null || value === undefined) return ''
  return String(value)
}

export function writeCalendarEventFieldValue(
  draft: CalendarEventDraft,
  name: string,
  value: unknown
): CalendarEventDraft {
  const next: CalendarEventDraft = { ...draft }

  if (name === 'starts_at' || name === 'ends_at') {
    if (value instanceof Date) {
      next[name] = value.toISOString()
    } else if (typeof value === 'string' && value) {
      next[name] = new Date(value).toISOString()
    }
    return next
  }

  if (name === 'title') next.title = String(value ?? '')
  if (name === 'location') next.location = String(value ?? '')
  if (name === 'description') next.description = String(value ?? '')

  return next
}

export function formatEventTimeRange(
  startsAt: string,
  endsAt: string,
  locale = 'en'
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${formatter.format(new Date(startsAt))} – ${formatter.format(new Date(endsAt))}`
}
