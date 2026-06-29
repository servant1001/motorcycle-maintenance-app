<script setup lang="ts">
defineProps<{
  questions: string[]
}>()

const emit = defineEmits<{
  select: [question: string]
}>()
</script>

<template>
  <div class="quick-questions">
    <button
      v-for="question in questions"
      :key="question"
      type="button"
      class="quick-questions__item"
      @click="emit('select', question)"
    >
      {{ question }}
    </button>
  </div>
</template>

<style scoped>
.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-questions__item {
  border: 1px solid rgba(64, 158, 255, 0.18);
  background: rgba(64, 158, 255, 0.08);
  color: var(--ds-primary-deep);
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease;
}

.quick-questions__item:hover {
  transform: translateY(-1px);
  background: rgba(64, 158, 255, 0.14);
}
</style>
