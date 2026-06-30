import type {
  EntityResultsType,
  LoadingType,
  NucCalendarEventObjectInterface,
} from 'nucleify'

import type { CalendarIntegrationStatusInterface } from './interfaces'

export type { CalendarIntegrationStatusInterface } from './interfaces'

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
