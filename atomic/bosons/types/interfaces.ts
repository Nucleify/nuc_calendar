import type { CalendarIntegrationProviderId } from 'nucleify'

export interface CalendarIntegrationProviderDefinition {
  id: CalendarIntegrationProviderId
  name: string
  description: string
  connectable: boolean
  phase: number
}
