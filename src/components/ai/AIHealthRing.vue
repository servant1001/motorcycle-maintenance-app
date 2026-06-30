<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
  label?: string
}>()

const clampedScore = computed(() => Math.max(0, Math.min(100, Math.round(props.score))))
const healthMeta = computed(() => {
  if (clampedScore.value >= 90) {
    return {
      label: '優良',
      color: '#67C23A',
    }
  }

  if (clampedScore.value >= 80) {
    return {
      label: '需注意',
      color: '#E6A23C',
    }
  }

  if (clampedScore.value >= 70) {
    return {
      label: '警告',
      color: '#f59e0b',
    }
  }

  return {
    label: '危險',
    color: '#F56C6C',
  }
})
const ringStyle = computed(() => ({
  background: `conic-gradient(${healthMeta.value.color} 0deg ${clampedScore.value * 3.6}deg, rgba(148, 163, 184, 0.18) ${clampedScore.value * 3.6}deg 360deg)`,
}))
</script>

<template>
  <div class="health-ring">
    <div class="health-ring__outer" :style="ringStyle">
      <div class="health-ring__inner">
        <strong>{{ clampedScore }}</strong>
        <span :style="{ color: healthMeta.color }">{{ props.label ?? healthMeta.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-ring {
  display: flex;
  justify-content: center;
}

.health-ring__outer {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  padding: 6px;
  box-shadow: 0 14px 28px rgba(64, 158, 255, 0.14);
}

.health-ring__inner {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.health-ring__inner strong {
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.health-ring__inner span {
  font-size: 10px;
  color: var(--ds-text-faint);
  letter-spacing: 0.04em;
}
</style>
