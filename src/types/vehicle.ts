import type { BaseEntity } from './common'

export type VehicleType = 'motorcycle' | 'car' | 'electric_motorcycle' | 'electric_car'
export type VehicleFuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric'

export interface Vehicle extends BaseEntity {
  vehicleType: VehicleType
  plateNumber: string
  brand: string
  model: string
  imageUrl?: string
  year?: number
  currentMileage: number
  fuelType: VehicleFuelType
  note?: string
}

export interface VehicleInput {
  vehicleType: VehicleType
  plateNumber: string
  brand: string
  model: string
  imageUrl?: string
  year?: number
  currentMileage: number
  fuelType: VehicleFuelType
  note?: string
}
