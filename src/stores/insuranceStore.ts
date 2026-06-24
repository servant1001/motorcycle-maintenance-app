import { defineStore } from 'pinia'
import {
  createInsuranceRecord,
  deleteInsuranceRecord,
  fetchInsuranceRecords,
  updateInsuranceRecord,
} from '@/services/insuranceService'
import type { InsuranceInput, InsuranceRecord } from '@/types/insurance'
import { useAuthStore } from './authStore'

export const useInsuranceStore = defineStore('insurance', {
  state: () => ({
    records: [] as InsuranceRecord[],
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
        this.records = await fetchInsuranceRecords(this.getUid())
      } finally {
        this.loading = false
      }
    },
    async create(payload: InsuranceInput) {
      await createInsuranceRecord(this.getUid(), payload)
      await this.fetchAll()
    },
    async update(id: string, payload: InsuranceInput) {
      await updateInsuranceRecord(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteInsuranceRecord(this.getUid(), id)
      await this.fetchAll()
    },
  },
})
