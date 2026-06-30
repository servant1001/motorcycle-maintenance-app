<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="message">
    <div class="message__avatar">AI</div>
    <div class="message__body">
      <div class="message__meta">DriveOne 顧問</div>
      <div class="message__bubble">
        <p v-for="paragraph in content.split('\n')" :key="paragraph">{{ paragraph }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message__avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #409eff, #1f3b73);
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 14px 24px rgba(64, 158, 255, 0.18);
}

.message__body {
  max-width: min(100%, 760px);
  display: flex;
  flex-direction: column;
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
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.06);
}

.message__bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.72;
  color: var(--ds-text);
}

.message__bubble p + p {
  margin-top: 10px;
}
</style>
