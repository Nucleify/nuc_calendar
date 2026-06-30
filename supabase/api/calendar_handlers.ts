import { getQuery, readBody } from 'h3'

import type { ApiAuthRoute } from 'nuc_api'
import { apiError, apiMsg, apiOk, fromSupabaseError, whenAuth } from 'nuc_api'
import type { ApiContext, Json } from 'nuc_server'

import {
  formatCalendarRow,
  formatCalendarRows,
  nextEventReference,
  parseEventBody,
  trimString,
} from './calendar_helpers'
import { CALENDAR_INTEGRATION_PROVIDERS } from './integration_providers'

async function ensureDefaultCalendar(
  ctx: ApiContext,
  userId: string
): Promise<{ id: number } | { error: string }> {
  const { data: existing, error: listError } = await ctx.supabase
    .from('calendar_calendars')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (listError) return { error: listError.message }
  if (existing?.id) return { id: Number(existing.id) }

  const { data, error } = await ctx.supabase
    .from('calendar_calendars')
    .insert({
      user_id: userId,
      name: 'Meetings',
      slug: 'meetings',
      color: '#3B82F6',
      timezone: 'Europe/Warsaw',
      is_default: true,
      is_visible: true,
      sort_order: 0,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: Number(data.id) }
}

async function countUserEvents(
  ctx: ApiContext,
  userId: string
): Promise<number> {
  const { count } = await ctx.supabase
    .from('calendar_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

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
  const parsed = parseEventBody(raw ?? {})
  if ('error' in parsed) return apiError(400, parsed.error)

  const { data, error } = await ctx.supabase
    .from('calendar_events')
    .update({
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
      updated_at: new Date().toISOString(),
    })
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

export const calendarRoutes: ApiAuthRoute[] = [
  routeListCalendars,
  routeListIntegrations,
  routeListEvents,
  routeGetEvent,
  routeCreateEvent,
  routeUpdateEvent,
  routeDeleteEvent,
]
