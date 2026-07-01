import type {
  CalendarIntegrationProviderDefinition,
  EntityResultsType,
  LoadingType,
  NucCalendarEventObjectInterface,
} from 'nucleify'

export interface CalendarIntegrationStatusInterface
  extends CalendarIntegrationProviderDefinition {
  connected: boolean
  status: 'disconnected' | 'connected' | 'error' | 'reauth_required'
  last_synced_at: string | null
}

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

export interface CalendarAvailabilityRuleDraft {
  day_of_week: number
  start_time: string
  end_time: string
  effective_from?: string | null
  effective_until?: string | null
}

export interface CalendarAvailabilityRuleInterface
  extends CalendarAvailabilityRuleDraft {
  id: number
  user_id: string
  calendar_id: number
  created_at: string
}

export interface CalendarAvailableSlot {
  starts_at: string
  ends_at: string
}
