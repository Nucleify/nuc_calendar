<template>
  <section
    class="calendar-board"
    :class="{ 'calendar-board-loading': loading }"
  >
    <div class="calendar-board-toolbar">
      <div class="calendar-board-toolbar-left">
        <ad-button
          icon="prime:chevron-left"
          nui-type="secondary"
          @click="emit('navigate', -1)"
        />
        <ad-button
          :label="t('calendar-today')"
          nui-type="secondary"
          @click="emit('today')"
        />
        <ad-button
          icon="prime:chevron-right"
          nui-type="secondary"
          @click="emit('navigate', 1)"
        />
        <p class="calendar-board-range-label">{{ rangeLabel }}</p>
      </div>
      <div class="calendar-board-toolbar-right">
        <div class="calendar-board-view-switch">
          <button
            v-for="item in views"
            :key="item"
            type="button"
            class="calendar-board-view-button"
            :class="{
              'calendar-board-view-button-active': item === view,
            }"
            @click="emit('view-change', item)"
          >
            {{ viewLabels[item] }}
          </button>
        </div>
        <ad-button
          icon="prime:cog"
          nui-type="secondary"
          :aria-label="t('calendar-integrations')"
          :class="{ 'calendar-board-integrations-active': integrationsOpen }"
          @click="emit('open-integrations')"
        />
        <ad-button
          :label="t('calendar-new-event')"
          icon="prime:plus"
          nui-type="main"
          @click="emit('new-event')"
        />
      </div>
    </div>
    <div class="calendar-board-content">
      <nuc-calendar-month-grid
        v-if="view === 'month'"
        :anchor="anchor"
        :events="events"
        :week-starts-on="weekStartsOn"
        @day-click="emit('day-click', $event)"
        @event-select="emit('event-select', $event)"
      />
      <nuc-calendar-week-grid
        v-else-if="view === 'week'"
        :anchor="anchor"
        :events="events"
        :day-start-hour="CALENDAR_DAY_VIEW_START_HOUR"
        :day-end-hour="CALENDAR_DAY_VIEW_END_HOUR"
        :week-starts-on="weekStartsOn"
        @slot-click="(day: Date, hour: number) => emit('slot-click', day, hour)"
        @event-select="emit('event-select', $event)"
        @event-move="emit('event-move', $event)"
        @event-resize="emit('event-resize', $event)"
      />
      <nuc-calendar-day-grid
        v-else
        :day="anchor"
        :events="events"
        :day-start-hour="CALENDAR_DAY_VIEW_START_HOUR"
        :day-end-hour="CALENDAR_DAY_VIEW_END_HOUR"
        @slot-click="(day: Date, hour: number) => emit('slot-click', day, hour)"
        @event-select="emit('event-select', $event)"
        @event-move="emit('event-move', $event)"
        @event-resize="emit('event-resize', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CalendarView, NucCalendarEventObjectInterface } from 'nucleify'
import {
  CALENDAR_DAY_VIEW_END_HOUR,
  CALENDAR_DAY_VIEW_START_HOUR,
  CALENDAR_VIEWS,
  formatRangeLabel,
} from 'nucleify'

const props = defineProps<{
  view: CalendarView
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  loading?: boolean
  dayStartHour: number
  dayEndHour: number
  weekStartsOn?: number
  integrationsOpen?: boolean
}>()

const emit = defineEmits<{
  'view-change': [view: CalendarView]
  navigate: [direction: -1 | 1]
  today: []
  'new-event': []
  'open-integrations': []
  'slot-click': [day: Date, hour: number]
  'day-click': [day: Date]
  'event-select': [event: NucCalendarEventObjectInterface]
  'event-move': [payload: { id: number; starts_at: string; ends_at: string }]
  'event-resize': [payload: { id: number; starts_at: string; ends_at: string }]
}>()

const { t } = useI18n()
const views = CALENDAR_VIEWS

const viewLabels = computed<Record<CalendarView, string>>(() => ({
  day: t('calendar-view-day'),
  week: t('calendar-view-week'),
  month: t('calendar-view-month'),
}))

const rangeLabel = computed(() =>
  formatRangeLabel(props.view, props.anchor, props.weekStartsOn ?? 1)
)
</script>

<style lang="scss">
@import 'index';
</style>
