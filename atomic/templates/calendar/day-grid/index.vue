<template>
  <div
    class="calendar-day-grid"
    :class="{ 'calendar-day-grid-embedded': !scrollable }"
  >
    <div ref="scrollRef" class="calendar-day-grid-scroll">
      <div
        class="calendar-day-grid-track"
        :style="{ height: `${gridHeight}px` }"
      >
        <div
          v-if="showHours"
          class="calendar-day-grid-hours"
          :style="{ height: `${gridHeight}px` }"
        >
          <span
            v-for="hour in hours"
            :key="hour"
            class="calendar-day-grid-hour-label"
            :style="
              hourLabelStyle(hour, props.dayStartHour, props.dayEndHour)
            "
          >
            {{ formatHourLabel(hour) }}
          </span>
        </div>
        <div
          class="calendar-day-grid-body"
          :style="{ height: `${gridHeight}px` }"
        >
          <div
            v-for="hour in hours"
            :key="`line-${hour}`"
            class="calendar-day-grid-hour-line"
            :style="{
              top: `${hourOffsetPercent(hour, props.dayStartHour, props.dayEndHour)}%`,
            }"
          />
          <button
            v-for="(hour, index) in slotHours"
            :key="`slot-${hour}`"
            type="button"
            class="calendar-day-grid-slot"
            :style="
              hourSlotStyle(
                hour,
                index,
                hours,
                dayStartHour,
                dayEndHour
              )
            "
            @click="emit('slot-click', day, hour)"
          />
          <div
            v-if="nowLineTop !== null"
            class="calendar-day-grid-now-line"
            :style="{ top: `${nowLineTop}%` }"
          />
          <nuc-calendar-event-block
            v-for="block in layoutBlocks"
            :key="block.eventId"
            :event="block.event as NucCalendarEventObjectInterface"
            :layout="block"
            @select="emit('event-select', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import type { NucCalendarEventObjectInterface } from 'nucleify'
import {
  bookableHours,
  calendarGridHeightPx,
  calendarScrollTopForNow,
  CALENDAR_HOUR_HEIGHT,
  eventsForDay,
  formatHourLabel,
  hourLabelStyle,
  hourOffsetPercent,
  hourSlotStyle,
  hoursInRange,
  isToday,
  layoutDayEvents,
} from 'nucleify'

const props = withDefaults(
  defineProps<{
    day: Date
    events: NucCalendarEventObjectInterface[]
    dayStartHour: number
    dayEndHour: number
    hourHeight?: number
    showHours?: boolean
    scrollable?: boolean
  }>(),
  {
    showHours: true,
    scrollable: true,
  }
)

const emit = defineEmits<{
  'slot-click': [day: Date, hour: number]
  'event-select': [event: NucCalendarEventObjectInterface]
}>()

const scrollRef = ref<HTMLElement | null>(null)

const hours = computed(() => hoursInRange(props.dayStartHour, props.dayEndHour))

const slotHours = computed(() =>
  bookableHours(props.dayStartHour, props.dayEndHour)
)

const resolvedHourHeight = computed(
  () => props.hourHeight ?? CALENDAR_HOUR_HEIGHT
)

const gridHeight = computed(() =>
  calendarGridHeightPx(
    props.dayStartHour,
    props.dayEndHour,
    resolvedHourHeight.value
  )
)

const dayEvents = computed(() => eventsForDay(props.events, props.day))

const layoutBlocks = computed(() =>
  layoutDayEvents(
    dayEvents.value,
    props.day,
    props.dayStartHour,
    props.dayEndHour
  )
)

const nowLineTop = computed(() => {
  if (!isToday(props.day)) return null
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60
  if (hour < props.dayStartHour || hour > props.dayEndHour) return null
  return hourOffsetPercent(hour, props.dayStartHour, props.dayEndHour)
})

function scrollToNow(): void {
  if (!props.scrollable || nowLineTop.value === null) return
  const scrollEl = scrollRef.value
  if (!scrollEl) return
  scrollEl.scrollTop = calendarScrollTopForNow(
    scrollEl,
    props.dayStartHour,
    props.dayEndHour,
    resolvedHourHeight.value
  )
}

onMounted(() => {
  void nextTick(scrollToNow)
})

watch(
  () => props.day.toDateString(),
  () => {
    void nextTick(scrollToNow)
  }
)
</script>

<style lang="scss">
@import 'index';
</style>
