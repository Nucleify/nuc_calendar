import { getQuery, readBody } from 'h3'

import type { ApiAuthRoute } from 'nuc_api'
import { apiError, apiMsg, apiOk, fromSupabaseError, whenAuth } from 'nuc_api'
import type { ApiContext, Json } from 'nuc_server'

import {
  formatCalendarRow,
  formatCalendarRows,
  nextEventReference,
  parseEventBody,
  parseEventPatchBody,
  trimString,
} from './calendar_helpers'

import { CALENDAR_INTEGRATION_PROVIDERS } from '../../atomic/bosons/constants/integration_providers'
import { parseAvailabilityPutBody } from './utils/availability_rules'
import type { CalendarAvailabilityRuleRow } from './utils/availability_slots'
import { computeDaySlots } from './utils/availability_slots'
import {
  countUserEvents,
  ensureDefaultCalendar,
} from './utils/calendar_repository'
import { isoDate, parseIntParam } from './utils/query'

export async function handleListCalendars(ctx: ApiContext, userId: string) {
  const { data, error } = await ctx.supabase
    .from('calendar_calendars')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) return fromSupabaseError(error)
  return apiOk(ctx, formatCalendarRows(data ?? []))
}

export async function handleListIntegrations(ctx: ApiContext, _userId: string) {
  const integrations = CALENDAR_INTEGRATION_PROVIDERS.map((provider) => ({
    ...provider,
    connected: false,
    status: 'disconnected' as const,
    last_synced_at: null,
  }))
  return apiOk(ctx, integrations)
}

export async function handleListEvents(ctx: ApiContext, userId: string) {
  const query = getQuery(ctx.event)
  const from = trimString(query.from)
  const to = trimString(query.to)

  if (!from || !to) {
    return apiError(400, 'Query params from and to are required (ISO 8601).')
  }

  let request = ctx.supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .lt('starts_at', to)
    .gt('ends_at', from)
    .order('starts_at', { ascending: true })

  const calendarIds = trimString(query.calendar_ids)
  if (calendarIds) {
    const ids = calendarIds
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (ids.length > 0) {
      request = request.in('calendar_id', ids)
    }
  }

  const { data, error } = await request
  if (error) return fromSupabaseError(error)
  return apiOk(ctx, formatCalendarRows(data ?? []))
}

export async function handleGetEvent(ctx: ApiContext, userId: string) {
  const id = ctx.segments[2]
  if (!id) return apiError(400, 'Event id is required')

  const { data, error } = await ctx.supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return fromSupabaseError(error)
  if (!data) return apiError(404, 'Event not found')
  return apiOk(ctx, formatCalendarRow(data))
}

export async function handleCreateEvent(ctx: ApiContext, userId: string) {
  const raw = (await readBody(ctx.event)) as Json | null
  const parsed = parseEventBody(raw ?? {})
  if ('error' in parsed) return apiError(400, parsed.error)

  let calendarId = parsed.calendar_id ? Number(parsed.calendar_id) : null
  if (!calendarId || Number.isNaN(calendarId)) {
    const ensured = await ensureDefaultCalendar(ctx, userId)
    if ('error' in ensured) return apiError(500, ensured.error)
    calendarId = ensured.id
  }

  const sequence = (await countUserEvents(ctx, userId)) + 1
  const reference = nextEventReference(userId, sequence)

  const { data, error } = await ctx.supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      calendar_id: calendarId,
      reference,
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      meeting_url: parsed.meeting_url,
      starts_at: parsed.starts_at,
      ends_at: parsed.ends_at,
      all_day: parsed.all_day,
      timezone: parsed.timezone,
      status: parsed.status,
      show_as: parsed.show_as,
      contact_id: parsed.contact_id,
      color: parsed.color,
      source: 'manual',
    })
    .select('*')
    .single()

  if (error) return fromSupabaseError(error, 400)
  return apiOk(ctx, formatCalendarRow(data), 201)
}

export async function handleUpdateEvent(ctx: ApiContext, userId: string) {
  const id = ctx.segments[2]
  if (!id) return apiError(400, 'Event id is required')

  const raw = (await readBody(ctx.event)) as Json | null
  const parsed = parseEventPatchBody(raw ?? {})
  if ('error' in parsed) return apiError(400, parsed.error)

  const { data, error } = await ctx.supabase
    .from('calendar_events')
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) return fromSupabaseError(error, 400)
  if (!data) return apiError(404, 'Event not found')
  return apiOk(ctx, formatCalendarRow(data))
}

export async function handleDeleteEvent(ctx: ApiContext, userId: string) {
  const id = ctx.segments[2]
  if (!id) return apiError(400, 'Event id is required')

  const { data, error } = await ctx.supabase
    .from('calendar_events')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()

  if (error) return fromSupabaseError(error)
  if (!data) return apiError(404, 'Event not found')
  return apiMsg('Event cancelled')
}

