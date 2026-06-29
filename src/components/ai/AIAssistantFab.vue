<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AIChatWindow from './AIChatWindow.vue'
import { sendAIChatMessage } from '@/services/aiService'
import { useFuelStore } from '@/stores/fuelStore'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useRepairStore } from '@/stores/repairStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { AIChatContext, AIMessageItem } from '@/types/ai'

const vehicleStore = useVehicleStore()
const maintenanceStore = useMaintenanceStore()
const repairStore = useRepairStore()
const fuelStore = useFuelStore()
const insuranceStore = useInsuranceStore()

const visible = ref(false)
const loading = ref(false)
const bootstrapped = ref(false)
const messages = ref<AIMessageItem[]>([
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '我是 DriveOne AI 車輛顧問。你可以直接問我保養、維修、油耗、花費或保險問題，我會根據目前車輛資料幫你分析。',
    createdAt: Date.now(),
  },
])

const quickQuestions = [
  '我的車近期最需要優先處理什麼？',
  '保險是否快到期？',
  '最近油耗表現如何？',
  '最近保養或維修花費偏高嗎？',
]

const activeVehicleId = computed(() => vehicleStore.activeVehicleId)
const context = computed<AIChatContext>(() => ({
  vehicle: vehicleStore.activeVehicle,
  maintenanceRecords: maintenanceStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  repairRecords: repairStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  fuelRecords: fuelStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 20),
  insuranceRecords: insuranceStore.records.filter((record) => record.vehicleId === activeVehicleId.value),
}))

async function ensureData() {
  if (bootstrapped.value) return

  await Promise.all([
    vehicleStore.fetchAll(),
    maintenanceStore.fetchAll(),
    repairStore.fetchAll(),
    fuelStore.fetchAll(),
    insuranceStore.fetchAll(),
  ])

  bootstrapped.value = true
}

async function togglePanel() {
  visible.value = !visible.value

  if (visible.value) {
    await ensureData()
  }
}

async function ask(message: string) {
  if (!bootstrapped.value) {
    await ensureData()
  }

  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    content: message,
    createdAt: Date.now(),
  })

  loading.value = true

  try {
    const response = await sendAIChatMessage({
      message,
      context: context.value,
    })

    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.reply,
      createdAt: Date.now(),
    })
  } catch (error) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: error instanceof Error ? `目前無法取得 AI 回覆：${error.message}` : '目前無法取得 AI 回覆，請稍後再試。',
      createdAt: Date.now(),
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  ensureData()
})
</script>

<template>
  <div class="ai-fab-layer">
    <transition name="ai-panel">
      <section v-if="visible" class="ai-fab-panel">
        <div class="ai-fab-panel__topbar">
          <div>
            <p class="eyebrow">DriveOne AI</p>
            <strong>車輛顧問</strong>
          </div>
          <el-button circle plain class="secondary-cta" @click="visible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="!context.vehicle" class="ai-fab-panel__hint soft-panel">
          <strong>尚未選擇主要車輛</strong>
          <span class="muted">請先在車輛管理中設定主要車輛，AI 才能依據資料分析。</span>
        </div>

        <div v-else class="ai-fab-panel__vehicle">
          <span class="eyebrow">目前分析車輛</span>
          <strong>{{ context.vehicle.brand }} {{ context.vehicle.model }}</strong>
          <small>{{ context.vehicle.plateNumber }} · {{ context.vehicle.currentMileage.toLocaleString('zh-TW') }} km</small>
        </div>

        <AIChatWindow
          :messages="messages"
          :loading="loading"
          :quick-questions="quickQuestions"
          @send="ask"
        />
      </section>
    </transition>

    <button type="button" class="ai-fab-button" @click="togglePanel">
      <span class="ai-fab-button__icon">AI</span>
      <span class="ai-fab-button__label">車輛顧問</span>
    </button>
  </div>
</template>

<style scoped>
.ai-fab-layer {
  position: fixed;
  right: 18px;
  bottom: 102px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.ai-fab-button {
  border: none;
  border-radius: 999px;
  padding: 14px 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #0f172a, #1f4f9c 52%, #409eff);
  color: #fff;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.28);
  cursor: pointer;
}

.ai-fab-button__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  font-weight: 800;
}

.ai-fab-button__label {
  font-size: 14px;
  font-weight: 700;
}

.ai-fab-panel {
  width: min(460px, calc(100vw - 24px));
  max-height: min(78vh, 820px);
  padding: 14px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-fab-panel :deep(.chat-window) {
  min-height: 0;
  height: 100%;
  box-shadow: none;
  border: none;
  background: transparent;
  padding: 0;
}

.ai-fab-panel :deep(.chat-window__messages) {
  min-height: 280px;
  max-height: 42vh;
}

.ai-fab-panel :deep(.chat-window__header) {
  display: none;
}

.ai-fab-panel__topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ai-fab-panel__vehicle,
.ai-fab-panel__hint {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.16);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-fab-panel__vehicle small {
  color: var(--ds-text-soft);
}

.ai-panel-enter-active,
.ai-panel-leave-active {
  transition: all 0.2s ease;
}

.ai-panel-enter-from,
.ai-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 640px) {
  .ai-fab-layer {
    right: 12px;
    left: 12px;
    bottom: 92px;
    align-items: stretch;
  }

  .ai-fab-panel {
    width: 100%;
  }

  .ai-fab-button {
    align-self: flex-end;
  }
}

@media (min-width: 961px) {
  .ai-fab-layer {
    bottom: 24px;
    right: 24px;
  }
}
</style>
