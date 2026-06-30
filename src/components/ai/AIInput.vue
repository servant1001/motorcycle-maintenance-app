<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  loading?: boolean
  placeholder?: string
  helperText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

const rows = computed(() => (props.modelValue.trim().length > 64 ? 4 : 3))

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('send')
  }
}
</script>

<template>
  <div class="ai-input">
    <div class="ai-input__shell">
      <el-input
        :model-value="modelValue"
        type="textarea"
        resize="none"
        :rows="rows"
        class="ai-input__field"
        :placeholder="placeholder ?? '詢問保養、維修、保險、花費或車況...'"
        @update:model-value="emit('update:modelValue', String($event))"
        @keydown="handleKeydown"
      />

      <div class="ai-input__footer">
        <span class="ai-input__helper">{{ helperText ?? 'Enter 送出，Shift + Enter 換行' }}</span>
        <el-button type="primary" class="primary-cta ai-input__send" :loading="loading" @click="emit('send')">
          送出
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-input {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.ai-input__shell {
  padding: 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-input__field :deep(.el-textarea__inner) {
  min-height: 104px !important;
  border: none;
  background: rgba(248, 250, 252, 0.94);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  padding: 16px 18px;
  line-height: 1.75;
}

.ai-input__field :deep(.el-textarea__inner:focus) {
  box-shadow:
    inset 0 0 0 1px rgba(64, 158, 255, 0.42),
    0 0 0 4px rgba(64, 158, 255, 0.08);
}

.ai-input__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ai-input__helper {
  color: var(--ds-text-soft);
  font-size: 13px;
  line-height: 1.5;
}

.ai-input__send {
  min-width: 112px;
}

@media (max-width: 640px) {
  .ai-input__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-input__send {
    width: 100%;
  }
}
</style>
