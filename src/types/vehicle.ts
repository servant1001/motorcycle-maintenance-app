import type { BaseEntity } from './common'

export interface Vehicle extends BaseEntity {
  plateNumber: string
  brand: string
  model: string
  imageUrl?: string
  year?: number
  currentMileage: number
  note?: string
}

export interface VehicleInput {
  plateNumber: string
  brand: string
  model: string
  imageUrl?: string
  year?: number
  currentMileage: number
  note?: string
}
