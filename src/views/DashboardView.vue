<script setup lang="ts">
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import ReminderCard from '@/components/ReminderCard.vue'
import VehicleImage from '@/components/VehicleImage.vue'
import {
  getEnergyEfficiencyLabel,
  getVehicleTypeIcon,
  getVehicleTypeLabel,
} from '@/constants/vehicles'
import { useFuelStore } from '@/stores/fuelStore'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useReminderStore } from '@/stores/reminderStore'
import { useRepairStore } from '@/stores/repairStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { getAverageFuelEfficiency } from '@/utils/fuel'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'
import { getInsuranceStatusLabel, getNearestInsurance } from '@/utils/insurance'

const vehicleStore = useVehicleStore()
const maintenanceStore = useMaintenanceStore()
const repairStore = useRepairStore()
const fuelStore = useFuelStore()
const insuranceStore = useInsuranceStore()
const reminderStore = useReminderStore()

const activeVehicleId = computed(() => vehicleStore.activeVehicleId)
const activeVehicle = computed(() => vehicleStore.activeVehicle)

const activeMaintenance = computed(() =>
  maintenanceStore.records.filter((record) => record.vehicleId === activeVehicleId.value),
)
const activeRepairs = computed(() => repairStore.records.filter((record) => record.vehicleId === activeVehicleId.value))
const activeFuel = computed(() => fuelStore.records.filter((record) => record.vehicleId === activeVehicleId.value))
const activeInsurance = computed(() =>
  insuranceStore.records.filter((record) => record.vehicleId === activeVehicleId.value),
)

function getRecordCost(record: { cost?: number; amount?: number }) {
  return record.cost ?? record.amount ?? 0
}

const monthCost = computed(() => {
  const currentMonth = dayjs().format('YYYY-MM')
  return [...activeMaintenance.value, ...activeRepairs.value, ...activeFuel.value]
    .filter((record) => record.date.startsWith(currentMonth))
    .reduce((sum, record) => sum + getRecordCost(record), 0)
})

const yearCost = computed(() => {
  const currentYear = dayjs().format('YYYY')
  return [...activeMaintenance.value, ...activeRepairs.value, ...activeFuel.value]
    .filter((record) => record.date.startsWith(currentYear))
    .reduce((sum, record) => sum + getRecordCost(record), 0)
})

const averageFuelEfficiency = computed(() => getAverageFuelEfficiency(activeFuel.value))
const latestMaintenance = computed(() => activeMaintenance.value[0] ?? null)
const latestRepair = computed(() => activeRepairs.value[0] ?? null)
const nearestInsurance = computed(() => getNearestInsurance(activeInsurance.value))
const heroReminder = computed(() => reminderStore.activeVehicleSummaries[0] ?? null)
const heroVehicleTitle = computed(() =>
  activeVehicle.value ? `${activeVehicle.value.brand} ${activeVehicle.value.model}` : '尚未設定主要車輛',
)

