<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import InsuranceForm from '@/components/InsuranceForm.vue'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { InsuranceInput, InsuranceRecord } from '@/types/insurance'
import { buildInsuranceReminder, getInsuranceStatusLabel } from '@/utils/insurance'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

const insuranceStore = useInsuranceStore()
const vehicleStore = useVehicleStore()
const dialogVisible = ref(false)
const editingRecord = ref<InsuranceRecord | null>(null)
const selectedVehicleId = ref('')
const statusFilter = ref<'all' | 'normal' | 'warning' | 'overdue'>('all')
const viewMode = ref<'card' | 'table'>('card')

const vehicleNameMap = computed(
  () => new Map(vehicleStore.vehicles.map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`])),
)

const filteredRecords = computed(() =>
  insuranceStore.records
    .map((record) => buildInsuranceReminder(record))
    .filter((record) => {
      const matchesVehicle = !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value
      const matchesStatus = statusFilter.value === 'all' || record.status === statusFilter.value
      return matchesVehicle && matchesStatus
    }),
)

function openCreate() {
  editingRecord.value = null
  dialogVisible.value = true
}

function openEdit(record: InsuranceRecord) {
  editingRecord.value = record
  dialogVisible.value = true
}

async function submitRecord(payload: InsuranceInput) {
  if (editingRecord.value) {
    await insuranceStore.update(editingRecord.value.id, payload)
    ElMessage.success('保險紀錄已更新')
  } else {
    await insuranceStore.create(payload)
    ElMessage.success('保險紀錄已新增')
  }
  dialogVisible.value = false
}

async function removeRecord(record: InsuranceRecord) {
  await ElMessageBox.confirm(`確定刪除保單 ${record.policyNumber} 嗎？`, '刪除確認', { type: 'warning' })
  await insuranceStore.remove(record.id)
  ElMessage.success('保險紀錄已刪除')
}

onMounted(async () => {
  await Promise.all([vehicleStore.fetchAll(), insuranceStore.fetchAll()])
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>保險管理</h1>
        <p>管理每台車輛的保單資訊，並自由切換卡片或列表顯示方式。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.vehicles.length" @click="openCreate">
        新增保險
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
      <el-select v-model="statusFilter">
        <el-option label="全部狀態" value="all" />
        <el-option label="有效" value="normal" />
        <el-option label="即將到期" value="warning" />
        <el-option label="已過期" value="overdue" />
      </el-select>
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
            <h3 class="mobile-record-card__title">{{ record.insuranceType }}</h3>
            <p class="mobile-record-card__subtitle">{{ record.companyName }} · {{ record.policyNumber }}</p>
          </div>
          <el-tag :type="record.status === 'overdue' ? 'danger' : record.status === 'warning' ? 'warning' : 'success'" round>
            {{ getInsuranceStatusLabel(record) }}
          </el-tag>
        </div>

        <div class="mobile-record-card__meta">
          <div class="metric-chip">
            <strong>{{ record.remainingDays >= 0 ? record.remainingDays : Math.abs(record.remainingDays) }}</strong>
            <span>{{ record.remainingDays >= 0 ? '剩餘天數' : '已逾期天數' }}</span>
          </div>
          <div class="metric-chip">
            <strong>{{ formatDate(record.endDate) }}</strong>
            <span>到期日</span>
          </div>
        </div>

        <div class="mobile-record-card__subtitle insurance-mobile-extra">
          保費 {{ formatCurrency(record.premium) }} · 保障額度 {{ formatNumber(record.coverageAmount) }}
        </div>

        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="openEdit(record)">編輯</el-button>
          <el-button class="secondary-cta" type="danger" plain @click="removeRecord(record)">刪除</el-button>
        </div>
      </article>
    </div>

    <el-table v-else :data="filteredRecords" class="glass-card desktop-table" stripe>
      <el-table-column label="車輛" min-width="160">
        <template #default="{ row }">{{ vehicleNameMap.get(row.vehicleId) ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="保險類型" prop="insuranceType" min-width="130" />
      <el-table-column label="保險公司" prop="companyName" min-width="140" />
      <el-table-column label="到期日" min-width="120">
        <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
      </el-table-column>
      <el-table-column label="剩餘天數" min-width="110">
        <template #default="{ row }">{{ row.remainingDays }}</template>
      </el-table-column>
      <el-table-column label="狀態" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'overdue' ? 'danger' : row.status === 'warning' ? 'warning' : 'success'" round>
            {{ getInsuranceStatusLabel(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="保費" min-width="120">
        <template #default="{ row }">{{ formatCurrency(row.premium) }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">編輯</el-button>
          <el-button size="small" type="danger" plain @click="removeRecord(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <InsuranceForm
      v-model="dialogVisible"
      :editing-record="editingRecord"
      :vehicle-options="vehicleStore.vehicleOptions"
      @submit="submitRecord"
    />
  </section>
</template>

<style scoped>
.insurance-mobile-extra {
  margin-top: 12px;
}

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
