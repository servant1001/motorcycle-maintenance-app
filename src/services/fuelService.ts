import { get, push, remove, set, update } from 'firebase/database'
import { userRef } from './firebase'
import { syncVehicleMileage } from './vehicleService'
import type { FuelInput, FuelRecord } from '@/types/fuel'

function parse(snapshotValue: Record<string, Omit<FuelRecord, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (a.date === b.date ? b.mileage - a.mileage : b.date.localeCompare(a.date)))
}

export async function fetchFuelRecords(uid: string) {
  const snapshot = await get(userRef(uid, 'fuelRecords'))
  return parse(snapshot.val())
}

export async function createFuelRecord(uid: string, payload: FuelInput) {
  const now = Date.now()
  const recordRef = push(userRef(uid, 'fuelRecords'))
  const record = {
    ...payload,
    note: payload.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
  }
  await set(recordRef, record)
  await syncVehicleMileage(uid, payload.vehicleId, payload.mileage)
}

export async function updateFuelRecord(uid: string, id: string, payload: FuelInput) {
  await update(userRef(uid, `fuelRecords/${id}`), {
    ...payload,
    note: payload.note?.trim() || '',
    updatedAt: Date.now(),
  })
  await syncVehicleMileage(uid, payload.vehicleId, payload.mileage)
}

export async function deleteFuelRecord(uid: string, id: string) {
  await remove(userRef(uid, `fuelRecords/${id}`))
}
