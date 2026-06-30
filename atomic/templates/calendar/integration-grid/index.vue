<template>
  <section class="calendar-integration-grid">
    <header class="calendar-integration-grid-header">
      <h2 class="calendar-integration-grid-title">Connect your calendars</h2>
      <p class="calendar-integration-grid-subtitle">
        Import meetings from Calendly, Google Calendar, Outlook, and more in one
        place.
      </p>
    </header>
    <div class="calendar-integration-grid-items">
      <nuc-calendar-integration-tile
        v-for="integration in integrations"
        :key="integration.id"
        :integration="integration"
        @connect="emit('connect', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CalendarIntegrationStatusInterface } from 'nucleify'

defineProps<{
  integrations: CalendarIntegrationStatusInterface[]
}>()

const emit = defineEmits<{
  connect: [providerId: CalendarIntegrationStatusInterface['id']]
}>()
</script>

<style lang="scss">
@import 'index';
</style>
