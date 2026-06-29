<template>
  <div class="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: inline-flex;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid var(--ds-border);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--ds-primary);
  animation: blink 1.1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
