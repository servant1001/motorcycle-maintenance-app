import type { BaseEntity } from './common'

export type FuelType = '92' | '95' | '98' | 'diesel' | 'electric' | 'other'

export interface FuelRecord extends BaseEntity {
  vehicleId: string
  date: string
  mileage: number
  liters: number
  amount: number
  fuelType: FuelType
  isFullTank: boolean
  note?: string
}

export interface FuelInput {
  vehicleId: string
  date: string
  mileage: number
  liters: number
  amount: number
  fuelType: FuelType
  isFullTank: boolean
  note?: string
}

export interface FuelRecordInsight {
  efficiency: number | null
  costPerKm: number | null
}
