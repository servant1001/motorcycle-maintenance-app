import { get, push, remove, set, update } from 'firebase/database'
import { userRef } from './firebase'
import { syncVehicleMileage } from './vehicleService'
import type { MaintenanceInput, MaintenanceRecord } from '@/types/maintenance'

function parse(snapshotValue: Record<string, Omit<MaintenanceRecord, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (a.date === b.date ? b.mileage - a.mileage : b.date.localeCompare(a.date)))
}

export async function fetchMaintenanceRecords(uid: string) {
  const snapshot = await get(userRef(uid, 'maintenanceRecords'))
  return parse(snapshot.val())
}

export async function createMaintenanceRecord(uid: string, payload: MaintenanceInput) {
  const now = Date.now()
  const recordRef = push(userRef(uid, 'maintenanceRecords'))
  const record = {
    ...payload,
    note: payload.note?.trim() || '',
    shopName: payload.shopName?.trim() || '',
    createdAt: now,
    updatedAt: now,
  }
  await set(recordRef, record)
  await syncVehicleMileage(uid, payload.vehicleId, payload.mileage)
}

export async function updateMaintenanceRecord(uid: string, id: string, payload: MaintenanceInput) {
  await update(userRef(uid, `maintenanceRecords/${id}`), {
    ...payload,
    note: payload.note?.trim() || '',
    shopName: payload.shopName?.trim() || '',
    updatedAt: Date.now(),
  })
  await syncVehicleMileage(uid, payload.vehicleId, payload.mileage)
}

export async function deleteMaintenanceRecord(uid: string, id: string) {
  await remove(userRef(uid, `maintenanceRecords/${id}`))
}
