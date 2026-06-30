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
  loading: LoadingType
  getIntegrations: (showLoading?: boolean) => Promise<void>
  getEventsInRange: (
    from: string,
    to: string,
    showLoading?: boolean
  ) => Promise<void>
  createEvent: (
    body: Partial<NucCalendarEventObjectInterface>
  ) => Promise<boolean>
  updateEvent: (
    id: number,
    body: Partial<NucCalendarEventObjectInterface>
  ) => Promise<boolean>
  cancelEvent: (id: number) => Promise<boolean>
}
