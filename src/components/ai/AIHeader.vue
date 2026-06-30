<script setup lang="ts">
defineProps<{
  closable?: boolean
}>()

const emit = defineEmits<{
  settings: []
  close: []
}>()
</script>

<template>
  <header class="ai-header">
    <div class="ai-header__hero">
      <div class="ai-header__badge">AI</div>
      <div>
        <p class="eyebrow">DriveOne AI</p>
        <h3>AI 車輛顧問</h3>
        <p class="ai-header__copy">智慧保養、維修、保險與花費分析助手</p>
      </div>
    </div>

    <div class="ai-header__actions">
      <button type="button" class="ai-header__settings" @click="emit('settings')">
        <span class="ai-header__settings-text">
          <strong>AI 設定</strong>
        </span>
      </button>
      <el-button v-if="closable" circle plain class="secondary-cta" @click="emit('close')">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
  </header>
</template>

<style scoped>
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.ai-header__hero {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-header__badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #1d4ed8 58%, #60a5fa);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 14px 26px rgba(29, 78, 216, 0.2);
  flex-shrink: 0;
}

.ai-header h3 {
  margin: 2px 0 0;
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.ai-header__copy {
  margin: 4px 0 0;
  color: var(--ds-text-soft);
  font-size: 13px;
  line-height: 1.45;
}

.ai-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-header__settings {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ds-text);
  text-align: left;
  flex-shrink: 0;
}

.ai-header__settings-text {
  display: flex;
  align-items: center;
}

.ai-header__settings-text strong {
  font-size: 14px;
}

@media (max-width: 640px) {
  .ai-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .ai-header__actions {
    width: 100%;
    justify-content: space-between;
  }

  .ai-header h3 {
    font-size: 21px;
  }

  .ai-header__copy {
    font-size: 12px;
  }
}
</style>
