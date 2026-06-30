<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AIChatWindow from '@/components/ai/AIChatWindow.vue'
import { getDefaultModelForProvider, getModelOptions, getProviderOptions } from '@/constants/aiModels'
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

const quickQuestions = [
  '我的車最近需要保養什麼？',
  '保險最近什麼時候到期？',
  '最近一次維修後還需要注意什麼？',
  '最近油耗或耗電狀況怎麼樣？',
  '哪一筆支出最值得優先處理？',
]

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
        <p>可切換 Gemini 與 OpenRouter Provider，依目前車輛資料取得保養、維修、保險與能源分析建議。</p>
      </div>
    </div>

    <div class="ai-page-grid">
      <section class="soft-panel ai-vehicle-panel">
        <p class="eyebrow">目前車輛</p>
        <template v-if="activeVehicle">
          <h3>{{ activeVehicle.brand }} {{ activeVehicle.model }}</h3>
          <p class="muted">{{ activeVehicle.plateNumber }} · 目前里程 {{ activeVehicle.currentMileage.toLocaleString('zh-TW') }} km</p>
          <div class="ai-metrics">
            <div class="metric-chip">
              <strong>{{ context.maintenanceRecords.length }}</strong>
              <span>保養紀錄</span>
            </div>
            <div class="metric-chip">
              <strong>{{ context.repairRecords.length }}</strong>
              <span>維修紀錄</span>
            </div>
            <div class="metric-chip">
              <strong>{{ context.fuelRecords.length }}</strong>
              <span>能源紀錄</span>
            </div>
            <div class="metric-chip">
              <strong>{{ context.insuranceRecords.length }}</strong>
              <span>保險資料</span>
            </div>
          </div>
        </template>
        <el-empty v-else description="請先選定一台車輛，AI 才能依據資料提供建議。" />
      </section>

      <AIChatWindow
        :messages="messages"
        :loading="loading"
        :quick-questions="quickQuestions"
        :provider="provider"
        :model="model"
        :provider-options="providerOptions"
        :model-options="modelOptions"
        @send="ask"
        @update:provider="updateProvider"
        @update:model="updateModel"
      />
    </div>
  </section>
</template>

<style scoped>
.ai-page-grid {
  display: grid;
  gap: 18px;
}

.ai-vehicle-panel {
  padding: 18px;
}

.ai-vehicle-panel h3 {
  margin: 8px 0 0;
  font-size: 28px;
}

.ai-vehicle-panel p {
  margin: 8px 0 0;
}

.ai-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

@media (min-width: 1100px) {
  .ai-page-grid {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
  }

  .ai-vehicle-panel {
    position: sticky;
    top: 20px;
  }
}
</style>
