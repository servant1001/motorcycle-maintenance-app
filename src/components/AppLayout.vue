<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AIAssistantFab from '@/components/ai/AIAssistantFab.vue'
import VehicleImage from '@/components/VehicleImage.vue'
import { getVehicleTypeIcon, getVehicleTypeLabel } from '@/constants/vehicles'
import { useAuthStore } from '@/stores/authStore'
import { useFuelStore } from '@/stores/fuelStore'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useReminderStore } from '@/stores/reminderStore'
import { useRepairStore } from '@/stores/repairStore'
import { useVehicleStore } from '@/stores/vehicleStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const vehicleStore = useVehicleStore()
const maintenanceStore = useMaintenanceStore()
const repairStore = useRepairStore()
const fuelStore = useFuelStore()
const insuranceStore = useInsuranceStore()
const reminderStore = useReminderStore()

const drawerOpen = ref(false)

const navigationItems = [
  { label: '儀表板', routeName: 'dashboard', icon: 'DataBoard' },
  { label: 'AI 顧問', routeName: 'ai', icon: 'ChatDotRound' },
  { label: '車輛', routeName: 'vehicles', icon: 'Van' },
  { label: '保養', routeName: 'maintenance', icon: 'Tools' },
  { label: '維修', routeName: 'repairs', icon: 'SetUp' },
  { label: '能源', routeName: 'fuel', icon: 'Coin' },
  { label: '保險', routeName: 'insurance', icon: 'Checked' },
  { label: '提醒', routeName: 'reminders', icon: 'Bell' },
  { label: '統計', routeName: 'statistics', icon: 'PieChart' },
]

const activeMenu = computed(() => String(route.name ?? 'dashboard'))
const mobileItems = computed(() => navigationItems.slice(0, 6))

async function bootstrapData() {
  if (!authStore.user) return

  await Promise.all([
    vehicleStore.fetchAll(),
    maintenanceStore.fetchAll(),
    repairStore.fetchAll(),
    fuelStore.fetchAll(),
    insuranceStore.fetchAll(),
  ])

  await reminderStore.fetchAll()
}

async function handleLogout() {
  await authStore.logout()
  await router.push({ name: 'login' })
}

function navigate(routeName: string) {
  drawerOpen.value = false
  router.push({ name: routeName })
}

onMounted(async () => {
  await bootstrapData()
})
</script>

<template>
  <div class="layout-shell">
    <aside class="sidebar">
      <div class="brand dark-surface">
        <img class="brand-mark" src="/driveone-logo.png" alt="DriveOne logo" />
        <div>
          <h2>DriveOne</h2>
          <p>汽機車生活管理平台</p>
        </div>
      </div>

      <el-menu :default-active="activeMenu" class="sidebar-menu app-surface">
        <el-menu-item
          v-for="item in navigationItems"
          :key="item.routeName"
          :index="item.routeName"
          @click="navigate(item.routeName)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer app-surface">
        <div class="sidebar-footer__image-wrap">
          <VehicleImage :src="vehicleStore.activeVehicle?.imageUrl" :alt="vehicleStore.activeVehicle?.model" variant="card" />
        </div>
        <p class="eyebrow">目前車輛</p>
        <strong>{{ vehicleStore.activeVehicle ? `${vehicleStore.activeVehicle.brand} ${vehicleStore.activeVehicle.model}` : '尚未選擇車輛' }}</strong>
        <span class="muted">
          {{ vehicleStore.activeVehicle ? `${getVehicleTypeIcon(vehicleStore.activeVehicle.vehicleType)} ${getVehicleTypeLabel(vehicleStore.activeVehicle.vehicleType)} · ${vehicleStore.activeVehicle.plateNumber}` : '新增車輛後即可在這裡查看主要車輛資訊。' }}
        </span>
      </div>
    </aside>

    <div class="layout-main">
      <header class="topbar hero-surface">
        <div class="topbar-left">
          <el-button class="mobile-menu secondary-cta" circle plain @click="drawerOpen = true">
            <el-icon><Menu /></el-icon>
          </el-button>
          <div>
            <p class="eyebrow">DriveOne Mobility Platform</p>
            <h1>{{ authStore.displayName }}</h1>
            <p class="muted">管理車輛、保養、維修、能源、保險與 AI 顧問分析。</p>
          </div>
        </div>

        <div class="topbar-actions">
          <div v-if="vehicleStore.activeVehicle" class="topbar-vehicle app-surface">
            <span class="eyebrow">Primary Vehicle</span>
            <strong>{{ vehicleStore.activeVehicle.plateNumber }}</strong>
            <small>{{ getVehicleTypeIcon(vehicleStore.activeVehicle.vehicleType) }} {{ getVehicleTypeLabel(vehicleStore.activeVehicle.vehicleType) }}</small>
          </div>
          <el-button plain class="secondary-cta" @click="handleLogout">登出</el-button>
        </div>
      </header>

      <main>
        <router-view />
      </main>
    </div>

    <el-drawer v-model="drawerOpen" direction="ltr" size="80%">
      <template #header>
        <strong>快速導覽</strong>
      </template>
      <div class="drawer-nav">
        <el-button
          v-for="item in navigationItems"
          :key="item.routeName"
          text
          class="drawer-link"
          @click="navigate(item.routeName)"
        >
          {{ item.label }}
        </el-button>
      </div>
    </el-drawer>

    <nav class="mobile-bottom-nav app-surface">
      <button
        v-for="item in mobileItems"
        :key="item.routeName"
        class="mobile-bottom-nav__item"
        :class="{ 'is-active': activeMenu === item.routeName }"
        @click="navigate(item.routeName)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <AIAssistantFab />
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: block;
  padding: 12px 12px 88px;
}

.sidebar {
  display: none;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 28px rgba(2, 8, 23, 0.24);
}

.brand h2,
.brand p,
.topbar h1,
.topbar p {
  margin: 0;
}

.brand h2 {
  font-size: 22px;
}

.brand p {
  color: rgba(255, 255, 255, 0.72);
}

.sidebar-menu {
  border: none;
  padding: 14px 10px;
}

.sidebar-footer {
  padding: 16px 18px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-footer__image-wrap {
  margin-bottom: 6px;
}

.layout-main {
  min-width: 0;
}

.topbar {
  margin-bottom: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.topbar-left,
.topbar-actions {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 12px;
}

.topbar h1 {
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.topbar-left {
  justify-content: space-between;
}

.topbar-actions {
  justify-content: space-between;
  align-items: center;
}

.topbar-vehicle {
  padding: 12px 14px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar-vehicle small {
  color: var(--ds-text-soft);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-link {
  justify-content: flex-start;
}

.mobile-bottom-nav {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 26px;
}

.mobile-bottom-nav__item {
  border: none;
  background: transparent;
  padding: 10px 4px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--ds-text-soft);
}

.mobile-bottom-nav__item span {
  font-size: 11px;
}

.mobile-bottom-nav__item.is-active {
  background: rgba(64, 158, 255, 0.12);
  color: var(--ds-primary-deep);
}

@media (min-width: 961px) {
  .layout-shell {
    display: grid;
    grid-template-columns: 292px 1fr;
    gap: 18px;
    padding: 18px;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: sticky;
    top: 18px;
    height: calc(100vh - 36px);
  }

  .sidebar-footer {
    margin-top: auto;
  }

  .topbar {
    padding: 22px 24px;
    margin-bottom: 18px;
    flex-direction: row;
    justify-content: space-between;
  }

  .topbar-left,
  .topbar-actions {
    width: auto;
    align-items: center;
  }

  .mobile-menu,
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
