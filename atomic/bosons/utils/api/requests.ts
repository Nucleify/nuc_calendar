'use client'

import type {
  AppFramework,
  NucCalendarEventObjectInterface,
  NucCalendarRequestsInterface,
} from 'nucleify'
import {
  apiHandle,
  createEntityCollectionState,
  createEntityRequestState,
  useLoading,
} from 'nucleify'

import type { CalendarIntegrationStatusInterface } from '../../types/api/interfaces'

const CALENDAR_BASE = '/calendar'

export function calendarRequests(
  framework: AppFramework = 'nuxt'
): NucCalendarRequestsInterface {
  const { results: events, setResults: setEvents } =
    createEntityRequestState<NucCalendarEventObjectInterface>(framework)

  const { items: integrations, setItems: setIntegrations } =
    createEntityCollectionState<CalendarIntegrationStatusInterface>(framework)

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
    body: Partial<NucCalendarEventObjectInterface>
  ): Promise<boolean> {
    let ok = false
    await apiHandle<NucCalendarEventObjectInterface>({
      url: `${CALENDAR_BASE}/events`,
      method: 'PATCH',
      id,
      data: body,
      setLoading,
      onSuccess: () => {
        ok = true
      },
    })
    return ok
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
    loading,
    getIntegrations,
    getEventsInRange,
    createEvent,
    updateEvent,
    cancelEvent,
  }
}
