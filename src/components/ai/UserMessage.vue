<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="message">
    <div class="message__bubble">
      <p>{{ content }}</p>
    </div>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  justify-content: flex-end;
}

.message__bubble {
  max-width: min(100%, 680px);
  padding: 16px 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.16), rgba(64, 158, 255, 0.1));
  color: var(--ds-text);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.message__bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.65;
}
</style>
