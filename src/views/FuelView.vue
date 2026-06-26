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
import { fetchGasMarketSnapshot, type GasMarketSnapshot } from '@/services/gasPriceService'
import { useFuelStore } from '@/stores/fuelStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { FuelInput, FuelRecord } from '@/types/fuel'
import { getAverageFuelEfficiency, getCumulativeFuelEfficiency, getFuelInsights } from '@/utils/fuel'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

const fuelStore = useFuelStore()
const vehicleStore = useVehicleStore()
const dialogVisible = ref(false)
const editingRecord = ref<FuelRecord | null>(null)
const selectedVehicleId = ref('')
const viewMode = ref<'card' | 'table'>('card')
const gasMarket = ref<GasMarketSnapshot | null>(null)
const gasMarketLoading = ref(false)
const gasMarketError = ref('')

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
const cumulativeEfficiency = computed(() => getCumulativeFuelEfficiency(filteredRecords.value))
const pageTitle = computed(() => getEnergyRecordLabel(selectedVehicle.value?.vehicleType))
const addActionLabel = computed(() => getEnergyActionLabel(selectedVehicle.value?.vehicleType))
const efficiencyLabel = computed(() => getEnergyEfficiencyLabel(selectedVehicle.value?.vehicleType))
const gasChangeDirection = computed(() => {
  if (!gasMarket.value?.changeRate) return 'flat'
  if (gasMarket.value.changeRate.startsWith('-')) return 'down'
  if (gasMarket.value.changeRate.startsWith('+')) return 'up'
  return gasMarket.value.changeRate === '0' || gasMarket.value.changeRate === '0%' ? 'flat' : 'up'
})

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
    ElMessage.success(`${getEnergyActionLabel(getVehicleType(editingRecord.value))}紀錄已更新`)
  } else {
    await fuelStore.create(payload)
    ElMessage.success(`${getEnergyActionLabel(selectedVehicle.value?.vehicleType)}紀錄已新增`)
  }

  await vehicleStore.fetchAll()
  dialogVisible.value = false
}

async function removeRecord(record: FuelRecord) {
  await ElMessageBox.confirm(`確定要刪除這筆${getRecordActionLabel(record)}紀錄嗎？`, '刪除紀錄', { type: 'warning' })
  await fuelStore.remove(record.id)
  ElMessage.success(`${getRecordActionLabel(record)}紀錄已刪除`)
}

