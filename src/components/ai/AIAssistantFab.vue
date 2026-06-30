<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AIChatWindow from './AIChatWindow.vue'
import { getDefaultModelForProvider, getModelOptions, getProviderOptions } from '@/constants/aiModels'
import { getVehicleTypeIcon, getVehicleTypeLabel } from '@/constants/vehicles'
import { getStoredAIModel, getStoredAIProvider, setStoredAIModel, setStoredAIProvider } from '@/services/aiPreferences'
import { sendAIChatMessage } from '@/services/aiService'
import { useFuelStore } from '@/stores/fuelStore'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useRepairStore } from '@/stores/repairStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { AIChatContext, AIMessageItem, AIProvider } from '@/types/ai'

const vehicleStore = useVehicleStore()
const maintenanceStore = useMaintenanceStore()
const repairStore = useRepairStore()
const fuelStore = useFuelStore()
const insuranceStore = useInsuranceStore()

const visible = ref(false)
const loading = ref(false)
const bootstrapped = ref(false)
const provider = ref<AIProvider>(getStoredAIProvider())
const model = ref(getStoredAIModel(provider.value))
const messages = ref<AIMessageItem[]>([
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '我是 DriveOne AI 車輛顧問，可以根據你目前選定車輛的資料，提供保養、維修、保險與能源建議。',
    createdAt: Date.now(),
  },
])

const providerOptions = getProviderOptions()
const modelOptions = computed(() => getModelOptions(provider.value))
const activeVehicleId = computed(() => vehicleStore.activeVehicleId)
const context = computed<AIChatContext>(() => ({
  vehicle: vehicleStore.activeVehicle,
  maintenanceRecords: maintenanceStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  repairRecords: repairStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  fuelRecords: fuelStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 20),
  insuranceRecords: insuranceStore.records.filter((record) => record.vehicleId === activeVehicleId.value),
}))

const heroTitle = computed(() =>
  context.value.vehicle
    ? `${getVehicleTypeIcon(context.value.vehicle.vehicleType)} ${context.value.vehicle.brand} ${context.value.vehicle.model}`
    : '尚未選定車輛',
)
const heroSubtitle = computed(() =>
  context.value.vehicle
    ? `${getVehicleTypeLabel(context.value.vehicle.vehicleType)} · ${context.value.vehicle.plateNumber}`
    : '請先選擇主要車輛，AI 才能提供更精準的個人化建議。',
)
const mileageText = computed(() =>
  context.value.vehicle ? `目前里程 ${context.value.vehicle.currentMileage.toLocaleString('zh-TW')} km` : '尚無車輛資料',
)
const healthScore = computed(() => {
  let score = 96
  if (!context.value.vehicle) return 0
  if (context.value.insuranceRecords.length === 0) score -= 8
  if (context.value.maintenanceRecords.length === 0) score -= 10
  if (context.value.repairRecords.length > 6) score -= 6
  return Math.max(62, Math.min(98, score))
})

const quickActions = [
  '保養分析',
  '花費分析',
  '保險資訊',
  '最近提醒',
  '能源效率',
]

function updateProvider(nextProvider: string) {
  provider.value = nextProvider === 'openrouter' ? 'openrouter' : 'gemini'
  setStoredAIProvider(provider.value)
  model.value = getDefaultModelForProvider(provider.value)
  setStoredAIModel(model.value)
}

function updateModel(nextModel: string) {
  model.value = nextModel
  setStoredAIModel(model.value)
}

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
      provider: provider.value,
      model: model.value,
      message,
      context: context.value,
    })

    provider.value = response.provider
    model.value = response.model
    setStoredAIProvider(response.provider)
    setStoredAIModel(response.model)

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
      content: error instanceof Error ? `AI 回覆失敗：${error.message}` : 'AI 回覆失敗，請稍後再試。',
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
  <div class="ai-fab-layer" :class="{ 'ai-fab-layer--open': visible }">
    <transition name="ai-panel">
      <section v-if="visible" class="ai-fab-panel">
        <AIChatWindow
          :messages="messages"
          :loading="loading"
          :provider="provider"
          :model="model"
          :provider-options="providerOptions"
          :model-options="modelOptions"
          :hero-title="heroTitle"
          :hero-subtitle="heroSubtitle"
          :mileage-text="mileageText"
          :health-score="healthScore"
          :maintenance-count="context.maintenanceRecords.length"
          :repair-count="context.repairRecords.length"
          :insurance-count="context.insuranceRecords.length"
          :fuel-count="context.fuelRecords.length"
          :quick-actions="quickActions"
          closable
          @send="ask"
          @update:provider="updateProvider"
          @update:model="updateModel"
          @close="visible = false"
        />
      </section>
    </transition>

    <button v-if="!visible" type="button" class="ai-fab-button" @click="togglePanel">
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
  z-index: 80;
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
  width: min(520px, calc(100vw - 24px));
  max-height: min(86vh, 920px);
  overflow: hidden;
  display: flex;
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
    left: auto;
    top: auto;
    bottom: calc(86px + env(safe-area-inset-bottom, 0px));
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0;
  }

  .ai-fab-layer--open {
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    align-items: stretch;
    justify-content: stretch;
    background: rgba(15, 23, 42, 0.24);
    backdrop-filter: blur(10px);
  }

  .ai-fab-layer--open .ai-fab-panel {
    width: 100%;
    max-height: none;
    height: 100dvh;
    overflow: hidden;
  }

  .ai-fab-button {
    padding: 12px 16px;
    z-index: 2;
  }
}

@media (min-width: 961px) {
  .ai-fab-layer {
    bottom: 24px;
    right: 24px;
  }
}
</style>
