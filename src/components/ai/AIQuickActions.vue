<script setup lang="ts">
defineProps<{
  actions: string[]
}>()

const emit = defineEmits<{
  select: [action: string]
}>()
</script>

<template>
  <section class="ai-quick-actions">
    <p class="eyebrow">快捷提問</p>
    <div class="ai-quick-actions__rail">
      <button
        v-for="action in actions"
        :key="action"
        type="button"
        class="ai-quick-actions__item"
        @click="emit('select', action)"
      >
        {{ action }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.ai-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.ai-quick-actions__rail {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 8px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.ai-quick-actions__item {
  flex: 0 0 auto;
  border: 1px solid rgba(64, 158, 255, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(64, 158, 255, 0.08));
  color: var(--ds-primary-deep);
  border-radius: 999px;
  padding: 10px 14px;
  min-height: 0;
  font: inherit;
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.ai-quick-actions__item:hover {
  transform: translateY(-1px);
  border-color: rgba(64, 158, 255, 0.3);
  box-shadow: 0 16px 28px rgba(64, 158, 255, 0.08);
}
</style>
