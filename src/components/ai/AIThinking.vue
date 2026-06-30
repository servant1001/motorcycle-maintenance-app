<template>
  <div class="ai-thinking">
    <div class="ai-thinking__badge">AI</div>
    <div class="ai-thinking__bubble">
      <strong>正在分析目前車輛狀態…</strong>
      <div class="ai-thinking__dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-thinking {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.ai-thinking__badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #409eff, #1f3b73);
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
}

.ai-thinking__bubble {
  padding: 16px 18px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid var(--ds-border);
  box-shadow: var(--ds-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-thinking__bubble strong {
  font-size: 14px;
}

.ai-thinking__dots {
  display: inline-flex;
  gap: 6px;
}

.ai-thinking__dots span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--ds-primary);
  animation: blink 1.1s infinite ease-in-out;
}

.ai-thinking__dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-thinking__dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
