<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AIHeader from './AIHeader.vue'
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
  quickActions: string[]
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
const healthTone = computed(() => {
  if (props.healthScore >= 90) return { label: '優良', color: '#67C23A' }
  if (props.healthScore >= 80) return { label: '需注意', color: '#E6A23C' }
  if (props.healthScore >= 70) return { label: '警告', color: '#f59e0b' }
  return { label: '危險', color: '#F56C6C' }
})
const emptyStateCopy = computed(() => {
  if (props.heroTitle === '尚未選定車輛') {
    return '先選定一台主要車輛，AI 才能更精準地分析保養、維修、保險與花費。'
  }

  return '可直接詢問最近保養、花費分析、保險到期或能源效率。'
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
  <section class="floating-chat">
    <AIHeader closable icon-only-settings keep-inline-on-mobile @settings="settingsOpen = true" @close="emit('close')" />

    <section class="floating-chat__hero">
      <div class="floating-chat__hero-copy">
        <p class="eyebrow">目前車輛</p>
        <h3>{{ heroTitle }}</h3>
        <p class="floating-chat__subtitle">{{ heroSubtitle }}</p>
        <div class="floating-chat__chips">
          <span class="floating-chat__chip">{{ mileageText }}</span>
          <span class="floating-chat__chip floating-chat__chip--health" :style="{ color: healthTone.color }">
            健康 {{ healthScore }} · {{ healthTone.label }}
          </span>
        </div>
      </div>
    </section>

    <AIQuickActions :actions="quickActions" @select="sendQuickAction" />

    <section class="floating-chat__body">
      <div ref="scrollerRef" class="floating-chat__messages">
        <template v-if="hasMessages">
          <component
            :is="message.role === 'assistant' ? AIMessage : UserMessage"
            v-for="message in messages"
            :key="message.id"
            :content="message.content"
          />
        </template>

        <div v-else class="floating-chat__empty">
          <strong>從這裡開始和 DriveOne AI 對話</strong>
          <span>{{ emptyStateCopy }}</span>
        </div>

        <AIThinking v-if="loading" />
      </div>
    </section>

    <form class="floating-chat__composer" @submit.prevent="submit">
      <AIInput
        v-model="draft"
        :loading="loading"
        compact
        placeholder="詢問保養、維修、保險、花費或車況..."
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
.floating-chat {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.12), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.floating-chat__hero {
  margin-top: 10px;
  padding: 12px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.94), rgba(238, 246, 255, 0.92));
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.floating-chat__hero-copy h3 {
  margin: 4px 0 0;
  font-size: 20px;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.floating-chat__subtitle {
  margin: 4px 0 0;
  color: var(--ds-text-soft);
  font-size: 13px;
  line-height: 1.5;
}

.floating-chat__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.floating-chat__chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.05);
  font-size: 12px;
  font-weight: 700;
}

.floating-chat__chip--health {
  background: rgba(255, 255, 255, 0.82);
}

.floating-chat__body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.floating-chat__messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 4px 4px 2px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.floating-chat__empty {
  padding: 18px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(255, 255, 255, 0.84)),
    rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(64, 158, 255, 0.14);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floating-chat__empty strong {
  font-size: 15px;
  line-height: 1.45;
}

.floating-chat__empty span {
  color: var(--ds-text-soft);
  line-height: 1.68;
}

.floating-chat__composer {
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding-top: 4px;
  background: linear-gradient(180deg, rgba(247, 250, 252, 0), rgba(247, 250, 252, 0.92) 24%, rgba(247, 250, 252, 0.98) 100%);
}

@media (max-width: 640px) {
  .floating-chat {
    height: 100dvh;
    padding: 12px;
    border-radius: 0;
    gap: 8px;
  }

  .floating-chat__hero {
    margin-top: 10px;
    padding: 10px 12px;
  }

  .floating-chat__hero-copy h3 {
    font-size: 18px;
  }

  .floating-chat__subtitle {
    font-size: 12px;
  }

  .floating-chat__chips {
    margin-top: 6px;
  }

  .floating-chat__messages {
    padding-bottom: 0;
  }
}
</style>
