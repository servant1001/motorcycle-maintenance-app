<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="message">
    <div class="message__avatar">AI</div>
    <div class="message__bubble">
      <p v-for="paragraph in content.split('\n')" :key="paragraph">{{ paragraph }}</p>
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
  font-weight: 700;
  flex-shrink: 0;
}

.message__bubble {
  max-width: min(100%, 720px);
  padding: 16px 18px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid var(--ds-border);
  box-shadow: var(--ds-shadow-sm);
}

.message__bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.65;
}

.message__bubble p + p {
  margin-top: 10px;
}
</style>