async function loadGasMarket() {
  gasMarketLoading.value = true
  gasMarketError.value = ''

  try {
    gasMarket.value = await fetchGasMarketSnapshot()
  } catch (error) {
    gasMarketError.value = error instanceof Error ? error.message : '無法取得本週油價資訊'
  } finally {
    gasMarketLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([vehicleStore.fetchAll(), fuelStore.fetchAll(), loadGasMarket()])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>查看不同車輛的加油或充電紀錄、效率表現，並同步掌握本週油價與下週汽油調整預測。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.vehicles.length" @click="openCreate">
        新增{{ addActionLabel }}
      </el-button>
    </div>

    <div class="toolbar">
      <el-select v-model="selectedVehicleId" clearable placeholder="選擇車輛">
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
      <el-tag v-if="cumulativeEfficiency" type="primary" effect="light">
        累積總平均 {{ formatNumber(cumulativeEfficiency, 1) }} {{ efficiencyLabel }}
      </el-tag>
      <el-radio-group v-model="viewMode" class="view-toggle">
        <el-radio-button label="card">卡片</el-radio-button>
        <el-radio-button label="table">列表</el-radio-button>
      </el-radio-group>
    </div>

    <section class="soft-panel gas-market-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Weekly Fuel Outlook</p>
          <h3>本週油價與下週預測</h3>
        </div>
        <el-button text @click="loadGasMarket">重新整理</el-button>
      </div>

      <el-skeleton v-if="gasMarketLoading" :rows="3" animated />

      <div v-else-if="gasMarket" class="gas-market-grid">
        <article class="gas-market-card">
          <p class="metric-label">本週油價</p>
          <div class="metric-value">{{ gasMarket.weeklyOilPrice }}</div>
        </article>
        <article class="gas-market-card">
          <p class="metric-label">本週匯率</p>
          <div class="metric-value">{{ gasMarket.weeklyExchangeRate }}</div>
        </article>
        <article class="gas-market-card">
          <p class="metric-label">變動幅度</p>
          <div
            class="metric-value"
            :class="{
              'is-down': gasChangeDirection === 'down',
              'is-up': gasChangeDirection === 'up',
              'is-flat': gasChangeDirection === 'flat',
            }"
          >
            {{ gasMarket.changeRate }}
          </div>
        </article>
        <article class="gas-market-card gas-market-card--wide">
          <p class="metric-label">下週預計汽油每公升調整</p>
          <div class="gas-market-adjustment">{{ gasMarket.nextWeekGasolineAdjustment }}</div>
          <p class="gas-market-note">{{ gasMarket.nextWeekEffectiveDate }}</p>
        </article>
        <article class="gas-market-card gas-market-card--wide">
          <div class="price-board__header">
            <p class="metric-label">今日中油牌價</p>
            <span class="muted">每公升</span>
          </div>
          <div class="price-board">
            <div class="price-pill">
              <span>92</span>
              <strong>{{ gasMarket.cpc92 || '-' }}</strong>
            </div>
            <div class="price-pill">
              <span>95</span>
              <strong>{{ gasMarket.cpc95 || '-' }}</strong>
            </div>
            <div class="price-pill">
              <span>98</span>
              <strong>{{ gasMarket.cpc98 || '-' }}</strong>
            </div>
            <div class="price-pill price-pill--diesel">
              <span>柴油</span>
              <strong>{{ gasMarket.cpcDiesel || '-' }}</strong>
            </div>
          </div>
        </article>
      </div>

      <el-alert
        v-else-if="gasMarketError"
        type="warning"
        :closable="false"
        :title="gasMarketError"
        description="目前無法讀取油價網站資料，請稍後再試。"
      />

      <p v-if="gasMarket" class="gas-market-source muted">
        資料來源：
        <a :href="gasMarket.sourceUrl" target="_blank" rel="noreferrer">GoodLife 好生活油價預測</a>
        ・最後更新：{{ gasMarket.updatedAt || '未提供' }}
      </p>
    </section>

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
            <strong>{{ formatNumber(record.liters, 2) }}</strong>
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
      <el-table-column label="油量 / 電量" min-width="120">
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

.gas-market-panel {
  padding: 18px;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.panel-heading h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.gas-market-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 14px;
}

.gas-market-card {
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  border: 1px solid var(--ds-border);
}

.gas-market-card--wide {
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

.price-board__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.price-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.price-pill {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.price-pill--diesel {
  background: rgba(31, 41, 55, 0.06);
  border-color: rgba(31, 41, 55, 0.08);
}

.price-pill span {
  display: block;
  color: var(--ds-text-soft);
  font-size: 13px;
}

.price-pill strong {
  display: block;
  margin-top: 6px;
  font-size: 28px;
  line-height: 1;
  color: var(--ds-text);
}

.gas-market-adjustment {
  margin-top: 8px;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 700;
  line-height: 1.05;
  color: var(--ds-text);
}

.gas-market-note {
  margin: 8px 0 0;
  color: var(--ds-text-soft);
}

.gas-market-source {
  margin: 14px 0 0;
  font-size: 13px;
}

.gas-market-source a {
  color: var(--ds-primary);
}

.is-down {
  color: var(--ds-success);
}

.is-up {
  color: var(--ds-danger);
}

.is-flat {
  color: var(--ds-text);
}

@media (min-width: 961px) {
  .record-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .gas-market-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gas-market-card--wide {
    grid-column: 1 / -1;
  }

  .price-board {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .view-toggle {
    margin-left: 0;
  }
}
</style>
