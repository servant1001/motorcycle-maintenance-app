import { defineStore } from 'pinia'
import {
  createMaintenanceRule,
  deleteMaintenanceRule,
  fetchMaintenanceRules,
  seedDefaultMaintenanceRules,
  updateMaintenanceRule,
} from '@/services/reminderService'
import type { MaintenanceRule, MaintenanceRuleInput, ReminderSummary } from '@/types/reminder'
import { useAuthStore } from './authStore'
import { useVehicleStore } from './vehicleStore'

function buildReminderSummary(rule: MaintenanceRule, currentMileage: number): ReminderSummary {
  const remainingKm = rule.nextMileage - currentMileage
  const status = remainingKm < 0 ? 'overdue' : remainingKm <= 300 ? 'warning' : 'normal'
  return { ...rule, remainingKm, status }
}

export const useReminderStore = defineStore('reminders', {
  state: () => ({
    rules: [] as MaintenanceRule[],
    loading: false,
  }),
  getters: {
    activeVehicleRules(state) {
      const vehicleStore = useVehicleStore()
      if (!vehicleStore.activeVehicleId) return []
      return state.rules.filter((rule) => rule.vehicleId === vehicleStore.activeVehicleId)
    },
    activeVehicleSummaries(): ReminderSummary[] {
      const vehicleStore = useVehicleStore()
      if (!vehicleStore.activeVehicle) return []
      return this.activeVehicleRules
        .filter((rule) => rule.isEnabled)
        .map((rule) => buildReminderSummary(rule, vehicleStore.activeVehicle!.currentMileage))
        .sort((a, b) => a.remainingKm - b.remainingKm)
    },
  },
  actions: {
    getUid() {
      const authStore = useAuthStore()
      if (!authStore.user) throw new Error('尚未登入')
      return authStore.user.uid
    },
    async fetchAll() {
      this.loading = true
      try {
        this.rules = await fetchMaintenanceRules(this.getUid())
        const vehicleStore = useVehicleStore()
        if (vehicleStore.activeVehicle) {
          await seedDefaultMaintenanceRules(this.getUid(), vehicleStore.activeVehicle)
          this.rules = await fetchMaintenanceRules(this.getUid())
        }
      } finally {
        this.loading = false
      }
    },
    async create(payload: MaintenanceRuleInput) {
      await createMaintenanceRule(this.getUid(), payload)
      await this.fetchAll()
    },
    async update(id: string, payload: MaintenanceRuleInput) {
      await updateMaintenanceRule(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteMaintenanceRule(this.getUid(), id)
      await this.fetchAll()
    },
  },
})
