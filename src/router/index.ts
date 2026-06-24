import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { getFirebaseSetupHint, useAuthStore } from '@/stores/authStore'
import { pinia } from '@/stores'
import DashboardView from '@/views/DashboardView.vue'
import FuelView from '@/views/FuelView.vue'
import InsuranceView from '@/views/InsuranceView.vue'
import LoginView from '@/views/LoginView.vue'
import MaintenanceView from '@/views/MaintenanceView.vue'
import RemindersView from '@/views/RemindersView.vue'
import RepairsView from '@/views/RepairsView.vue'
import StatisticsView from '@/views/StatisticsView.vue'
import VehiclesView from '@/views/VehiclesView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: '/',
      component: AppLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'vehicles', name: 'vehicles', component: VehiclesView },
        { path: 'maintenance', name: 'maintenance', component: MaintenanceView },
        { path: 'repairs', name: 'repairs', component: RepairsView },
        { path: 'fuel', name: 'fuel', component: FuelView },
        { path: 'insurance', name: 'insurance', component: InsuranceView },
        { path: 'reminders', name: 'reminders', component: RemindersView },
        { path: 'statistics', name: 'statistics', component: StatisticsView },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)
  await authStore.initialize()

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined }
  }

  if (to.meta.requiresGuest && authStore.user) {
    return { name: 'dashboard' }
  }

  if (to.name !== 'login' && !getFirebaseSetupHint() && authStore.user) {
    return true
  }

  return true
})
