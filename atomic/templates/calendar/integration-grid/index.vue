<template>
  <section class="calendar-integration-grid">
    <header class="calendar-integration-grid-header">
      <h2 class="calendar-integration-grid-title">
        {{ t('calendar-integrations-title') }}
      </h2>
      <p class="calendar-integration-grid-subtitle">
        {{ t('calendar-integrations-subtitle') }}
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
import { useI18n } from 'vue-i18n'

import type { CalendarIntegrationStatusInterface } from 'nucleify'

defineProps<{
  integrations: CalendarIntegrationStatusInterface[]
}>()

const emit = defineEmits<{
  connect: [providerId: CalendarIntegrationStatusInterface['id']]
}>()

const { t } = useI18n()
</script>

<style lang="scss">
@import 'index';
</style>
