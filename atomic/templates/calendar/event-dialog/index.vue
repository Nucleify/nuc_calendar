<template>
  <ad-dialog
    :visible="visible"
    modal
    class="calendar-event-dialog"
    @update:visible="onVisibleUpdate"
  >
    <template #header>
      <span
        >{{ mode === 'edit' ? t('calendar-edit-event') : t('calendar-new-event') }}</span
      >
    </template>

    <form class="form-container" action="#" @submit.prevent="submit">
      <div v-for="field in fields" :key="field.name" class="form-div">
        <label :for="field.name">{{ field.label }}</label>
        <component
          :is="getComponent(field.type as ComponentType)"
          :id="field.name"
          :model-value="readCalendarEventFieldValue(draft, field.name) as never"
          nui-type="main"
          v-bind="field.props"
          :panel-class="isSelectOrDatePicker(field.type) ? 'main' : undefined"
          @update:model-value="(value: unknown) => setField(field.name, value)"
        />
      </div>
    </form>

    <template #footer>
      <div class="dialog-buttons-container">
        <ad-button
          v-if="mode === 'edit' && draft.id"
          :label="t('calendar-cancel-event')"
          severity="secondary"
          @click="emit('cancel-event', draft.id)"
        />
        <ad-button
          :label="t('common-close')"
          severity="secondary"
          @click="emit('close')"
        />
        <ad-button :label="t('common-save')" nui-type="main" @click="submit" />
      </div>
    </template>
  </ad-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CalendarEventDraft, ComponentType } from 'nucleify'
import {
  getComponent,
  isSelectOrDatePicker,
  readCalendarEventFieldValue,
  useCalendarEventFields,
  writeCalendarEventFieldValue,
} from 'nucleify'

const props = defineProps<{
  visible: boolean
  draft: CalendarEventDraft
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  close: []
  save: [draft: CalendarEventDraft]
  'cancel-event': [id: number]
}>()

const { t } = useI18n()
const fields = computed(() => useCalendarEventFields(t).fields)
const draft = ref<CalendarEventDraft>({ ...props.draft })

watch(
  () => props.draft,
  (value) => {
    draft.value = { ...value }
  },
  { deep: true }
)

function setField(name: string, value: unknown): void {
  draft.value = writeCalendarEventFieldValue(draft.value, name, value)
}

function onVisibleUpdate(value: boolean): void {
  if (!value) emit('close')
}

function submit(): void {
  emit('save', { ...draft.value })
}
</script>

<style lang="scss">
@import 'index';
</style>