const statCards = computed(() => [
  {
    label: '目前里程',
    value: activeVehicle.value ? `${formatNumber(activeVehicle.value.currentMileage)} km` : '-',
  },
  {
    label: '本月花費',
    value: formatCurrency(monthCost.value),
  },
  {
    label: '年度花費',
    value: formatCurrency(yearCost.value),
  },
  {
    label: '平均效率',
    value: averageFuelEfficiency.value
      ? `${formatNumber(averageFuelEfficiency.value, 1)} ${getEnergyEfficiencyLabel(activeVehicle.value?.vehicleType)}`
      : '尚無資料',
  },
  {
    label: '最近一次保養',
    value: latestMaintenance.value ? `${latestMaintenance.value.item} / ${formatDate(latestMaintenance.value.date)}` : '尚未建立',
  },
  {
    label: '保險狀態',
    value: nearestInsurance.value ? `${nearestInsurance.value.insuranceType} / ${getInsuranceStatusLabel(nearestInsurance.value)}` : '尚未建立',
  },
])

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchAll(),
    maintenanceStore.fetchAll(),
    repairStore.fetchAll(),
    fuelStore.fetchAll(),
    insuranceStore.fetchAll(),
  ])
  await reminderStore.fetchAll()
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>以車輛為中心整合保養、維修、能源與保險資訊，手機上也能快速掌握狀態。</p>
      </div>
    </div>

    <section class="hero-card dark-surface">
      <div class="hero-card__content">
        <div class="hero-card__summary">
          <p class="eyebrow">我的車輛</p>
          <div class="hero-card__type-row">
            <span class="hero-card__type-icon">{{ getVehicleTypeIcon(activeVehicle?.vehicleType) }}</span>
            <span class="hero-card__type-label">{{ getVehicleTypeLabel(activeVehicle?.vehicleType) }}</span>
          </div>
          <h2>{{ heroVehicleTitle }}</h2>
          <p class="hero-card__plate">
            {{ activeVehicle?.plateNumber ?? '先到車輛管理新增一台車，並設定為主要車輛。' }}
          </p>

          <div class="hero-card__media mobile-only">
            <VehicleImage :src="activeVehicle?.imageUrl" :alt="heroVehicleTitle" variant="hero" />
          </div>
        </div>

        <div class="hero-card__aside">
          <div class="hero-card__media desktop-only">
            <VehicleImage :src="activeVehicle?.imageUrl" :alt="heroVehicleTitle" variant="hero" />
          </div>

          <div class="hero-card__stats">
            <div class="hero-stat">
              <span>目前里程</span>
              <strong>{{ activeVehicle ? formatNumber(activeVehicle.currentMileage) : '--' }}</strong>
              <small>km</small>
            </div>
            <div class="hero-stat hero-stat--soft">
              <span>下一個提醒</span>
              <strong>{{ heroReminder ? heroReminder.item : '尚未建立' }}</strong>
              <small>{{ heroReminder ? `${formatNumber(heroReminder.remainingKm)} km` : '建立提醒規則後會顯示' }}</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid-cards">
      <article v-for="card in statCards" :key="card.label" class="soft-panel stat-card">
        <p class="metric-label">{{ card.label }}</p>
        <div class="metric-value">{{ card.value }}</div>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="soft-panel dashboard-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Expense Overview</p>
            <h3>支出概覽</h3>
          </div>
        </div>
        <div class="section-stack">
          <div class="insight-line">
            <p class="metric-label">最近一次保養</p>
            <div class="record-line">
              <strong>{{ latestMaintenance ? latestMaintenance.item : '尚無資料' }}</strong>
              <span class="muted">
                {{ latestMaintenance ? `${formatDate(latestMaintenance.date)} / ${formatCurrency(latestMaintenance.cost)}` : '' }}
              </span>
            </div>
          </div>
          <div class="insight-line">
            <p class="metric-label">最近一次維修</p>
            <div class="record-line">
              <strong>{{ latestRepair ? latestRepair.problem : '尚無資料' }}</strong>
              <span class="muted">
                {{ latestRepair ? `${formatDate(latestRepair.date)} / ${formatCurrency(latestRepair.cost)}` : '' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="soft-panel dashboard-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Insurance Status</p>
            <h3>保險狀態</h3>
          </div>
        </div>
        <div v-if="nearestInsurance" class="insurance-card" :class="`insurance-card--${nearestInsurance.status}`">
          <p class="metric-label">保險狀態</p>
          <strong>{{ nearestInsurance.insuranceType }}</strong>
          <span>{{ nearestInsurance.companyName }}</span>
          <span>到期日：{{ formatDate(nearestInsurance.endDate) }}</span>
          <span>
            {{ nearestInsurance.remainingDays >= 0 ? `剩餘 ${nearestInsurance.remainingDays} 天` : `已過期 ${Math.abs(nearestInsurance.remainingDays)} 天` }}
          </span>
          <el-tag :type="nearestInsurance.status === 'overdue' ? 'danger' : nearestInsurance.status === 'warning' ? 'warning' : 'success'" round>
            狀態：{{ getInsuranceStatusLabel(nearestInsurance) }}
          </el-tag>
        </div>
        <el-empty v-else description="尚未建立保險資料" />
      </section>

      <section class="soft-panel dashboard-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Maintenance Signals</p>
            <h3>保養提醒</h3>
          </div>
        </div>
        <div v-if="reminderStore.activeVehicleSummaries.length" class="reminder-stack">
          <ReminderCard v-for="reminder in reminderStore.activeVehicleSummaries.slice(0, 3)" :key="reminder.id" :reminder="reminder" />
        </div>
        <el-empty v-else description="新增車輛後，再設定保養提醒規則" />
      </section>
    </div>
  </section>
</template>

<style scoped>
.hero-card {
  padding: 22px;
}

.hero-card__content {
  display: grid;
  gap: 22px;
}

.hero-card__summary,
.hero-card__aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card h2 {
  margin: 8px 0 0;
  font-size: clamp(28px, 4.4vw, 44px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero-card__plate {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
}

.hero-card__type-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.hero-card__type-icon {
  font-size: 20px;
}

.hero-card__type-label {
  color: rgba(255, 255, 255, 0.78);
}

.hero-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-card__media {
  border-radius: 24px;
}

.hero-stat {
  border-radius: 22px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.12);
}

.hero-stat--soft {
  background: rgba(255, 255, 255, 0.08);
}

.hero-stat span,
.hero-stat small {
  display: block;
  color: rgba(255, 255, 255, 0.72);
}

.hero-stat strong {
  display: block;
  margin-top: 8px;
  font-size: 26px;
  line-height: 1.1;
}

.dashboard-grid {
  display: grid;
  gap: 16px;
}

.stat-card {
  padding: 18px;
}

.dashboard-panel {
  padding: 18px;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.panel-heading h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.insight-line {
  padding: 16px;
  border-radius: 20px;
  background: #f8fafc;
}

.insurance-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 24px;
  background: #f8fafc;
}

.insurance-card strong {
  font-size: 28px;
  line-height: 1.05;
}

.insurance-card span {
  color: var(--ds-text-soft);
}

.insurance-card--warning {
  background: rgba(230, 162, 60, 0.1);
}

.insurance-card--overdue {
  background: rgba(245, 108, 108, 0.1);
}

.insurance-card--normal {
  background: rgba(103, 194, 58, 0.08);
}

.record-line {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.reminder-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 961px) {
  .hero-card__content {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: stretch;
  }

  .dashboard-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-card__stats {
    grid-template-columns: 1fr;
  }
}
</style>
