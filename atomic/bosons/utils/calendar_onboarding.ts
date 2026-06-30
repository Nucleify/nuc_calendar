export const CALENDAR_ONBOARDING_STORAGE_KEY =
  'nuc_calendar_onboarding_dismissed'

export function readCalendarOnboardingDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(CALENDAR_ONBOARDING_STORAGE_KEY) === '1'
}

export function dismissCalendarOnboarding(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CALENDAR_ONBOARDING_STORAGE_KEY, '1')
}

export interface CalendarIntegrationLike {
  connected: boolean
}

export function countConnectedIntegrations(
  integrations: CalendarIntegrationLike[]
): number {
  return integrations.filter((integration) => integration.connected).length
}

export function shouldShowIntegrationFirstScreen(
  integrationsConnected: number,
  onboardingDismissed: boolean
): boolean {
  return integrationsConnected === 0 && !onboardingDismissed
}
