<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VehicleForm from '@/components/VehicleForm.vue'
import VehicleImage from '@/components/VehicleImage.vue'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { Vehicle, VehicleInput } from '@/types/vehicle'
import { formatNumber } from '@/utils/format'
import { getInsuranceStatusLabel, getNearestInsurance } from '@/utils/insurance'

const vehicleStore = useVehicleStore()
const insuranceStore = useInsuranceStore()
const dialogVisible = ref(false)
const editingVehicle = ref<Vehicle | null>(null)
const keyword = ref('')

const filteredVehicles = computed(() =>
  vehicleStore.vehicles.filter((vehicle) => {
    const text = `${vehicle.brand} ${vehicle.model} ${vehicle.plateNumber}`.toLowerCase()
    return text.includes(keyword.value.trim().toLowerCase())
  }),
)

const nearestInsuranceMap = computed(
  () =>
    new Map(
      vehicleStore.vehicles.map((vehicle) => [
        vehicle.id,
        getNearestInsurance(insuranceStore.records.filter((record) => record.vehicleId === vehicle.id)),
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
    ElMessage.success('機車資料已更新')
  } else {
    await vehicleStore.create(payload)
    ElMessage.success('機車已新增')
  }
  dialogVisible.value = false
}

async function removeVehicle(vehicle: Vehicle) {
  await ElMessageBox.confirm(`確定刪除 ${vehicle.plateNumber} 嗎？`, '刪除確認', { type: 'warning' })
  await vehicleStore.remove(vehicle.id)
  ElMessage.success('機車已刪除')
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
        <h1>機車管理</h1>
        <p>管理你的車輛清單，並指定目前主要使用的車輛。</p>
      </div>
      <el-button type="warning" class="primary-cta" @click="openCreate">新增機車</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜尋品牌 / 車型 / 車牌" clearable>
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div class="mobile-only mobile-card-list">
      <article v-for="vehicle in filteredVehicles" :key="vehicle.id" class="mobile-record-card">
        <div class="vehicle-card-media">
          <VehicleImage :src="vehicle.imageUrl" :alt="`${vehicle.brand} ${vehicle.model}`" variant="card" />
        </div>
        <div class="mobile-record-card__top">
          <div>
            <p class="eyebrow">{{ vehicle.brand }}</p>
            <h3 class="mobile-record-card__title">{{ vehicle.model }}</h3>
            <p class="mobile-record-card__subtitle">{{ vehicle.plateNumber }}</p>
          </div>
          <el-tag :type="vehicleStore.activeVehicleId === vehicle.id ? 'primary' : 'info'" round>
            {{ vehicleStore.activeVehicleId === vehicle.id ? '主要車輛' : '一般車輛' }}
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
          <template v-if="nearestInsuranceMap.get(vehicle.id)">
            <p class="eyebrow">Insurance</p>
            <strong>{{ nearestInsuranceMap.get(vehicle.id)?.insuranceType }}</strong>
            <span class="mobile-record-card__subtitle">
              {{ nearestInsuranceMap.get(vehicle.id)?.companyName }} ·
              {{ nearestInsuranceMap.get(vehicle.id)?.remainingDays! >= 0
                ? `剩餘 ${nearestInsuranceMap.get(vehicle.id)?.remainingDays} 天`
                : `已過期 ${Math.abs(nearestInsuranceMap.get(vehicle.id)?.remainingDays ?? 0)} 天` }}
            </span>
            <el-tag
              :type="nearestInsuranceMap.get(vehicle.id)?.status === 'overdue' ? 'danger' : nearestInsuranceMap.get(vehicle.id)?.status === 'warning' ? 'warning' : 'success'"
              round
            >
              {{ getInsuranceStatusLabel(nearestInsuranceMap.get(vehicle.id)!) }}
            </el-tag>
          </template>
          <template v-else>
            <p class="eyebrow">Insurance</p>
            <strong>尚未建立保險</strong>
            <span class="mobile-record-card__subtitle">建議補上強制險與第三責任險資料</span>
          </template>
        </div>

        <div class="mobile-record-card__actions">
          <el-button class="secondary-cta" @click="vehicleStore.chooseActiveVehicle(vehicle.id)">設為主要</el-button>
          <div>
            <el-button class="secondary-cta" @click="openEdit(vehicle)">編輯</el-button>
            <el-button class="secondary-cta" type="danger" plain @click="removeVehicle(vehicle)">刪除</el-button>
          </div>
        </div>
      </article>
    </div>

    <el-table :data="filteredVehicles" class="glass-card desktop-table desktop-only" stripe>
      <el-table-column label="圖片" min-width="120">
        <template #default="{ row }">
          <VehicleImage :src="row.imageUrl" :alt="`${row.brand} ${row.model}`" variant="thumb" />
        </template>
      </el-table-column>
      <el-table-column label="車牌" prop="plateNumber" min-width="120" />
      <el-table-column label="品牌 / 車型" min-width="180">
        <template #default="{ row }">
          {{ row.brand }} {{ row.model }}
        </template>
      </el-table-column>
      <el-table-column label="里程" min-width="120">
        <template #default="{ row }">{{ formatNumber(row.currentMileage) }} km</template>
      </el-table-column>
      <el-table-column label="年份" prop="year" min-width="90" />
      <el-table-column label="保險" min-width="180">
        <template #default="{ row }">
          <div v-if="nearestInsuranceMap.get(row.id)" class="table-insurance-summary">
            <strong>{{ nearestInsuranceMap.get(row.id)?.insuranceType }}</strong>
            <span>{{ nearestInsuranceMap.get(row.id)?.companyName }}</span>
          </div>
          <span v-else class="muted">尚未建立</span>
        </template>
      </el-table-column>
      <el-table-column label="主要車輛" min-width="120">
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
.vehicle-card-media {
  margin: -2px -2px 14px;
}

.vehicle-insurance-block {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.table-insurance-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
