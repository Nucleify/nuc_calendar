import type { Json } from 'nuc_server'
import {
  formatRowResponseTimestamps,
  formatRowsResponseTimestamps,
} from 'nuc_server'

export function formatCalendarRow(row: unknown): unknown {
  return formatRowResponseTimestamps(row)
}

export function formatCalendarRows(rows: unknown[]): unknown[] {
  return formatRowsResponseTimestamps(rows)
}

export function trimString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export interface ParsedEventBody {
  title: string
  description: string | null
  location: string | null
  meeting_url: string | null
  starts_at: string
  ends_at: string
  all_day: boolean
  timezone: string
  status: string
  show_as: string
  calendar_id: unknown
  contact_id: unknown
  color: string | null
}

export function parseEventBody(
  body: Json
): ParsedEventBody | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid body' }
  }

  const record = body as Record<string, unknown>
  const title = trimString(record.title)
  const startsAt = trimString(record.starts_at)
  const endsAt = trimString(record.ends_at)

  if (!title) return { error: 'title is required' }
  if (!startsAt) return { error: 'starts_at is required' }
  if (!endsAt) return { error: 'ends_at is required' }

  const starts = new Date(startsAt)
  const ends = new Date(endsAt)
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    return { error: 'starts_at and ends_at must be valid ISO dates' }
  }
  if (ends <= starts) return { error: 'ends_at must be after starts_at' }

  return {
    title,
    description: trimString(record.description) || null,
    location: trimString(record.location) || null,
    meeting_url: trimString(record.meeting_url) || null,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    all_day: Boolean(record.all_day),
    timezone: trimString(record.timezone, 'UTC'),
    status: trimString(record.status, 'confirmed'),
    show_as: trimString(record.show_as, 'busy'),
    calendar_id: record.calendar_id ?? null,
    contact_id: record.contact_id ?? null,
    color: trimString(record.color) || null,
  }
}

export function nextEventReference(userId: string, sequence: number): string {
  const compact = userId.replace(/-/g, '').slice(0, 6).toUpperCase()
  return `CAL-${compact}-${String(sequence).padStart(5, '0')}`
}
