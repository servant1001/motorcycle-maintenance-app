<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AIHeader from './AIHeader.vue'
import AIHeroCard from './AIHeroCard.vue'
import AIInput from './AIInput.vue'
import AIMessage from './AIMessage.vue'
import AIQuickActions from './AIQuickActions.vue'
import AISettingsDrawer from './AISettingsDrawer.vue'
import AIThinking from './AIThinking.vue'
import UserMessage from './UserMessage.vue'
import type { AIMessageItem } from '@/types/ai'

const props = defineProps<{
  messages: AIMessageItem[]
  loading: boolean
  provider: string
  model: string
  providerOptions: Array<{ label: string; value: string }>
  modelOptions: Array<{ label: string; value: string }>
  heroTitle: string
  heroSubtitle: string
  mileageText: string
  healthScore: number
  maintenanceCount: number
  repairCount: number
  insuranceCount: number
  fuelCount: number
  quickActions: string[]
  closable?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  'update:provider': [provider: string]
  'update:model': [model: string]
  close: []
}>()

const draft = ref('')
const scrollerRef = ref<HTMLElement | null>(null)
const settingsOpen = ref(false)

const hasMessages = computed(() => props.messages.length > 0)
const emptyStateCopy = computed(() => {
  if (props.heroTitle === '尚未選定車輛') {
    return '先選定一台車輛，DriveOne AI 就能依據里程、保養、維修、保險與能源紀錄提供更精準的建議。'
  }

  return '可以直接詢問保養優先順序、本月支出、保險到期時間，或點選快捷提問快速開始。'
})

function submit() {
  const message = draft.value.trim()
  if (!message) return
  emit('send', message)
  draft.value = ''
}

function sendQuickAction(question: string) {
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
  <section class="chat-window">
    <AIHeader
      :closable="closable"
      @settings="settingsOpen = true"
      @close="emit('close')"
    />

    <AIHeroCard
      :title="heroTitle"
      :subtitle="heroSubtitle"
      :mileage-text="mileageText"
      :health-score="healthScore"
      :maintenance-count="maintenanceCount"
      :repair-count="repairCount"
      :insurance-count="insuranceCount"
      :fuel-count="fuelCount"
    />

    <AIQuickActions :actions="quickActions" @select="sendQuickAction" />

    <section class="chat-window__body">
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
          <strong>從這裡開始和 DriveOne AI 對話</strong>
          <span>{{ emptyStateCopy }}</span>
        </div>

        <AIThinking v-if="loading" />
      </div>
    </section>

    <form class="chat-window__composer" @submit.prevent="submit">
      <AIInput
        v-model="draft"
        :loading="loading"
        placeholder="詢問保養、維修、保險、花費或車況..."
        helper-text="AI 會依目前選定車輛與紀錄回答"
        @send="submit"
      />
    </form>

    <AISettingsDrawer
      v-model="settingsOpen"
      :provider="provider"
      :model="model"
      :provider-options="providerOptions"
      :model-options="modelOptions"
      @update:provider="emit('update:provider', $event)"
      @update:model="emit('update:model', $event)"
    />
  </section>
</template>

<style scoped>
.chat-window {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  height: 100%;
  min-height: 72vh;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.chat-window__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-window__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: auto;
  padding: 8px 6px 8px 2px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
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
  line-height: 1.72;
}

.chat-window__composer {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .chat-window {
    min-height: 100dvh;
    height: 100dvh;
    padding: 14px;
    border-radius: 0;
  }

  .chat-window__empty {
    padding: 18px;
  }

  .chat-window__body {
    padding-bottom: 4px;
  }
}
</style>
