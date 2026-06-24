import { defineStore } from 'pinia'
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  setActiveVehicle,
  updateVehicle,
} from '@/services/vehicleService'
import { getVehicleTypeLabel } from '@/constants/vehicles'
import type { Vehicle, VehicleInput } from '@/types/vehicle'
import { useAuthStore } from './authStore'

export const useVehicleStore = defineStore('vehicles', {
  state: () => ({
    vehicles: [] as Vehicle[],
    activeVehicleId: null as string | null,
    loading: false,
  }),
  getters: {
    activeVehicle: (state) => state.vehicles.find((vehicle) => vehicle.id === state.activeVehicleId) ?? null,
    vehicleOptions: (state) =>
      state.vehicles.map((vehicle) => ({
        label: `${getVehicleTypeLabel(vehicle.vehicleType)} · ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
        value: vehicle.id,
      })),
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
        const { vehicles, activeVehicleId } = await fetchVehicles(this.getUid())
        this.vehicles = vehicles
        this.activeVehicleId = activeVehicleId
      } finally {
        this.loading = false
      }
    },
    async create(payload: VehicleInput) {
      await createVehicle(this.getUid(), payload)
      await this.fetchAll()
      if (!this.activeVehicleId && this.vehicles.length) {
        await this.chooseActiveVehicle(this.vehicles[0].id)
      }
    },
    async update(id: string, payload: VehicleInput) {
      await updateVehicle(this.getUid(), id, payload)
      await this.fetchAll()
    },
    async remove(id: string) {
      await deleteVehicle(this.getUid(), id)
      await this.fetchAll()
    },
    async chooseActiveVehicle(vehicleId: string | null) {
      await setActiveVehicle(this.getUid(), vehicleId)
      this.activeVehicleId = vehicleId
    },
  },
})
