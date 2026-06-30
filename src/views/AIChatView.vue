<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AIChatWindow from '@/components/ai/AIChatWindow.vue'
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

const loading = ref(false)
const provider = ref<AIProvider>(getStoredAIProvider())
const model = ref(getStoredAIModel(provider.value))
const messages = ref<AIMessageItem[]>([
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '我是 DriveOne AI 車輛顧問，可以依據你目前選定車輛的里程、保養、維修、能源與保險資料提供建議。',
    createdAt: Date.now(),
  },
])

const activeVehicle = computed(() => vehicleStore.activeVehicle)
const activeVehicleId = computed(() => vehicleStore.activeVehicleId)
const providerOptions = getProviderOptions()
const modelOptions = computed(() => getModelOptions(provider.value))

const context = computed<AIChatContext>(() => ({
  vehicle: activeVehicle.value,
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
    : '請先選擇主要車輛，AI 才能提供更精準的診斷與建議。',
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

async function ask(message: string) {
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

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchAll(),
    maintenanceStore.fetchAll(),
    repairStore.fetchAll(),
    fuelStore.fetchAll(),
    insuranceStore.fetchAll(),
  ])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>DriveOne AI</h1>
        <p>以更貼近產品化的 Tesla / Apple 風格介面，整合車況摘要、健康分數、快捷提問與模型設定。</p>
      </div>
    </div>

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
      @send="ask"
      @update:provider="updateProvider"
      @update:model="updateModel"
    />
  </section>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.page-header h1 {
  margin-bottom: 8px;
}

.page-header p {
  max-width: 720px;
  color: var(--ds-text-soft);
  line-height: 1.75;
}
</style>
