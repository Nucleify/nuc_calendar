export type CalendarIntegrationProviderId =
  | 'calendly'
  | 'google_calendar'
  | 'microsoft_outlook'
  | 'zoom'
  | 'google_meet'
  | 'microsoft_teams'
  | 'hubspot_meetings'
  | 'acuity'

export interface CalendarIntegrationProviderDefinition {
  id: CalendarIntegrationProviderId
  name: string
  description: string
  connectable: boolean
  phase: number
}

export const CALENDAR_INTEGRATION_PROVIDERS: CalendarIntegrationProviderDefinition[] =
  [
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Import bookings and scheduled meetings.',
      connectable: false,
      phase: 4,
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync events from your Google account.',
      connectable: false,
      phase: 4,
    },
    {
      id: 'microsoft_outlook',
      name: 'Microsoft Outlook',
      description: 'Sync events from Outlook / Microsoft 365.',
      connectable: false,
      phase: 4,
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Add Zoom meeting links to new events.',
      connectable: false,
      phase: 5,
    },
    {
      id: 'google_meet',
      name: 'Google Meet',
      description: 'Add Google Meet links when creating events.',
      connectable: false,
      phase: 5,
    },
    {
      id: 'microsoft_teams',
      name: 'Microsoft Teams',
      description: 'Add Teams meeting links when creating events.',
      connectable: false,
      phase: 5,
    },
    {
      id: 'hubspot_meetings',
      name: 'HubSpot Meetings',
      description: 'Import CRM meeting bookings.',
      connectable: false,
      phase: 5,
    },
    {
      id: 'acuity',
      name: 'Acuity Scheduling',
      description: 'Import Acuity appointment bookings.',
      connectable: false,
      phase: 5,
    },
  ]
