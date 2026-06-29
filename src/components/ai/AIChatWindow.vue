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
}>()

const emit = defineEmits<{
  send: [message: string]
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
  <section class="chat-window soft-panel">
    <div class="chat-window__header">
      <div>
        <p class="eyebrow">DriveOne AI</p>
        <h3>車輛顧問</h3>
      </div>
      <span class="muted">根據目前資料提供保養、維修、油耗與保險建議</span>
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
        <strong>從下方輸入問題，或先點選快速提問。</strong>
        <span>例如：目前保養花費偏高嗎？我的保險快到期了嗎？</span>
      </div>

      <TypingIndicator v-if="loading" />
    </div>

    <form class="chat-window__composer" @submit.prevent="submit">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="3"
        resize="none"
        placeholder="輸入你想問的問題，例如：我這台車近期最值得優先處理的是什麼？"
      />
      <div class="chat-window__actions">
        <span class="muted">AI 會依目前車輛資料回答</span>
        <el-button type="primary" class="primary-cta" native-type="submit" :loading="loading">送出</el-button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.chat-window {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 72vh;
}

.chat-window__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-window__header h3 {
  margin: 6px 0 0;
  font-size: 28px;
}

.chat-window__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 360px;
  max-height: 72vh;
  overflow: auto;
  padding-right: 4px;
}

.chat-window__empty {
  padding: 22px;
  border-radius: 22px;
  background: rgba(64, 158, 255, 0.06);
  border: 1px dashed rgba(64, 158, 255, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-window__composer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-window__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

@media (max-width: 640px) {
  .chat-window {
    min-height: 0;
  }

  .chat-window__messages {
    max-height: 56vh;
  }

  .chat-window__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
