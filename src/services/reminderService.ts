import { get, push, remove, set, update } from 'firebase/database'
import { DEFAULT_REMINDER_INTERVALS } from '@/constants/reminders'
import type { MaintenanceRule, MaintenanceRuleInput } from '@/types/reminder'
import type { Vehicle } from '@/types/vehicle'
import { userRef } from './firebase'

function parse(snapshotValue: Record<string, Omit<MaintenanceRule, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => a.nextMileage - b.nextMileage)
}

export async function fetchMaintenanceRules(uid: string) {
  const snapshot = await get(userRef(uid, 'maintenanceRules'))
  return parse(snapshot.val())
}

export async function createMaintenanceRule(uid: string, payload: MaintenanceRuleInput) {
  const now = Date.now()
  const ruleRef = push(userRef(uid, 'maintenanceRules'))
  await set(ruleRef, {
    ...payload,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateMaintenanceRule(uid: string, id: string, payload: MaintenanceRuleInput) {
  await update(userRef(uid, `maintenanceRules/${id}`), {
    ...payload,
    updatedAt: Date.now(),
  })
}

export async function deleteMaintenanceRule(uid: string, id: string) {
  await remove(userRef(uid, `maintenanceRules/${id}`))
}

export async function seedDefaultMaintenanceRules(uid: string, vehicle: Vehicle) {
  const existing = await fetchMaintenanceRules(uid)
  const vehicleRules = existing.filter((rule) => rule.vehicleId === vehicle.id)

  if (vehicleRules.length > 0) return

  await Promise.all(
    DEFAULT_REMINDER_INTERVALS.map((item) =>
      createMaintenanceRule(uid, {
        vehicleId: vehicle.id,
        item: item.item,
        intervalKm: item.intervalKm,
        lastMileage: vehicle.currentMileage,
        nextMileage: vehicle.currentMileage + item.intervalKm,
        isEnabled: true,
      }),
    ),
  )
}
