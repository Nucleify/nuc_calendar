<template>
  <section
    class="calendar-board"
    :class="{ 'calendar-board-loading': loading }"
  >
    <div class="calendar-board-toolbar">
      <div class="calendar-board-toolbar-left">
        <ad-button
          icon="prime:chevron-left"
          ad-type="secondary"
          @click="emit('navigate', -1)"
        />
        <ad-button label="Today" ad-type="secondary" @click="emit('today')" />
        <ad-button
          icon="prime:chevron-right"
          ad-type="secondary"
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
          ad-type="secondary"
          aria-label="Integrations"
          :class="{ 'calendar-board-integrations-active': integrationsOpen }"
          @click="emit('open-integrations')"
        />
        <ad-button
          label="New event"
          icon="prime:plus"
          ad-type="main"
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
        :day-start-hour="dayStartHour"
        :day-end-hour="dayEndHour"
        :week-starts-on="weekStartsOn"
        @slot-click="(day, hour) => emit('slot-click', day, hour)"
        @event-select="emit('event-select', $event)"
      />
      <nuc-calendar-day-grid
        v-else
        :day="anchor"
        :events="events"
        :day-start-hour="dayStartHour"
        :day-end-hour="dayEndHour"
        @slot-click="(day, hour) => emit('slot-click', day, hour)"
        @event-select="emit('event-select', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { CalendarView, NucCalendarEventObjectInterface } from 'nucleify'
import { CALENDAR_VIEWS, formatRangeLabel } from 'nucleify'

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
}>()

const views = CALENDAR_VIEWS

const viewLabels: Record<CalendarView, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
}

const rangeLabel = computed(() =>
  formatRangeLabel(props.view, props.anchor, props.weekStartsOn ?? 1)
)
</script>

<style lang="scss">
@import 'index';
</style>
