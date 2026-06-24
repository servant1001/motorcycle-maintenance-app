import type { BaseEntity } from './common'

export interface MaintenanceRecord extends BaseEntity {
  vehicleId: string
  date: string
  mileage: number
  item: string
  cost: number
  shopName?: string
  note?: string
}

export interface MaintenanceInput {
  vehicleId: string
  date: string
  mileage: number
  item: string
  cost: number
  shopName?: string
  note?: string
}
