<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AIChatWindow from '@/components/ai/AIChatWindow.vue'
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

const loading = ref(false)
const messages = ref<AIMessageItem[]>([
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '我是 DriveOne AI 車輛顧問。你可以問我保養、維修、油耗、花費或保險到期相關問題，我會根據目前資料幫你分析。',
    createdAt: Date.now(),
  },
])

const quickQuestions = [
  '我的車近期最需要優先處理什麼？',
  '保險是否快到期？我現在該注意什麼？',
  '最近保養與維修花費偏高嗎？',
  '我的平均油耗表現如何？',
  '有哪些保養項目可能快到了？',
]

const activeVehicle = computed(() => vehicleStore.activeVehicle)
const activeVehicleId = computed(() => vehicleStore.activeVehicleId)

const context = computed<AIChatContext>(() => ({
  vehicle: activeVehicle.value,
  maintenanceRecords: maintenanceStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  repairRecords: repairStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 12),
  fuelRecords: fuelStore.records.filter((record) => record.vehicleId === activeVehicleId.value).slice(0, 20),
  insuranceRecords: insuranceStore.records.filter((record) => record.vehicleId === activeVehicleId.value),
}))

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
        <p>針對目前車輛資料進行第一版 AI 顧問對話，提供保養、維修、油耗與保險建議。</p>
      </div>
    </div>

    <div class="ai-page-grid">
      <section class="soft-panel ai-vehicle-panel">
        <p class="eyebrow">目前分析車輛</p>
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
        <el-empty v-else description="請先選擇主要車輛，AI 才能依資料分析。" />
      </section>

      <AIChatWindow
        :messages="messages"
        :loading="loading"
        :quick-questions="quickQuestions"
        @send="ask"
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
