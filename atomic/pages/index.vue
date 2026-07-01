<template>
  <div class="panel-container">
    <nuc-calendar-board
      :view="view"
      :anchor="anchor"
      :events="eventsList"
      :loading="loading"
      :day-start-hour="dayStartHour"
      :day-end-hour="dayEndHour"
      :week-starts-on="weekStartsOn"
      :integrations-open="integrationsVisible"
      @view-change="setView"
      @navigate="navigate"
      @today="goToday"
      @new-event="openCreateDialog"
      @open-integrations="integrationsVisible = true"
      @slot-click="openCreateFromSlot"
      @day-click="openDayView"
      @event-select="openEditDialog"
      @event-move="moveEvent"
      @event-resize="moveEvent"
    />
    <ad-dialog
      :visible="integrationsVisible"
      modal
      class="calendar-integrations-dialog"
      @update:visible="onIntegrationsVisibleUpdate"
    >
      <template #header>
        <span>{{ t('calendar-integrations') }}</span>
      </template>
      <nuc-calendar-integration-grid :integrations="integrationsList" />
    </ad-dialog>
    <nuc-calendar-event-dialog
      :visible="dialogVisible"
      :draft="eventDraft"
      :mode="dialogMode"
      @close="closeDialog"
      @save="saveEvent"
      @cancel-event="removeEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type {
  CalendarEventDraft,
  CalendarView,
  NucCalendarEventObjectInterface,
} from 'nucleify'
import {
  buildEventDraftFromSlot,
  calendarRequests,
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_DEFAULT_VIEW,
  CALENDAR_SLOT_DURATION_MINUTES,
  CALENDAR_WEEK_STARTS_ON,
  defaultNewEventHour,
  flashToast,
  getRangeForView,
  parseCalendarView,
  shiftCalendarAnchor,
  toIsoRange,
} from 'nucleify'

const {
  events,
  integrations,
  loading,
  getIntegrations,
  getEventsInRange,
  createEvent,
  moveEventTimes,
  updateEvent,
  cancelEvent,
} = calendarRequests()

const { t } = useI18n()

const view = ref<CalendarView>(parseCalendarView(CALENDAR_DEFAULT_VIEW))
const anchor = ref(new Date())
const integrationsVisible = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const eventDraft = ref<CalendarEventDraft>(
  buildEventDraftFromSlot(new Date(), 9)
)

const dayStartHour = CALENDAR_DAY_START_HOUR
const dayEndHour = CALENDAR_DAY_END_HOUR
const weekStartsOn = CALENDAR_WEEK_STARTS_ON

const eventsList = computed(
  () => (events.value ?? []) as NucCalendarEventObjectInterface[]
)
const integrationsList = computed(() => integrations.value ?? [])

async function refreshEvents(): Promise<void> {
  const range = getRangeForView(view.value, anchor.value, weekStartsOn)
  const iso = toIsoRange(range.from, range.to)
  await getEventsInRange(iso.from, iso.to, false)
}

function onIntegrationsVisibleUpdate(value: boolean): void {
  integrationsVisible.value = value
}

function setView(next: CalendarView): void {
  view.value = next
}

function navigate(direction: -1 | 1): void {
  anchor.value = shiftCalendarAnchor(view.value, anchor.value, direction)
}

function goToday(): void {
  anchor.value = new Date()
}

function openCreateDialog(): void {
  dialogMode.value = 'create'
  eventDraft.value = buildEventDraftFromSlot(
    anchor.value,
    defaultNewEventHour(dayStartHour, dayEndHour),
    CALENDAR_SLOT_DURATION_MINUTES
  )
  dialogVisible.value = true
}

function openCreateFromSlot(day: Date, hour: number): void {
  dialogMode.value = 'create'
  eventDraft.value = buildEventDraftFromSlot(
    day,
    hour,
    CALENDAR_SLOT_DURATION_MINUTES
  )
  dialogVisible.value = true
}

function openDayView(day: Date): void {
  view.value = 'day'
  anchor.value = day
}

function openEditDialog(event: NucCalendarEventObjectInterface): void {
  dialogMode.value = 'edit'
  eventDraft.value = { ...event }
  dialogVisible.value = true
}

function closeDialog(): void {
  dialogVisible.value = false
}

async function saveEvent(draft: CalendarEventDraft): Promise<void> {
  const ok =
    dialogMode.value === 'edit' && draft.id
      ? await updateEvent(draft.id, draft)
      : await createEvent(draft)
  if (!ok) return
  dialogVisible.value = false
  await refreshEvents()
}

async function removeEvent(id: number): Promise<void> {
  const ok = await cancelEvent(id)
  if (!ok) return
  dialogVisible.value = false
  await refreshEvents()
}

async function moveEvent(payload: {
  id: number
  starts_at: string
  ends_at: string
}): Promise<void> {
  const ok = await moveEventTimes(
    payload.id,
    payload.starts_at,
    payload.ends_at
  )
  if (!ok) return
  flashToast(t('toast-calendar-event-updated'), 'success', 2000)
  await refreshEvents()
}

onMounted(async () => {
  await Promise.all([getIntegrations(false), refreshEvents()])
})

watch([view, anchor], () => {
  void refreshEvents()
})
</script>

<style lang="scss">
@import 'index';
</style>
