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
          :data-day="formatLocalDateKey(day)"
          :style="{ height: `${gridHeight}px` }"
          @pointerdown="onBodyPointerDown"
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
            :class="{
              'calendar-event-block-source-resizing':
                localDragState?.id === block.eventId &&
                localDragState?.mode === 'resize',
            }"
            @select="emit('event-select', $event)"
          />
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div
        v-if="localDragState && floatingGhost"
        class="calendar-event-block calendar-event-block-ghost calendar-event-block-floating"
        :style="{
          left: `${floatingGhost.x}px`,
          top: `${floatingGhost.y}px`,
          width: `${floatingGhost.width}px`,
          height: `${floatingGhost.height}px`,
          ...(floatingGhost.color ? { borderLeftColor: floatingGhost.color } : {}),
        }"
      >
        <div class="calendar-event-block-header">
          <p class="calendar-event-block-title">{{ floatingGhost.title }}</p>
          <p class="calendar-event-block-time">{{ floatingGhost.time }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import type { NucCalendarEventObjectInterface } from 'nucleify'
import {
  bookableHours,
  buildDragSessionUpdate,
  calendarGridHeightPx,
  calendarScrollTopForNow,
  CALENDAR_HOUR_HEIGHT,
  clampCalendarMinutes,
  clearDragSession,
  dayGridBodyFromPointer,
  eventMinutesInDayGrid,
  eventsForDay,
  eventTimesUnchanged,
  formatEventTimeRange,
  formatHourLabel,
  formatLocalDateKey,
  getDragSession,
  hourLabelStyle,
  hourOffsetPercent,
  hourSlotStyle,
  hoursInRange,
  isToday,
  layoutDayEvents,
  minutesFromPointerInBody,
  parseLocalDateKey,
  resolveDragTimes,
  setDragSession,
  type CalendarDragGhostBase,
  type CalendarDragPointerState,
  type CalendarFloatingGhost,
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
  'event-move': [payload: { id: number; starts_at: string; ends_at: string }]
  'event-resize': [payload: { id: number; starts_at: string; ends_at: string }]
}>()

const scrollRef = ref<HTMLElement | null>(null)

type LocalDragState = CalendarDragPointerState

const localDragState = ref<LocalDragState | null>(null)
const floatingGhost = ref<CalendarFloatingGhost | null>(null)

function publishDragPreview(state: LocalDragState, event: PointerEvent): void {
  const body = dayGridBodyFromPointer(event)
  const session = buildDragSessionUpdate(
    state,
    event,
    body,
    props.day,
    props.dayStartHour,
    props.dayEndHour,
    resolvedHourHeight.value,
    getDragSession(),
    formatEventTimeRange
  )

  floatingGhost.value = session.floatingGhost
  setDragSession(session)
}

function clearDragPreview(): void {
  clearDragSession()
  floatingGhost.value = null
}

function onBodyPointerDown(e: PointerEvent): void {
  const target = e.target as HTMLElement | null
  if (!target) return

  const resize = target.closest('.calendar-event-block-resize-handle')
  const block = target.closest('.calendar-event-block') as HTMLElement | null
  if (!block || block.classList.contains('calendar-event-block-ghost')) return

  const rawId = block.getAttribute('data-event-id') || ''
  const id = Number(rawId)
  if (!id || Number.isNaN(id)) return

  const event = dayEvents.value.find((item) => Number(item.id) === id)
  if (!event) return

  // Prevent click / selection when starting drag.
  e.preventDefault()

  const startsAt = String(event.starts_at || '')
  const endsAt = String(event.ends_at || '')
  const durationMs = new Date(endsAt).getTime() - new Date(startsAt).getTime()
  if (!durationMs || Number.isNaN(durationMs)) return

  const body = target.closest('.calendar-day-grid-body') as HTMLElement | null
  if (!body) return
  const pointerMinutes = clampCalendarMinutes(
    minutesFromPointerInBody(e, body, resolvedHourHeight.value),
    props.dayStartHour,
    props.dayEndHour
  )
  const eventMinutes = eventMinutesInDayGrid(
    startsAt,
    props.day,
    props.dayStartHour
  )
  const grabOffsetMinutes = clampCalendarMinutes(
    pointerMinutes - eventMinutes,
    props.dayStartHour,
    props.dayEndHour
  )

  const blockRect = block.getBoundingClientRect()
  const grabOffsetX = e.clientX - blockRect.left
  const grabOffsetY = e.clientY - blockRect.top

  const blockLayout = layoutBlocks.value.find((item) => item.eventId === id)
  const ghostBase: CalendarDragGhostBase = {
    title: event.title,
    color: event.color,
    left: blockLayout?.left ?? 0,
    width: blockLayout?.width ?? 100,
  }

  const state: LocalDragState = {
    mode: resize ? 'resize' : 'move',
    id,
    initialStartsAt: startsAt,
    initialEndsAt: endsAt,
    durationMs,
    grabOffsetMinutes,
    grabOffsetX,
    grabOffsetY,
    blockWidthPx: blockRect.width,
    blockHeightPx: blockRect.height,
    blockOriginX: blockRect.left,
    blockOriginY: blockRect.top,
    originDayKey: formatLocalDateKey(props.day),
    ghostBase,
  }

  localDragState.value = state
  publishDragPreview(state, e)

  window.addEventListener('pointermove', onWindowPointerMove, {
    passive: false,
  })
  window.addEventListener('pointerup', onWindowPointerUp, { passive: false })
  window.addEventListener('pointercancel', onPointerCancel, { passive: false })
}

function onWindowPointerMove(e: PointerEvent): void {
  const state = localDragState.value
  if (!state) return
  e.preventDefault()
  publishDragPreview(state, e)
}

function onWindowPointerUp(e: PointerEvent): void {
  const state = localDragState.value
  if (!state) return
  e.preventDefault()

  const sessionSnapshot = getDragSession()
  const body = dayGridBodyFromPointer(e)
  const resolved =
    resolveDragTimes(
      state,
      e,
      body,
      props.day,
      props.dayStartHour,
      props.dayEndHour,
      resolvedHourHeight.value
    ) ??
    (sessionSnapshot
      ? {
          startsAt: sessionSnapshot.targetStartsAt,
          endsAt: sessionSnapshot.targetEndsAt,
          targetDay: parseLocalDateKey(sessionSnapshot.targetDayKey),
        }
      : null)

  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  localDragState.value = null
  clearDragPreview()

  if (!resolved) return
  if (
    eventTimesUnchanged(
      state.initialStartsAt,
      state.initialEndsAt,
      resolved.startsAt,
      resolved.endsAt
    )
  ) {
    return
  }

  const payload = {
    id: state.id,
    starts_at: resolved.startsAt,
    ends_at: resolved.endsAt,
  }
  if (
    state.mode === 'move' ||
    state.originDayKey !== formatLocalDateKey(resolved.targetDay)
  ) {
    emit('event-move', payload)
    return
  }
  emit('event-resize', payload)
}

function onPointerCancel(): void {
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  localDragState.value = null
  clearDragPreview()
}

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
@import '../event-block/index';
@import 'index';
</style>
