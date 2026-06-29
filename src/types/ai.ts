import type { FuelRecord } from './fuel'
import type { InsuranceRecord } from './insurance'
import type { MaintenanceRecord } from './maintenance'
import type { RepairRecord } from './repair'
import type { Vehicle } from './vehicle'

export interface AIChatContext {
  vehicle: Vehicle | null
  maintenanceRecords: MaintenanceRecord[]
  repairRecords: RepairRecord[]
  fuelRecords: FuelRecord[]
  insuranceRecords: InsuranceRecord[]
}

export interface AIChatRequest {
  message: string
  context: AIChatContext
}

export interface AIChatResponse {
  reply: string
}

export interface AIMessageItem {
  id: string
  role: 'assistant' | 'user'
  content: string
  createdAt: number
}
