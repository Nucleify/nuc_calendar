<template>
  <button
    v-if="variant === 'month'"
    type="button"
    class="calendar-month-event-chip"
    :style="chipStyle"
    @click="emit('select', event)"
  >
    {{ event.title }}
  </button>
  <button
    v-else
    type="button"
    class="calendar-event-block"
    :style="blockStyle"
    @click="emit('select', event)"
  >
    <p class="calendar-event-block-title">{{ event.title }}</p>
    <p v-if="showTime" class="calendar-event-block-time">{{ timeLabel }}</p>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  CalendarLayoutBlock,
  NucCalendarEventObjectInterface,
} from 'nucleify'
import { formatEventTimeRange } from 'nucleify'

const props = withDefaults(
  defineProps<{
    event: NucCalendarEventObjectInterface
    layout?: CalendarLayoutBlock
    variant?: 'time' | 'month'
    showTime?: boolean
  }>(),
  {
    variant: 'time',
    showTime: true,
  }
)

const emit = defineEmits<{
  select: [event: NucCalendarEventObjectInterface]
}>()

const blockStyle = computed(() => {
  if (!props.layout) return {}
  const color = props.event.color || undefined
  return {
    top: `${props.layout.top}%`,
    left: `${props.layout.left}%`,
    width: `${props.layout.width}%`,
    height: `${props.layout.height}%`,
    ...(color ? { borderLeftColor: color } : {}),
  }
})

const chipStyle = computed(() => {
  const color = props.event.color || undefined
  return color ? { borderLeftColor: color } : {}
})

const timeLabel = computed(() =>
  formatEventTimeRange(props.event.starts_at, props.event.ends_at)
)
</script>

<style lang="scss">
@import 'index';
</style>
