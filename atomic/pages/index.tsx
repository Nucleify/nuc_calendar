'use client'

import type { JSX } from 'react'
import { useEffect, useState } from 'react'

import {
  AdDialog,
  buildEventDraftFromSlot,
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_DEFAULT_VIEW,
  CALENDAR_SLOT_DURATION_MINUTES,
  CALENDAR_WEEK_STARTS_ON,
  type CalendarEventDraft,
  type CalendarView,
  calendarRequests,
  defaultNewEventHour,
  getRangeForView,
  NucCalendarBoard,
  NucCalendarEventDialog,
  type NucCalendarEventObjectInterface,
  NucCalendarIntegrationGrid,
  parseCalendarView,
  shiftCalendarAnchor,
  toIsoRange,
} from 'nucleify'

import './_index.scss'

export function NucCalendarPage(): JSX.Element {
  const {
    events,
    integrations,
    loading,
    getIntegrations,
    getEventsInRange,
    createEvent,
    updateEvent,
    cancelEvent,
  } = calendarRequests('next')

  const [view, setView] = useState<CalendarView>(
    parseCalendarView(CALENDAR_DEFAULT_VIEW)
  )
  const [anchor, setAnchor] = useState(() => new Date())
  const [integrationsVisible, setIntegrationsVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [eventDraft, setEventDraft] = useState<CalendarEventDraft>(
    buildEventDraftFromSlot(new Date(), CALENDAR_DAY_START_HOUR)
  )

  const eventsList = (events ?? []) as NucCalendarEventObjectInterface[]
  const integrationsList = integrations ?? []

  async function refreshEvents(): Promise<void> {
    const range = getRangeForView(view, anchor, CALENDAR_WEEK_STARTS_ON)
    const iso = toIsoRange(range.from, range.to)
    await getEventsInRange(iso.from, iso.to, false)
  }

  const navigate = (direction: -1 | 1) => {
    setAnchor((current) => shiftCalendarAnchor(view, current, direction))
  }

  const goToday = () => {
    setAnchor(new Date())
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    setEventDraft(
      buildEventDraftFromSlot(
        anchor,
        defaultNewEventHour(CALENDAR_DAY_START_HOUR, CALENDAR_DAY_END_HOUR),
        CALENDAR_SLOT_DURATION_MINUTES
      )
    )
    setDialogVisible(true)
  }

  const openCreateFromSlot = (day: Date, hour: number) => {
    setDialogMode('create')
    setEventDraft(
      buildEventDraftFromSlot(day, hour, CALENDAR_SLOT_DURATION_MINUTES)
    )
    setDialogVisible(true)
  }

  const openDayView = (day: Date) => {
    setView('day')
    setAnchor(day)
  }

  const openEditDialog = (event: NucCalendarEventObjectInterface) => {
    setDialogMode('edit')
    setEventDraft({ ...event })
    setDialogVisible(true)
  }

  const saveEvent = async (draft: CalendarEventDraft) => {
    const ok =
      dialogMode === 'edit' && draft.id
        ? await updateEvent(draft.id, draft)
        : await createEvent(draft)
    if (!ok) return
    setDialogVisible(false)
    await refreshEvents()
  }

  const removeEvent = async (id: number) => {
    const ok = await cancelEvent(id)
    if (!ok) return
    setDialogVisible(false)
    await refreshEvents()
  }

  useEffect(() => {
    void getIntegrations(false)
  }, [])

  useEffect(() => {
    const range = getRangeForView(view, anchor, CALENDAR_WEEK_STARTS_ON)
    const iso = toIsoRange(range.from, range.to)
    void getEventsInRange(iso.from, iso.to, false)
  }, [view, anchor])

  return (
    <div className="panel-container">
      <NucCalendarBoard
        view={view}
        anchor={anchor}
        events={eventsList}
        loading={loading}
        dayStartHour={CALENDAR_DAY_START_HOUR}
        dayEndHour={CALENDAR_DAY_END_HOUR}
        weekStartsOn={CALENDAR_WEEK_STARTS_ON}
        integrationsOpen={integrationsVisible}
        onViewChange={setView}
        onNavigate={navigate}
        onToday={goToday}
        onNewEvent={openCreateDialog}
        onOpenIntegrations={() => setIntegrationsVisible(true)}
        onSlotClick={openCreateFromSlot}
        onDayClick={openDayView}
        onEventSelect={openEditDialog}
      />
      <AdDialog
        visible={integrationsVisible}
        modal
        className="calendar-integrations-dialog"
        showHeader
        header={<span>Integrations</span>}
        onHide={() => setIntegrationsVisible(false)}
      >
        <NucCalendarIntegrationGrid integrations={integrationsList} />
      </AdDialog>
      <NucCalendarEventDialog
        visible={dialogVisible}
        draft={eventDraft}
        mode={dialogMode}
        onClose={() => setDialogVisible(false)}
        onSave={saveEvent}
        onCancelEvent={removeEvent}
      />
    </div>
  )
}
