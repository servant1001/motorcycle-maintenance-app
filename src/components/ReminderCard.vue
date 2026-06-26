<script setup lang="ts">
import { computed } from 'vue'
import type { ReminderSummary } from '@/types/reminder'

const props = defineProps<{
  reminder: ReminderSummary
}>()

const ringColor = computed(() => {
  if (props.reminder.status === 'overdue') return 'var(--ds-danger)'
  if (props.reminder.status === 'warning') return 'var(--ds-warning)'
  return 'var(--ds-success)'
})

const progress = computed(() => {
  if (props.reminder.remainingKm <= 0) return 100
  const ratio = props.reminder.nextMileage > 0 ? (props.reminder.remainingKm / props.reminder.nextMileage) * 100 : 0
  return Math.max(8, Math.min(100, Math.round(ratio)))
})

const statusLabel = computed(() => {
  if (props.reminder.status === 'overdue') return '已超過'
  if (props.reminder.status === 'warning') return '即將到期'
  return '正常'
})
</script>

<template>
  <article class="reminder-card soft-panel">
    <div class="reminder-card__header">
      <div>
        <h3>{{ reminder.item }}</h3>
        <p class="muted">下次保養里程 {{ reminder.nextMileage.toLocaleString('zh-TW') }} km</p>
      </div>
      <el-tag :type="reminder.status === 'overdue' ? 'danger' : reminder.status === 'warning' ? 'warning' : 'success'" round>
        {{ statusLabel }}
      </el-tag>
    </div>

    <div class="reminder-card__body">
      <div class="status-ring" :style="{ '--ring-color': ringColor, '--progress': progress }">
        <div class="status-ring__inner">
          <div>
            <div class="status-ring__value">{{ Math.floor(Math.abs(reminder.remainingKm)) }}</div>
            <div class="status-ring__label">km</div>
          </div>
        </div>
      </div>

      <div class="reminder-card__copy">
        <strong>{{ reminder.remainingKm >= 0 ? '剩餘' : '逾期' }} {{ Math.abs(reminder.remainingKm).toLocaleString('zh-TW') }} km</strong>
        <span class="muted">以目前主要車輛里程為基準自動計算</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.reminder-card {
  padding: 18px;
}

.reminder-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.reminder-card__header h3 {
  margin: 0;
}

.reminder-card__header p {
  margin: 6px 0 0;
}

.reminder-card__body {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 16px;
  align-items: center;
}

.reminder-card__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reminder-card__copy strong {
  font-size: 24px;
  line-height: 1.05;
}

@media (max-width: 640px) {
  .reminder-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
