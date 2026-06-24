<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FuelForm from '@/components/FuelForm.vue'
import { useFuelStore } from '@/stores/fuelStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { FuelInput, FuelRecord } from '@/types/fuel'
import { getAverageFuelEfficiency, getFuelInsights } from '@/utils/fuel'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

const fuelStore = useFuelStore()
const vehicleStore = useVehicleStore()
const dialogVisible = ref(false)
const editingRecord = ref<FuelRecord | null>(null)
const selectedVehicleId = ref('')

const filteredRecords = computed(() =>
  fuelStore.records.filter((record) => !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value),
)

const vehicleNameMap = computed(
  () =>
    new Map(
      vehicleStore.vehicles.map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]),
    ),
)

const insights = computed(() => getFuelInsights(filteredRecords.value))
const averageEfficiency = computed(() => getAverageFuelEfficiency(filteredRecords.value))

function openCreate() {
  editingRecord.value = null
  dialogVisible.value = true
}

function openEdit(record: FuelRecord) {
  editingRecord.value = record
  dialogVisible.value = true
}

async function submitRecord(payload: FuelInput) {
  if (editingRecord.value) {
    await fuelStore.update(editingRecord.value.id, payload)
    ElMessage.success('加油紀錄已更新')
  } else {
    await fuelStore.create(payload)
    ElMessage.success('加油紀錄已新增')
  }
  await vehicleStore.fetchAll()
  dialogVisible.value = false
}

async function removeRecord(record: FuelRecord) {
  await ElMessageBox.confirm('確定刪除這筆加油紀錄嗎？', '刪除確認', { type: 'warning' })
  await fuelStore.remove(record.id)
  ElMessage.success('加油紀錄已刪除')
}

onMounted(async () => {
  await Promise.all([vehicleStore.fetchAll(), fuelStore.fetchAll()])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>加油紀錄</h1>
        <p>顯示每次油耗與平均油耗，掌握加油成本。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.vehicles.length" @click="openCreate">新增紀錄</el-button>
    </div>

    <div class="toolbar">
      <el-select v-model="selectedVehicleId" clearable placeholder="篩選機車">
        <el-option v-for="option in vehicleStore.vehicleOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
      <el-tag v-if="averageEfficiency" type="success" effect="light">
        平均油耗 {{ formatNumber(averageEfficiency, 1) }} km/L
      </el-tag>
    </div>

    <div class="mobile-only mobile-card-list">
      <article v-for="record in filteredRecords" :key="record.id" class="mobile-record-card">
        <div class="mobile-record-card__top">
          <div>
            <p class="eyebrow">{{ vehicleNameMap.get(record.vehicleId) ?? '-' }}</p>
            <h3 class="mobile-record-card__title">{{ formatDate(record.date) }}</h3>
            <p class="mobile-record-card__subtitle">{{ record.fuelType }} 號 · {{ record.isFullTank ? '滿油' : '未滿油' }}</p>
          </div>
          <el-tag type="success" round>{{ formatCurrency(record.amount) }}</el-tag>
        </div>
        <div class="mobile-record-card__meta">
          <div class="metric-chip">
            <strong>{{ formatNumber(record.liters, 1) }}</strong>
            <span>公升數 L</span>
          </div>
          <div class="metric-chip">
            <strong>{{ insights.get(record.id)?.efficiency ? formatNumber(insights.get(record.id)!.efficiency!, 1) : '-' }}</strong>
            <span>油耗 km/L</span>
          </div>
        </div>
        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="openEdit(record)">編輯</el-button>
          <el-button class="secondary-cta" type="danger" plain @click="removeRecord(record)">刪除</el-button>
        </div>
      </article>
    </div>

    <el-table :data="filteredRecords" class="glass-card desktop-table desktop-only" stripe>
      <el-table-column label="日期" prop="date" min-width="120" />
      <el-table-column label="機車" min-width="160">
        <template #default="{ row }">{{ vehicleNameMap.get(row.vehicleId) ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="里程" prop="mileage" min-width="110" />
      <el-table-column label="公升數" min-width="110">
        <template #default="{ row }">{{ formatNumber(row.liters, 1) }} L</template>
      </el-table-column>
      <el-table-column label="金額" min-width="110">
        <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="油耗" min-width="120">
        <template #default="{ row }">
          {{ insights.get(row.id)?.efficiency ? `${formatNumber(insights.get(row.id)!.efficiency!, 1)} km/L` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="每公里油錢" min-width="120">
        <template #default="{ row }">
          {{ insights.get(row.id)?.costPerKm ? `${formatCurrency(insights.get(row.id)!.costPerKm!).replace('NT$', '')} / km` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">編輯</el-button>
          <el-button size="small" type="danger" plain @click="removeRecord(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <FuelForm
      v-model="dialogVisible"
      :editing-record="editingRecord"
      :vehicle-options="vehicleStore.vehicleOptions"
      @submit="submitRecord"
    />
  </section>
</template>
