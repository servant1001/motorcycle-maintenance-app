export interface UserProfile {
  email: string
  displayName: string
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  activeVehicleId?: string | null
}

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export type ReminderStatus = 'normal' | 'warning' | 'overdue'
