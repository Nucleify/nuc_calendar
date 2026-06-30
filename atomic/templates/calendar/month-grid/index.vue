<template>
  <div class="calendar-month-grid">
    <div class="calendar-month-grid-weekdays">
      <div
        v-for="weekday in weekdayLabels"
        :key="weekday"
        class="calendar-month-grid-weekday"
      >
        {{ weekday }}
      </div>
    </div>
    <div class="calendar-month-grid-cells">
      <div
        v-for="day in days"
        :key="day.toISOString()"
        class="calendar-month-grid-cell"
        :class="{
          'calendar-month-grid-cell-outside': !isSameMonth(day, anchor),
          'calendar-month-grid-cell-today': isToday(day),
        }"
        @click="emit('day-click', day)"
      >
        <p class="calendar-month-grid-day-number">{{ formatDayNumber(day) }}</p>
        <nuc-calendar-event-block
          v-for="event in monthEvents(day).visible"
          :key="event.id"
          variant="month"
          :event="event"
          :show-time="false"
          @select="emit('event-select', $event)"
        />
        <p
          v-if="monthEvents(day).hiddenCount > 0"
          class="calendar-month-grid-more"
        >
          {{ t('calendar-more-events', {
              count: monthEvents(day).hiddenCount,
            }) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { NucCalendarEventObjectInterface } from 'nucleify'
import {
  eventsForDay,
  formatDayNumber,
  formatWeekdayLabel,
  isSameMonth,
  isToday,
  monthDayEventLimit,
  monthGridDays,
  weekDays,
} from 'nucleify'

const props = defineProps<{
  anchor: Date
  events: NucCalendarEventObjectInterface[]
  weekStartsOn?: number
}>()

const emit = defineEmits<{
  'day-click': [day: Date]
  'event-select': [event: NucCalendarEventObjectInterface]
}>()

const { t } = useI18n()

const days = computed(() =>
  monthGridDays(props.anchor, props.weekStartsOn ?? 1)
)

const weekdayLabels = computed(() => {
  const start =
    weekDays(props.anchor, props.weekStartsOn ?? 1)[0] ?? props.anchor
  return weekDays(start, props.weekStartsOn ?? 1).map((day) =>
    formatWeekdayLabel(day, 'en', 'short')
  )
})

function monthEvents(day: Date) {
  return monthDayEventLimit(eventsForDay(props.events, day))
}
</script>

<style lang="scss">
@import 'index';
</style>
