import type { BaseEntity } from './common'

export interface RepairRecord extends BaseEntity {
  vehicleId: string
  date: string
  mileage: number
  problem: string
  repairContent: string
  cost: number
  shopName?: string
  note?: string
}

export interface RepairInput {
  vehicleId: string
  date: string
  mileage: number
  problem: string
  repairContent: string
  cost: number
  shopName?: string
  note?: string
}
