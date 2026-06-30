import type { App } from 'vue'

import {
  NucCalendarBoard,
  NucCalendarDayGrid,
  NucCalendarEventBlock,
  NucCalendarEventDialog,
  NucCalendarIntegrationGrid,
  NucCalendarIntegrationTile,
  NucCalendarMonthGrid,
  NucCalendarPage,
  NucCalendarWeekGrid,
} from 'nucleify'

export function registerNucCalendar(app: App<Element>): void {
  app
    .component('nuc-calendar-page', NucCalendarPage)
    .component('nuc-calendar-board', NucCalendarBoard)
    .component('nuc-calendar-integration-grid', NucCalendarIntegrationGrid)
    .component('nuc-calendar-integration-tile', NucCalendarIntegrationTile)
    .component('nuc-calendar-month-grid', NucCalendarMonthGrid)
    .component('nuc-calendar-week-grid', NucCalendarWeekGrid)
    .component('nuc-calendar-day-grid', NucCalendarDayGrid)
    .component('nuc-calendar-event-block', NucCalendarEventBlock)
    .component('nuc-calendar-event-dialog', NucCalendarEventDialog)
}
