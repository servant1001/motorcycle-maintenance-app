<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="message">
    <div class="message__body">
      <div class="message__meta">你</div>
      <div class="message__bubble">
        <p>{{ content }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  justify-content: flex-end;
}

.message__body {
  max-width: min(100%, 720px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.message__meta {
  font-size: 12px;
  color: var(--ds-text-faint);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.message__bubble {
  padding: 18px 20px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(29, 78, 216, 0.12)),
    rgba(255, 255, 255, 0.95);
  color: var(--ds-text);
  border: 1px solid rgba(64, 158, 255, 0.18);
  box-shadow: 0 18px 34px rgba(64, 158, 255, 0.08);
}

.message__bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.72;
}
</style>
