<template>
  <article class="calendar-integration-tile">
    <div class="calendar-integration-tile-header">
      <div class="calendar-integration-tile-icon">
        <ad-icon :icon="icon" size="1.5em" />
      </div>
      <p class="calendar-integration-tile-name">{{ integration.name }}</p>
    </div>
    <p class="calendar-integration-tile-description">
      {{ integration.description }}
    </p>
    <div class="calendar-integration-tile-footer">
      <span
        v-if="integration.connected"
        class="calendar-integration-tile-badge"
      >
        {{ t('calendar-connected') }}
      </span>
      <ad-button
        :label="
          integration.connected
            ? t('calendar-manage')
            : connectLabel
        "
        :nui-type="integration.connected ? 'secondary' : 'main'"
        :disabled="!integration.connectable"
        @click="emit('connect', integration.id)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CalendarIntegrationStatusInterface } from 'nucleify'
import { CALENDAR_INTEGRATION_ICONS } from 'nucleify'

const props = defineProps<{
  integration: CalendarIntegrationStatusInterface
}>()

const emit = defineEmits<{
  connect: [providerId: CalendarIntegrationStatusInterface['id']]
}>()

const { t } = useI18n()

const icon = computed(
  () => CALENDAR_INTEGRATION_ICONS[props.integration.id] ?? 'mdi:calendar'
)

const connectLabel = computed(() =>
  props.integration.connectable
    ? t('calendar-connect')
    : t('common-coming-soon')
)
</script>

<style lang="scss">
@import 'index';
</style>
