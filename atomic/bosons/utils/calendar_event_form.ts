import type { NucCalendarEventObjectInterface } from 'nucleify'
import {
  CALENDAR_EVENT_DURATION_MINUTES,
  DEFAULT_CALENDAR_EVENT_DURATION_MINUTES,
} from 'nucleify'

export type CalendarEventDraft = Partial<NucCalendarEventObjectInterface>

export function eventDurationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return DEFAULT_CALENDAR_EVENT_DURATION_MINUTES
  }

  const diff = Math.round((end - start) / 60_000)
  if ((CALENDAR_EVENT_DURATION_MINUTES as readonly number[]).includes(diff)) {
    return diff
  }

  return CALENDAR_EVENT_DURATION_MINUTES.reduce((best, option) =>
    Math.abs(option - diff) < Math.abs(best - diff) ? option : best
  )
}

export function mergeStartDatePreservingTime(
  existingStartsIso: string | undefined,
  dateValue: unknown
): string {
  const base = existingStartsIso ? new Date(existingStartsIso) : new Date()
  if (Number.isNaN(base.getTime())) base.setTime(Date.now())

  let picked: Date | null = null
  if (dateValue instanceof Date) {
    picked = dateValue
  } else if (typeof dateValue === 'string' && dateValue) {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue)
    if (dateOnly) {
      const [, year, month, day] = dateOnly
      picked = new Date(Number(year), Number(month) - 1, Number(day))
    } else {
      picked = new Date(dateValue)
    }
  }

  if (!picked || Number.isNaN(picked.getTime())) return base.toISOString()

  base.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate())
  return base.toISOString()
}

export function endsAtFromStartAndDuration(
  startsAtIso: string,
  durationMinutes: number
): string {
  return new Date(
    new Date(startsAtIso).getTime() + durationMinutes * 60_000
  ).toISOString()
}

export function applyEventDuration(
  draft: CalendarEventDraft,
  durationMinutes: number
): CalendarEventDraft {
  const starts = draft.starts_at
  if (!starts) return draft
  return {
    ...draft,
    ends_at: endsAtFromStartAndDuration(starts, durationMinutes),
  }
}

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
      next[name] =
        name === 'starts_at'
          ? mergeStartDatePreservingTime(draft.starts_at, value)
          : value.toISOString()
    } else if (typeof value === 'string' && value) {
      next[name] =
        name === 'starts_at'
          ? mergeStartDatePreservingTime(draft.starts_at, value)
          : new Date(value).toISOString()
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
