<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FuelForm from '@/components/FuelForm.vue'
import {
  getEnergyActionLabel,
  getEnergyEfficiencyLabel,
  getEnergyRecordLabel,
  getEnergyUnitLabel,
} from '@/constants/vehicles'
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
const viewMode = ref<'card' | 'table'>('card')

const filteredRecords = computed(() =>
  fuelStore.records.filter((record) => !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value),
)

const selectedVehicle = computed(() => vehicleStore.vehicles.find((vehicle) => vehicle.id === selectedVehicleId.value) ?? null)

const vehicleNameMap = computed(
  () =>
    new Map(
      vehicleStore.vehicles.map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]),
    ),
)

const insights = computed(() => getFuelInsights(filteredRecords.value))
const averageEfficiency = computed(() => getAverageFuelEfficiency(filteredRecords.value))
const pageTitle = computed(() => getEnergyRecordLabel(selectedVehicle.value?.vehicleType))
const addActionLabel = computed(() => getEnergyActionLabel(selectedVehicle.value?.vehicleType))
const efficiencyLabel = computed(() => getEnergyEfficiencyLabel(selectedVehicle.value?.vehicleType))

function getVehicleType(record: FuelRecord) {
  return vehicleStore.vehicles.find((vehicle) => vehicle.id === record.vehicleId)?.vehicleType
}

function getRecordActionLabel(record: FuelRecord) {
  return getEnergyActionLabel(getVehicleType(record))
}

function getRecordUnitLabel(record: FuelRecord) {
  return getEnergyUnitLabel(getVehicleType(record)).split(' ')[0]
}

function getRecordEfficiencyLabel(record: FuelRecord) {
  return getEnergyEfficiencyLabel(getVehicleType(record))
}

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
    ElMessage.success(`${getEnergyActionLabel(getVehicleType(editingRecord.value))}已更新`)
  } else {
    await fuelStore.create(payload)
    ElMessage.success(`${getEnergyActionLabel(selectedVehicle.value?.vehicleType)}已新增`)
  }

  await vehicleStore.fetchAll()
  dialogVisible.value = false
}

async function removeRecord(record: FuelRecord) {
  await ElMessageBox.confirm(`確定刪除這筆${getRecordActionLabel(record)}嗎？`, '刪除確認', { type: 'warning' })
  await fuelStore.remove(record.id)
  ElMessage.success(`${getRecordActionLabel(record)}已刪除`)
}

onMounted(async () => {
  await Promise.all([vehicleStore.fetchAll(), fuelStore.fetchAll()])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>追蹤各台車輛的能源補給、單次花費與使用效率，並自由切換卡片或列表顯示。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.vehicles.length" @click="openCreate">
        新增{{ addActionLabel }}
      </el-button>
    </div>

    <div class="toolbar">
      <el-select v-model="selectedVehicleId" clearable placeholder="篩選車輛">
        <el-option
          v-for="option in vehicleStore.vehicleOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-tag v-if="averageEfficiency" type="success" effect="light">
        平均效率 {{ formatNumber(averageEfficiency, 1) }} {{ efficiencyLabel }}
      </el-tag>
      <el-radio-group v-model="viewMode" class="view-toggle">
        <el-radio-button label="card">卡片</el-radio-button>
        <el-radio-button label="table">列表</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="viewMode === 'card'" class="mobile-card-list record-card-grid">
      <article v-for="record in filteredRecords" :key="record.id" class="mobile-record-card">
        <div class="mobile-record-card__top">
          <div>
            <p class="eyebrow">{{ vehicleNameMap.get(record.vehicleId) ?? '-' }}</p>
            <h3 class="mobile-record-card__title">{{ formatDate(record.date) }}</h3>
            <p class="mobile-record-card__subtitle">
              {{ record.fuelType }} ·
              {{ record.isFullTank ? (getRecordActionLabel(record).includes('充電') ? '已充滿' : '滿油') : '未補滿' }}
            </p>
          </div>
          <el-tag type="success" round>{{ formatCurrency(record.amount) }}</el-tag>
        </div>

        <div class="mobile-record-card__meta">
          <div class="metric-chip">
            <strong>{{ formatNumber(record.liters, 1) }}</strong>
            <span>{{ getRecordUnitLabel(record) }}</span>
          </div>
          <div class="metric-chip">
            <strong>{{ insights.get(record.id)?.efficiency ? formatNumber(insights.get(record.id)!.efficiency!, 1) : '-' }}</strong>
            <span>{{ getRecordEfficiencyLabel(record) }}</span>
          </div>
        </div>

        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="openEdit(record)">編輯</el-button>
          <el-button class="secondary-cta" type="danger" plain @click="removeRecord(record)">刪除</el-button>
        </div>
      </article>
    </div>

    <el-table v-else :data="filteredRecords" class="glass-card desktop-table" stripe>
      <el-table-column label="日期" prop="date" min-width="120" />
      <el-table-column label="車輛" min-width="160">
        <template #default="{ row }">{{ vehicleNameMap.get(row.vehicleId) ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="里程" prop="mileage" min-width="110" />
      <el-table-column label="補給數量" min-width="120">
        <template #default="{ row }">{{ formatNumber(row.liters, 1) }} {{ getRecordUnitLabel(row) }}</template>
      </el-table-column>
      <el-table-column label="金額" min-width="110">
        <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="效率" min-width="130">
        <template #default="{ row }">
          {{ insights.get(row.id)?.efficiency ? `${formatNumber(insights.get(row.id)!.efficiency!, 1)} ${getRecordEfficiencyLabel(row)}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="每公里成本" min-width="120">
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
      :vehicles="vehicleStore.vehicles"
      @submit="submitRecord"
    />
  </section>
</template>

<style scoped>
.view-toggle {
  margin-left: auto;
}

@media (min-width: 961px) {
  .record-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    align-items: start;
  }
}

@media (max-width: 640px) {
  .view-toggle {
    margin-left: 0;
  }
}
</style>
