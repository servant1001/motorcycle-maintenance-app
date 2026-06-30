<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AIMessage from './AIMessage.vue'
import QuickQuestions from './QuickQuestions.vue'
import TypingIndicator from './TypingIndicator.vue'
import UserMessage from './UserMessage.vue'
import type { AIMessageItem } from '@/types/ai'

const props = defineProps<{
  messages: AIMessageItem[]
  loading: boolean
  quickQuestions: string[]
  provider: string
  model: string
  providerOptions: Array<{ label: string; value: string }>
  modelOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  send: [message: string]
  'update:provider': [provider: string]
  'update:model': [model: string]
}>()

const draft = ref('')
const scrollerRef = ref<HTMLElement | null>(null)

const hasMessages = computed(() => props.messages.length > 0)

function submit() {
  const message = draft.value.trim()
  if (!message) return
  emit('send', message)
  draft.value = ''
}

function sendQuickQuestion(question: string) {
  emit('send', question)
}

function updateProvider(value: string) {
  emit('update:provider', value)
}

function updateModel(value: string) {
  emit('update:model', value)
}

watch(
  () => [props.messages.length, props.loading],
  async () => {
    await nextTick()
    scrollerRef.value?.scrollTo({
      top: scrollerRef.value.scrollHeight,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <section class="chat-window">
    <div class="chat-window__header">
      <div class="chat-window__hero">
        <div class="chat-window__hero-badge">AI</div>
        <div>
          <p class="eyebrow">DriveOne AI</p>
          <h3>智慧車輛顧問</h3>
          <p class="chat-window__hero-copy">依據目前車輛資料，提供保養、保險、維修與能源分析建議。</p>
        </div>
      </div>

      <div class="chat-window__toolbar">
        <div class="chat-window__selectors">
          <div class="chat-window__select-card">
            <span class="chat-window__select-label">Provider</span>
            <el-select
              :model-value="provider"
              size="large"
              class="chat-window__select"
              @update:model-value="updateProvider"
            >
              <el-option
                v-for="option in providerOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>

          <div class="chat-window__select-card">
            <span class="chat-window__select-label">Model</span>
            <el-select
              :model-value="model"
              size="large"
              class="chat-window__select"
              @update:model-value="updateModel"
            >
              <el-option
                v-for="option in modelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>

        <div class="chat-window__status">
          <span class="chat-window__status-dot" />
          <span>{{ provider }} · {{ model }}</span>
        </div>
      </div>
    </div>

    <QuickQuestions v-if="!hasMessages" :questions="quickQuestions" @select="sendQuickQuestion" />

    <div ref="scrollerRef" class="chat-window__messages">
      <template v-if="hasMessages">
        <component
          :is="message.role === 'assistant' ? AIMessage : UserMessage"
          v-for="message in messages"
          :key="message.id"
          :content="message.content"
        />
      </template>

      <div v-else class="chat-window__empty">
        <strong>直接輸入問題，AI 會根據目前車輛資料回覆。</strong>
        <span>你可以詢問本月花費、最近需要保養什麼、保險何時到期，或哪一項支出最需要優先處理。</span>
      </div>

      <TypingIndicator v-if="loading" />
    </div>

    <form class="chat-window__composer" @submit.prevent="submit">
      <div class="chat-window__composer-shell">
        <el-input
          v-model="draft"
          type="textarea"
          :rows="3"
          resize="none"
          class="chat-window__input"
          placeholder="例如：這個月的加油總開銷是多少？最近最該優先保養哪一項？"
        />

        <div class="chat-window__actions">
          <span class="muted">AI 會以目前選定模型回覆</span>
          <el-button type="primary" class="primary-cta chat-window__send" native-type="submit" :loading="loading">
            送出
          </el-button>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.chat-window {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 72vh;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.chat-window__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-window__hero {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.chat-window__hero-badge {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #1d4ed8 58%, #60a5fa);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 14px 26px rgba(29, 78, 216, 0.2);
  flex-shrink: 0;
}

.chat-window__hero h3 {
  margin: 4px 0 0;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.chat-window__hero-copy {
  margin: 8px 0 0;
  color: var(--ds-text-soft);
  font-size: 14px;
  line-height: 1.6;
}

.chat-window__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-window__selectors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chat-window__select-card {
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-window__select-label {
  font-size: 12px;
  color: var(--ds-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.chat-window__select {
  width: 100%;
}

.chat-window__status {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  color: var(--ds-text-soft);
  font-size: 13px;
}

.chat-window__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #67c23a, #22c55e);
  box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.12);
}

.chat-window__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 360px;
  max-height: 72vh;
  overflow: auto;
  padding: 8px 6px 8px 2px;
  scrollbar-width: thin;
}

.chat-window__empty {
  padding: 24px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(255, 255, 255, 0.82)),
    rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(64, 158, 255, 0.14);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.05);
}

.chat-window__empty strong {
  font-size: 16px;
  line-height: 1.5;
}

.chat-window__empty span {
  color: var(--ds-text-soft);
  line-height: 1.7;
}

.chat-window__composer {
  display: flex;
  flex-direction: column;
}

.chat-window__composer-shell {
  padding: 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-window__input :deep(.el-textarea__inner) {
  min-height: 96px !important;
  border: none;
  background: rgba(248, 250, 252, 0.92);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  padding: 16px 18px;
  line-height: 1.7;
}

.chat-window__input :deep(.el-textarea__inner:focus) {
  box-shadow:
    inset 0 0 0 1px rgba(64, 158, 255, 0.4),
    0 0 0 4px rgba(64, 158, 255, 0.08);
}

.chat-window__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.chat-window__send {
  min-width: 108px;
}

@media (max-width: 640px) {
  .chat-window {
    min-height: 0;
    padding: 16px;
    border-radius: 24px;
  }

  .chat-window__hero h3 {
    font-size: 24px;
  }

  .chat-window__selectors {
    grid-template-columns: 1fr;
  }

  .chat-window__messages {
    max-height: 56vh;
    min-height: 280px;
  }

  .chat-window__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .chat-window__send {
    width: 100%;
  }
}
</style>
