import { defineStore } from 'pinia'
import { createRepairRecord, deleteRepairRecord, fetchRepairRecords, updateRepairRecord } from '@/services/repairService'
import type { RepairInput, RepairRecord } from '@/types/repair'
import { useAuthStore } from './authStore'

export const useRepairStore = defineStore('repair', {
  state: () => ({
    records: [] as RepairRecord[],
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
        this.records = await fetchRepairRecords(this.getUid())
      } finally {
        this.loading = false
      }
    },
    async create(payload: RepairInput) {
      await createRepairRecord(this.getUid(), payload)
      await this.fetchAll()
    },
    async update(id: string, payload: RepairInput) {
      await updateRepairRecord(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteRepairRecord(this.getUid(), id)
      await this.fetchAll()
    },
  },
})
