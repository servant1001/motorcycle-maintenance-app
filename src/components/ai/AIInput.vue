<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  loading?: boolean
  placeholder?: string
  helperText?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

const rows = computed(() => {
  if (props.compact) return 1
  return props.modelValue.trim().length > 64 ? 4 : 3
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('send')
  }
}
</script>

<template>
  <div class="ai-input">
    <div class="ai-input__shell" :class="{ 'ai-input__shell--compact': compact }">
      <el-input
        :model-value="modelValue"
        :type="compact ? 'text' : 'textarea'"
        resize="none"
        :rows="rows"
        class="ai-input__field"
        :class="{ 'ai-input__field--compact': compact }"
        :placeholder="placeholder ?? '詢問保養、維修、保險、花費或車況...'"
        @update:model-value="emit('update:modelValue', String($event))"
        @keydown="handleKeydown"
      />

      <div class="ai-input__footer" :class="{ 'ai-input__footer--compact': compact }">
        <span v-if="!compact" class="ai-input__helper">{{ helperText ?? 'Enter 送出，Shift + Enter 換行' }}</span>
        <el-button
          type="primary"
          class="primary-cta ai-input__send"
          :class="{ 'ai-input__send--compact': compact }"
          :loading="loading"
          @click="emit('send')"
        >
          <el-icon v-if="compact"><Position /></el-icon>
          <template v-else>送出</template>
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

.ai-input__shell--compact {
  padding: 10px;
  border-radius: 20px;
  gap: 10px;
  flex-direction: row;
  align-items: center;
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

.ai-input__field--compact :deep(.el-input__wrapper) {
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.96);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
  padding: 0 14px;
  min-height: 44px;
}

.ai-input__field--compact :deep(.el-input__inner) {
  line-height: 1.2;
}

.ai-input__field--compact {
  flex: 1;
  min-width: 0;
}

.ai-input__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ai-input__footer--compact {
  justify-content: flex-end;
  flex-shrink: 0;
}

.ai-input__helper {
  color: var(--ds-text-soft);
  font-size: 13px;
  line-height: 1.5;
}

.ai-input__send {
  min-width: 112px;
}

.ai-input__send--compact {
  min-width: 44px;
  width: 44px;
  height: 44px;
  padding: 0;
}

@media (max-width: 640px) {
  .ai-input__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-input__footer--compact {
    flex-direction: row;
    align-items: center;
    width: auto;
  }

  .ai-input__send {
    width: 100%;
  }

  .ai-input__send--compact {
    width: 44px;
  }
}
</style>
