import type { BaseEntity, ReminderStatus } from './common'

export interface InsuranceRecord extends BaseEntity {
  vehicleId: string
  insuranceType: string
  companyName: string
  policyNumber: string
  startDate: string
  endDate: string
  premium: number
  coverageAmount: number
  contactPhone?: string
  note?: string
}

export interface InsuranceInput {
  vehicleId: string
  insuranceType: string
  companyName: string
  policyNumber: string
  startDate: string
  endDate: string
  premium: number
  coverageAmount: number
  contactPhone?: string
  note?: string
}

export interface InsuranceReminder extends InsuranceRecord {
  remainingDays: number
  status: ReminderStatus
}
