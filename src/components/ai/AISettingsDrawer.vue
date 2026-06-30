<script setup lang="ts">
defineProps<{
  modelValue: boolean
  provider: string
  model: string
  providerOptions: Array<{ label: string; value: string }>
  modelOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:provider': [provider: string]
  'update:model': [model: string]
}>()
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    direction="rtl"
    size="min(420px, 92vw)"
    :with-header="false"
    @close="emit('update:modelValue', false)"
  >
    <div class="ai-settings-drawer">
      <div class="ai-settings-drawer__header">
        <div>
          <p class="eyebrow">AI Settings</p>
          <h3>模型設定</h3>
        </div>
        <el-button circle plain class="secondary-cta" @click="emit('update:modelValue', false)">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="ai-settings-drawer__body">
        <div class="ai-settings-drawer__card">
          <span class="ai-settings-drawer__label">Provider</span>
          <el-select
            :model-value="provider"
            size="large"
            class="ai-settings-drawer__select"
            @update:model-value="emit('update:provider', String($event))"
          >
            <el-option v-for="option in providerOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </div>

        <div class="ai-settings-drawer__card">
          <span class="ai-settings-drawer__label">Model</span>
          <el-select
            :model-value="model"
            size="large"
            class="ai-settings-drawer__select"
            @update:model-value="emit('update:model', String($event))"
          >
            <el-option v-for="option in modelOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </div>

        <div class="ai-settings-drawer__note">
          <strong>目前設定</strong>
          <span>{{ provider }} · {{ model }}</span>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.ai-settings-drawer {
  padding: 8px 4px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-settings-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ai-settings-drawer__header h3 {
  margin: 6px 0 0;
  font-size: 28px;
}

.ai-settings-drawer__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-settings-drawer__card {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-settings-drawer__label {
  font-size: 12px;
  color: var(--ds-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ai-settings-drawer__select {
  width: 100%;
}

.ai-settings-drawer__note {
  padding: 16px;
  border-radius: 20px;
  background: rgba(17, 24, 39, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-settings-drawer__note span {
  color: var(--ds-text-soft);
}
</style>