export async function handleGetAvailability(ctx: ApiContext, userId: string) {
  const query = getQuery(ctx.event)
  const calendarId = trimString(query.calendar_id)

  let q = ctx.supabase
    .from('calendar_availability_rules')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (calendarId) q = q.eq('calendar_id', calendarId)

  const { data, error } = await q
  if (error) return fromSupabaseError(error)
  return apiOk(ctx, data ?? [])
}

export async function handlePutAvailability(ctx: ApiContext, userId: string) {
  const raw = (await readBody(ctx.event)) as Json | null
  const parsed = parseAvailabilityPutBody(raw, userId)
  if ('error' in parsed) return apiError(400, parsed.error)

  const { calendar_id: calendarId, rules: mapped } = parsed

  const { error: delError } = await ctx.supabase
    .from('calendar_availability_rules')
    .delete()
    .eq('user_id', userId)
    .eq('calendar_id', calendarId)

  if (delError) return fromSupabaseError(delError)

  if (mapped.length === 0) return apiMsg('Availability cleared')

  const { data, error } = await ctx.supabase
    .from('calendar_availability_rules')
    .insert(mapped)
    .select('*')

  if (error) return fromSupabaseError(error, 400)
  return apiOk(ctx, data ?? [])
}

export async function handleGetAvailableSlots(ctx: ApiContext, userId: string) {
  const query = getQuery(ctx.event)
  const dateStr = isoDate(query.date)
  const calendarId = trimString(query.calendar_id)
  const durationMinutes = parseIntParam(query.duration_minutes, 30)
  const stepMinutes = parseIntParam(query.step_minutes, 30)

  if (!dateStr) return apiError(400, 'date is required (YYYY-MM-DD)')
  if (!calendarId) return apiError(400, 'calendar_id is required')

  const day = new Date(`${dateStr}T00:00:00.000Z`)
  const dayStart = `${dateStr}T00:00:00.000Z`
  const dayEnd = `${dateStr}T23:59:59.999Z`

  const { data: rules, error: rulesError } = await ctx.supabase
    .from('calendar_availability_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('calendar_id', calendarId)

  if (rulesError) return fromSupabaseError(rulesError)

  const { data: events, error: eventsError } = await ctx.supabase
    .from('calendar_events')
    .select('starts_at, ends_at')
    .eq('user_id', userId)
    .eq('calendar_id', calendarId)
    .neq('status', 'cancelled')
    .lt('starts_at', dayEnd)
    .gt('ends_at', dayStart)

  if (eventsError) return fromSupabaseError(eventsError)

  const slots = computeDaySlots(
    day,
    durationMinutes,
    stepMinutes,
    (rules ?? []) as CalendarAvailabilityRuleRow[],
    (events ?? []) as Array<{ starts_at: string; ends_at: string }>
  )

  return apiOk(ctx, slots)
}

export const routeListCalendars = whenAuth(
  { method: 'GET', len: 2, path: ['calendar', 'calendars'] },
  handleListCalendars
)

export const routeListIntegrations = whenAuth(
  { method: 'GET', len: 2, path: ['calendar', 'integrations'] },
  handleListIntegrations
)

export const routeListEvents = whenAuth(
  { method: 'GET', len: 2, path: ['calendar', 'events'] },
  handleListEvents
)

export const routeGetEvent = whenAuth(
  { method: 'GET', len: 3, path: ['calendar', 'events'] },
  handleGetEvent
)

export const routeCreateEvent = whenAuth(
  { method: 'POST', len: 2, path: ['calendar', 'events'] },
  handleCreateEvent
)

export const routeUpdateEvent = whenAuth(
  { method: ['PUT', 'PATCH'], len: 3, path: ['calendar', 'events'] },
  handleUpdateEvent
)

export const routeDeleteEvent = whenAuth(
  { method: 'DELETE', len: 3, path: ['calendar', 'events'] },
  handleDeleteEvent
)

export const routeGetAvailability = whenAuth(
  { method: 'GET', len: 2, path: ['calendar', 'availability'] },
  handleGetAvailability
)

export const routePutAvailability = whenAuth(
  { method: ['PUT', 'PATCH'], len: 2, path: ['calendar', 'availability'] },
  handlePutAvailability
)

export const routeGetAvailableSlots = whenAuth(
  { method: 'GET', len: 2, path: ['calendar', 'available-slots'] },
  handleGetAvailableSlots
)

export const calendarRoutes: ApiAuthRoute[] = [
  routeListCalendars,
  routeListIntegrations,
  routeListEvents,
  routeGetEvent,
  routeCreateEvent,
  routeUpdateEvent,
  routeDeleteEvent,
  routeGetAvailability,
  routePutAvailability,
  routeGetAvailableSlots,
]
