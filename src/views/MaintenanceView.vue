<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MaintenanceForm from '@/components/MaintenanceForm.vue'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { MaintenanceInput, MaintenanceRecord } from '@/types/maintenance'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

const maintenanceStore = useMaintenanceStore()
const vehicleStore = useVehicleStore()
const dialogVisible = ref(false)
const editingRecord = ref<MaintenanceRecord | null>(null)
const selectedVehicleId = ref('')
const dateRange = ref<[string, string] | null>(null)
const viewMode = ref<'card' | 'table'>('card')

const filteredRecords = computed(() =>
  maintenanceStore.records.filter((record) => {
    const matchesVehicle = !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value
    const matchesDate = !dateRange.value || (record.date >= dateRange.value[0] && record.date <= dateRange.value[1])
    return matchesVehicle && matchesDate
  }),
)

const vehicleNameMap = computed(
  () =>
    new Map(
      vehicleStore.vehicles.map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]),
    ),
)

function openCreate() {
  editingRecord.value = null
  dialogVisible.value = true
}

function openEdit(record: MaintenanceRecord) {
  editingRecord.value = record
  dialogVisible.value = true
}

async function submitRecord(payload: MaintenanceInput) {
  if (editingRecord.value) {
    await maintenanceStore.update(editingRecord.value.id, payload)
    ElMessage.success('保養紀錄已更新')
  } else {
    await maintenanceStore.create(payload)
    ElMessage.success('保養紀錄已新增')
  }

  await vehicleStore.fetchAll()
  dialogVisible.value = false
}

async function removeRecord(record: MaintenanceRecord) {
  await ElMessageBox.confirm(`確定刪除 ${record.item} 保養紀錄嗎？`, '刪除確認', { type: 'warning' })
  await maintenanceStore.remove(record.id)
  ElMessage.success('保養紀錄已刪除')
}

onMounted(async () => {
  await Promise.all([vehicleStore.fetchAll(), maintenanceStore.fetchAll()])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>保養紀錄</h1>
        <p>可依車輛與日期篩選，並自由切換卡片或列表顯示方式。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.vehicles.length" @click="openCreate">
        新增保養紀錄
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
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        start-placeholder="開始日期"
        end-placeholder="結束日期"
      />
      <el-radio-group v-model="viewMode" class="view-toggle">
        <el-radio-button label="card">卡片</el-radio-button>
        <el-radio-button label="table">列表</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="viewMode === 'card'" class="mobile-card-list maintenance-card-grid">
      <article v-for="record in filteredRecords" :key="record.id" class="mobile-record-card">
        <div class="mobile-record-card__top">
          <div>
            <p class="eyebrow">{{ vehicleNameMap.get(record.vehicleId) ?? '-' }}</p>
            <h3 class="mobile-record-card__title">{{ record.item }}</h3>
            <p class="mobile-record-card__subtitle">
              {{ formatDate(record.date) }} · {{ record.shopName || '未填寫保養廠 / 店家' }}
            </p>
          </div>
          <el-tag type="warning" round>{{ formatCurrency(record.cost) }}</el-tag>
        </div>

        <div class="mobile-record-card__meta">
          <div class="metric-chip">
            <strong>{{ formatNumber(record.mileage) }}</strong>
            <span>保養里程 km</span>
          </div>
        </div>

        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="openEdit(record)">編輯</el-button>
          <el-button class="secondary-cta" type="danger" plain @click="removeRecord(record)">刪除</el-button>
        </div>
      </article>
    </div>

    <el-table v-else :data="filteredRecords" class="glass-card desktop-table" stripe>
      <el-table-column label="日期" prop="date" min-width="120" sortable />
      <el-table-column label="車輛" min-width="160">
        <template #default="{ row }">{{ vehicleNameMap.get(row.vehicleId) ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="保養項目" prop="item" min-width="120" />
      <el-table-column label="里程" prop="mileage" min-width="100" sortable />
      <el-table-column label="金額" min-width="120">
        <template #default="{ row }">{{ formatCurrency(row.cost) }}</template>
      </el-table-column>
      <el-table-column label="保養廠 / 店家" prop="shopName" min-width="160" />
      <el-table-column label="操作" min-width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">編輯</el-button>
          <el-button size="small" type="danger" plain @click="removeRecord(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <MaintenanceForm
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
  .maintenance-card-grid {
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
