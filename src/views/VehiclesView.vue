<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VehicleForm from '@/components/VehicleForm.vue'
import VehicleImage from '@/components/VehicleImage.vue'
import {
  getVehicleFuelLabel,
  getVehicleTypeIcon,
  getVehicleTypeLabel,
} from '@/constants/vehicles'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { Vehicle, VehicleInput } from '@/types/vehicle'
import { formatDate, formatNumber } from '@/utils/format'
import { getInsuranceReminders, getInsuranceStatusLabel } from '@/utils/insurance'

const vehicleStore = useVehicleStore()
const insuranceStore = useInsuranceStore()
const dialogVisible = ref(false)
const editingVehicle = ref<Vehicle | null>(null)
const keyword = ref('')
const viewMode = ref<'card' | 'table'>('card')

const filteredVehicles = computed(() =>
  vehicleStore.vehicles.filter((vehicle) => {
    const text = [
      vehicle.brand,
      vehicle.model,
      vehicle.plateNumber,
      getVehicleTypeLabel(vehicle.vehicleType),
      getVehicleFuelLabel(vehicle.fuelType),
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(keyword.value.trim().toLowerCase())
  }),
)

const insuranceMap = computed(
  () =>
    new Map(
      vehicleStore.vehicles.map((vehicle) => [
        vehicle.id,
        getInsuranceReminders(insuranceStore.records.filter((record) => record.vehicleId === vehicle.id)),
      ]),
    ),
)

function openCreate() {
  editingVehicle.value = null
  dialogVisible.value = true
}

function openEdit(vehicle: Vehicle) {
  editingVehicle.value = vehicle
  dialogVisible.value = true
}

async function submitVehicle(payload: VehicleInput) {
  if (editingVehicle.value) {
    await vehicleStore.update(editingVehicle.value.id, payload)
    ElMessage.success('車輛資料已更新')
  } else {
    await vehicleStore.create(payload)
    ElMessage.success('車輛已新增')
  }
  dialogVisible.value = false
}

async function removeVehicle(vehicle: Vehicle) {
  await ElMessageBox.confirm(`確定要刪除 ${vehicle.plateNumber} 這台車輛嗎？`, '刪除車輛', { type: 'warning' })
  await vehicleStore.remove(vehicle.id)
  ElMessage.success('車輛已刪除')
}

onMounted(() => {
  vehicleStore.fetchAll()
  insuranceStore.fetchAll()
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>車輛管理</h1>
        <p>在同一個畫面管理汽車、機車與電動車，並直接查看每台車的全部保險狀態。</p>
      </div>
      <el-button type="warning" class="primary-cta" @click="openCreate">新增車輛</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜尋品牌、車型、車牌或車輛類型" clearable>
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-radio-group v-model="viewMode" class="view-toggle">
        <el-radio-button label="card">卡片</el-radio-button>
        <el-radio-button label="table">列表</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="viewMode === 'card'" class="mobile-card-list record-card-grid">
      <article v-for="vehicle in filteredVehicles" :key="vehicle.id" class="mobile-record-card">
        <div class="vehicle-card-media">
          <VehicleImage :src="vehicle.imageUrl" :alt="`${vehicle.brand} ${vehicle.model}`" variant="card" />
        </div>

        <div class="mobile-record-card__top">
          <div>
            <p class="eyebrow">{{ getVehicleTypeIcon(vehicle.vehicleType) }} {{ getVehicleTypeLabel(vehicle.vehicleType) }}</p>
            <h3 class="mobile-record-card__title">{{ vehicle.brand }} {{ vehicle.model }}</h3>
            <p class="mobile-record-card__subtitle">{{ vehicle.plateNumber }} · {{ getVehicleFuelLabel(vehicle.fuelType) }}</p>
          </div>
          <el-tag :type="vehicleStore.activeVehicleId === vehicle.id ? 'primary' : 'info'" round>
            {{ vehicleStore.activeVehicleId === vehicle.id ? '目前車輛' : '可切換' }}
          </el-tag>
        </div>

        <div class="mobile-record-card__meta">
          <div class="metric-chip">
            <strong>{{ formatNumber(vehicle.currentMileage) }}</strong>
            <span>目前里程 km</span>
          </div>
          <div class="metric-chip">
            <strong>{{ vehicle.year ?? '-' }}</strong>
            <span>年份</span>
          </div>
        </div>

        <div class="vehicle-insurance-block soft-panel">
          <p class="eyebrow">Insurance</p>
          <div v-if="insuranceMap.get(vehicle.id)?.length" class="vehicle-insurance-list">
            <div
              v-for="insurance in insuranceMap.get(vehicle.id)"
              :key="insurance.id"
              class="vehicle-insurance-item"
              :class="`vehicle-insurance-item--${insurance.status}`"
            >
              <div class="vehicle-insurance-item__head">
                <strong>{{ insurance.insuranceType }}</strong>
                <el-tag :type="insurance.status === 'overdue' ? 'danger' : insurance.status === 'warning' ? 'warning' : 'success'" round>
                  {{ getInsuranceStatusLabel(insurance) }}
                </el-tag>
              </div>
              <span>{{ insurance.companyName }}</span>
              <span>{{ formatDate(insurance.endDate) }}</span>
              <span>{{ insurance.remainingDays >= 0 ? `剩餘 ${insurance.remainingDays} 天` : `已過期 ${Math.abs(insurance.remainingDays)} 天` }}</span>
            </div>
          </div>
          <template v-else>
            <strong>尚無保險資料</strong>
            <span class="mobile-record-card__subtitle">可到保險管理頁為這台車新增多筆保險。</span>
          </template>
        </div>

        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="vehicleStore.chooseActiveVehicle(vehicle.id)">設為目前車輛</el-button>
          <div>
            <el-button class="secondary-cta" @click="openEdit(vehicle)">編輯</el-button>
            <el-button class="secondary-cta" type="danger" plain @click="removeVehicle(vehicle)">刪除</el-button>
          </div>
        </div>
      </article>
    </div>

    <el-table v-else :data="filteredVehicles" class="glass-card desktop-table" stripe>
      <el-table-column label="圖片" min-width="120">
        <template #default="{ row }">
          <VehicleImage :src="row.imageUrl" :alt="`${row.brand} ${row.model}`" variant="thumb" />
        </template>
      </el-table-column>
      <el-table-column label="車輛類型" min-width="130">
        <template #default="{ row }">
          {{ getVehicleTypeIcon(row.vehicleType) }} {{ getVehicleTypeLabel(row.vehicleType) }}
        </template>
      </el-table-column>
      <el-table-column label="車牌" prop="plateNumber" min-width="120" />
      <el-table-column label="品牌 / 車型" min-width="180">
        <template #default="{ row }">
          {{ row.brand }} {{ row.model }}
        </template>
      </el-table-column>
      <el-table-column label="燃料類型" min-width="120">
        <template #default="{ row }">{{ getVehicleFuelLabel(row.fuelType) }}</template>
      </el-table-column>
      <el-table-column label="里程" min-width="120">
        <template #default="{ row }">{{ formatNumber(row.currentMileage) }} km</template>
      </el-table-column>
      <el-table-column label="年份" prop="year" min-width="90" />
      <el-table-column label="保險" min-width="260">
        <template #default="{ row }">
          <div v-if="insuranceMap.get(row.id)?.length" class="table-insurance-list">
            <div v-for="insurance in insuranceMap.get(row.id)" :key="insurance.id" class="table-insurance-item">
              <strong>{{ insurance.insuranceType }}</strong>
              <span>{{ insurance.companyName }}</span>
              <span>{{ formatDate(insurance.endDate) }}</span>
            </div>
          </div>
          <span v-else class="muted">尚無保險資料</span>
        </template>
      </el-table-column>
      <el-table-column label="目前車輛" min-width="120">
        <template #default="{ row }">
          <el-switch :model-value="vehicleStore.activeVehicleId === row.id" @change="vehicleStore.chooseActiveVehicle(row.id)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">編輯</el-button>
          <el-button size="small" type="danger" plain @click="removeVehicle(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <VehicleForm
      v-model="dialogVisible"
      :editing-vehicle="editingVehicle"
      @submit="submitVehicle"
    />
  </section>
</template>

<style scoped>
.view-toggle {
  margin-left: auto;
}

.vehicle-card-media {
  margin: -2px -2px 14px;
}

.vehicle-insurance-block {
  margin: 20px 0 0 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vehicle-insurance-list,
.table-insurance-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vehicle-insurance-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 18px;
  background: #ffffff;
}

.vehicle-insurance-item--warning {
  background: rgba(230, 162, 60, 0.1);
}

.vehicle-insurance-item--overdue {
  background: rgba(245, 108, 108, 0.1);
}

.vehicle-insurance-item--normal {
  background: rgba(103, 194, 58, 0.08);
}

.vehicle-insurance-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-insurance-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
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
