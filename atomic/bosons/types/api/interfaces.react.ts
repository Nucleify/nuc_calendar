import type {
  EntityResultsType,
  LoadingType,
  NucCalendarEventObjectInterface,
} from 'nucleify'

import type {
  CalendarAvailabilityRuleDraft,
  CalendarAvailabilityRuleInterface,
  CalendarAvailableSlot,
  CalendarIntegrationStatusInterface,
} from './interfaces'

export interface NucCalendarRequestsInterface {
  events: EntityResultsType<NucCalendarEventObjectInterface>
  integrations: EntityResultsType<CalendarIntegrationStatusInterface>
  availability: EntityResultsType<CalendarAvailabilityRuleInterface>
  loading: LoadingType
  getIntegrations: (showLoading?: boolean) => Promise<void>
  getEventsInRange: (
    from: string,
    to: string,
    showLoading?: boolean
  ) => Promise<void>
  getAvailability: (calendarId?: number, showLoading?: boolean) => Promise<void>
  putAvailability: (
    calendarId: number,
    rules: CalendarAvailabilityRuleDraft[],
    showLoading?: boolean
  ) => Promise<boolean>
  getAvailableSlots: (
    calendarId: number,
    date: string,
    durationMinutes: number,
    stepMinutes?: number,
    showLoading?: boolean
  ) => Promise<CalendarAvailableSlot[]>
  createEvent: (
    body: Partial<NucCalendarEventObjectInterface>
  ) => Promise<boolean>
  updateEvent: (
    id: number,
    body: Partial<NucCalendarEventObjectInterface>,
    showLoading?: boolean
  ) => Promise<boolean>
  moveEventTimes: (
    id: number,
    starts_at: string,
    ends_at: string
  ) => Promise<boolean>
  cancelEvent: (id: number) => Promise<boolean>
}
