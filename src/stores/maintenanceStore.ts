import { defineStore } from 'pinia'
import {
  createMaintenanceRecord,
  deleteMaintenanceRecord,
  fetchMaintenanceRecords,
  updateMaintenanceRecord,
} from '@/services/maintenanceService'
import type { MaintenanceInput, MaintenanceRecord } from '@/types/maintenance'
import { useAuthStore } from './authStore'

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    records: [] as MaintenanceRecord[],
    loading: false,
  }),
  actions: {
    getUid() {
      const authStore = useAuthStore()
      if (!authStore.user) throw new Error('尚未登入')
      return authStore.user.uid
    },
    async fetchAll() {
      this.loading = true
      try {
        this.records = await fetchMaintenanceRecords(this.getUid())
      } finally {
        this.loading = false
      }
    },
    async create(payload: MaintenanceInput) {
      await createMaintenanceRecord(this.getUid(), payload)
      await this.fetchAll()
    },
    async update(id: string, payload: MaintenanceInput) {
      await updateMaintenanceRecord(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteMaintenanceRecord(this.getUid(), id)
      await this.fetchAll()
    },
  },
})
