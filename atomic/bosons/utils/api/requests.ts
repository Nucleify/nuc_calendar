'use client'

import type {
  AppFramework,
  CalendarAvailabilityRuleDraft,
  CalendarAvailabilityRuleInterface,
  CalendarAvailableSlot,
  CalendarIntegrationStatusInterface,
  NucCalendarEventObjectInterface,
  NucCalendarRequestsInterface,
} from 'nucleify'
import {
  apiHandle,
  createEntityCollectionState,
  createEntityRequestState,
  useLoading,
} from 'nucleify'

const CALENDAR_BASE = '/calendar'

export function calendarRequests(
  framework: AppFramework = 'nuxt'
): NucCalendarRequestsInterface {
  const { results: events, setResults: setEvents } =
    createEntityRequestState<NucCalendarEventObjectInterface>(framework)

  const { items: integrations, setItems: setIntegrations } =
    createEntityCollectionState<CalendarIntegrationStatusInterface>(framework)

  const { items: availability, setItems: setAvailability } =
    createEntityCollectionState<CalendarAvailabilityRuleInterface>(framework)

  const { loading, setLoading } = useLoading()

  async function getIntegrations(showLoading = true): Promise<void> {
    await apiHandle<CalendarIntegrationStatusInterface[]>({
      url: `${CALENDAR_BASE}/integrations`,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: setIntegrations,
    })
  }

  async function getEventsInRange(
    from: string,
    to: string,
    showLoading = true
  ): Promise<void> {
    const query = new URLSearchParams({ from, to }).toString()
    await apiHandle<NucCalendarEventObjectInterface[]>({
      url: `${CALENDAR_BASE}/events?${query}`,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: setEvents,
    })
  }

  async function getAvailability(
    calendarId?: number,
    showLoading = true
  ): Promise<void> {
    const query = calendarId
      ? `?${new URLSearchParams({ calendar_id: String(calendarId) }).toString()}`
      : ''
    await apiHandle<CalendarAvailabilityRuleInterface[]>({
      url: `${CALENDAR_BASE}/availability${query}`,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: setAvailability,
    })
  }

  async function putAvailability(
    calendarId: number,
    rules: CalendarAvailabilityRuleDraft[],
    showLoading = true
  ): Promise<boolean> {
    let ok = false
    await apiHandle<CalendarAvailabilityRuleInterface[]>({
      url: `${CALENDAR_BASE}/availability`,
      method: 'PUT',
      data: { calendar_id: calendarId, rules },
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: () => {
        ok = true
      },
    })
    if (ok) await getAvailability(calendarId, false)
    return ok
  }

  async function getAvailableSlots(
    calendarId: number,
    date: string,
    durationMinutes: number,
    stepMinutes = 30,
    showLoading = true
  ): Promise<CalendarAvailableSlot[]> {
    let result: CalendarAvailableSlot[] = []
    const query = new URLSearchParams({
      calendar_id: String(calendarId),
      date,
      duration_minutes: String(durationMinutes),
      step_minutes: String(stepMinutes),
    }).toString()
    await apiHandle<CalendarAvailableSlot[]>({
      url: `${CALENDAR_BASE}/available-slots?${query}`,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: (data) => {
        result = data ?? []
      },
    })
    return result
  }

  async function createEvent(
    body: Partial<NucCalendarEventObjectInterface>
  ): Promise<boolean> {
    let ok = false
    await apiHandle<NucCalendarEventObjectInterface>({
      url: `${CALENDAR_BASE}/events`,
      method: 'POST',
      data: body,
      setLoading,
      onSuccess: () => {
        ok = true
      },
    })
    return ok
  }

  async function updateEvent(
    id: number,
    body: Partial<NucCalendarEventObjectInterface>,
    showLoading = true
  ): Promise<boolean> {
    let ok = false
    await apiHandle<NucCalendarEventObjectInterface>({
      url: `${CALENDAR_BASE}/events`,
      method: 'PATCH',
      id,
      data: body,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: () => {
        ok = true
      },
    })
    return ok
  }

  function patchEventTimes(
    id: number,
    starts_at: string,
    ends_at: string
  ): void {
    const list = Array.isArray(events)
      ? events
      : ((events as { value?: NucCalendarEventObjectInterface[] }).value ?? [])
    setEvents(
      list.map((item) =>
        Number(item.id) === id ? { ...item, starts_at, ends_at } : item
      )
    )
  }

  async function moveEventTimes(
    id: number,
    starts_at: string,
    ends_at: string
  ): Promise<boolean> {
    const list = Array.isArray(events)
      ? events
      : ((events as { value?: NucCalendarEventObjectInterface[] }).value ?? [])
    const previous = list.find((item) => Number(item.id) === id)
    if (!previous) return false

    patchEventTimes(id, starts_at, ends_at)
    const ok = await updateEvent(id, { starts_at, ends_at }, false)
    if (!ok) {
      patchEventTimes(id, previous.starts_at, previous.ends_at)
      return false
    }
    return true
  }

  async function cancelEvent(id: number): Promise<boolean> {
    let ok = false
    await apiHandle<{ message: string }>({
      url: `${CALENDAR_BASE}/events`,
      method: 'DELETE',
      id,
      setLoading,
      onSuccess: () => {
        ok = true
      },
    })
    return ok
  }

  return {
    events,
    integrations,
    availability,
    loading,
    getIntegrations,
    getEventsInRange,
    getAvailability,
    putAvailability,
    getAvailableSlots,
    createEvent,
    updateEvent,
    moveEventTimes,
    cancelEvent,
  }
}
