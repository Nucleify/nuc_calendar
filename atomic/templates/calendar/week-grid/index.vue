<template>
  <div class="calendar-week-grid">
    <div class="calendar-week-grid-header">
      <div class="calendar-week-grid-header-spacer" />
      <div
        v-for="day in days"
        :key="day.toISOString()"
        class="calendar-week-grid-day-header"
      >
        <p class="calendar-week-grid-weekday">{{ formatWeekdayLabel(day) }}</p>
        <p
          class="calendar-week-grid-day-number"
          :class="{
            'calendar-week-grid-day-number-today': isToday(day),
          }"
        >
          {{ formatDayNumber(day) }}
        </p>
      </div>
    </div>
    <div ref="bodyRef" class="calendar-week-grid-body">
      <nuc-calendar-day-grid
        :day="days[0] ?? anchor"
        :events="[]"
        :day-start-hour="dayStartHour"
        :day-end-hour="dayEndHour"
        :show-hours="true"
        :scrollable="false"
        class="calendar-week-grid-hours-column"
        @slot-click="() => undefined"
      />
      <div
        v-for="day in days"
        :key="`col-${day.toISOString()}`"
        class="calendar-week-grid-day-column"
      >
        <nuc-calendar-day-grid
          :day="day"
          :events="events"
          :day-start-hour="dayStartHour"
          :day-end-hour="dayEndHour"
          :show-hours="false"
          :scrollable="false"
          @slot-click="(slotDay: Date, hour: number) => emit('slot-click', slotDay, hour)"
          @event-select="emit('event-select', $event)"
          @event-move="emit('event-move', $event)"
          @event-resize="emit('event-resize', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import type { NucCalendarEventObjectInterface } from 'nucleify'
import {
  calendarScrollTopForNow,
  CALENDAR_HOUR_HEIGHT,
  formatDayNumber,
  formatWeekdayLabel,
  isToday,
  weekDays,
} from 'nucleify'

const props = defineProps<{
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  dayStartHour: number
  dayEndHour: number
  weekStartsOn?: number
}>()

const emit = defineEmits<{
  'slot-click': [day: Date, hour: number]
  'event-select': [event: NucCalendarEventObjectInterface]
  'event-move': [payload: { id: number; starts_at: string; ends_at: string }]
  'event-resize': [payload: { id: number; starts_at: string; ends_at: string }]
}>()

const bodyRef = ref<HTMLElement | null>(null)

const days = computed(() => weekDays(props.anchor, props.weekStartsOn ?? 1))

const showsToday = computed(() => days.value.some((day) => isToday(day)))

function scrollToNow(): void {
  if (!showsToday.value) return
  const scrollEl = bodyRef.value
  if (!scrollEl) return
  scrollEl.scrollTop = calendarScrollTopForNow(
    scrollEl,
    props.dayStartHour,
    props.dayEndHour,
    CALENDAR_HOUR_HEIGHT
  )
}

onMounted(() => {
  void nextTick(scrollToNow)
})

watch(
  () => props.anchor.toDateString(),
  () => {
    void nextTick(scrollToNow)
  }
)
</script>

<style lang="scss">
@import 'index';
</style>
