import { defineStore } from 'pinia'
import { createFuelRecord, deleteFuelRecord, fetchFuelRecords, updateFuelRecord } from '@/services/fuelService'
import type { FuelInput, FuelRecord } from '@/types/fuel'
import { useAuthStore } from './authStore'

export const useFuelStore = defineStore('fuel', {
  state: () => ({
    records: [] as FuelRecord[],
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
        this.records = await fetchFuelRecords(this.getUid())
      } finally {
        this.loading = false
      }
    },
    async create(payload: FuelInput) {
      await createFuelRecord(this.getUid(), payload)
      await this.fetchAll()
    },
    async update(id: string, payload: FuelInput) {
      await updateFuelRecord(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteFuelRecord(this.getUid(), id)
      await this.fetchAll()
    },
  },
})
