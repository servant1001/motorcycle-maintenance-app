import type { BaseEntity, ReminderStatus } from './common'

export interface MaintenanceRule extends BaseEntity {
  vehicleId: string
  item: string
  intervalKm: number
  lastMileage: number
  nextMileage: number
  isEnabled: boolean
}

export interface MaintenanceRuleInput {
  vehicleId: string
  item: string
  intervalKm: number
  lastMileage: number
  nextMileage: number
  isEnabled: boolean
}

export interface ReminderSummary extends MaintenanceRule {
  remainingKm: number
  status: ReminderStatus
}
