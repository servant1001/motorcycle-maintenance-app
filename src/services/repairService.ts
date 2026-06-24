import { get, push, remove, set, update } from 'firebase/database'
import { userRef } from './firebase'
import { syncVehicleMileage } from './vehicleService'
import type { RepairInput, RepairRecord } from '@/types/repair'

function parse(snapshotValue: Record<string, Omit<RepairRecord, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (a.date === b.date ? b.mileage - a.mileage : b.date.localeCompare(a.date)))
}

export async function fetchRepairRecords(uid: string) {
  const snapshot = await get(userRef(uid, 'repairRecords'))
  return parse(snapshot.val())
}

export async function createRepairRecord(uid: string, payload: RepairInput) {
  const now = Date.now()
  const recordRef = push(userRef(uid, 'repairRecords'))
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

export async function updateRepairRecord(uid: string, id: string, payload: RepairInput) {
  await update(userRef(uid, `repairRecords/${id}`), {
    ...payload,
    note: payload.note?.trim() || '',
    shopName: payload.shopName?.trim() || '',
    updatedAt: Date.now(),
  })
  await syncVehicleMileage(uid, payload.vehicleId, payload.mileage)
}

export async function deleteRepairRecord(uid: string, id: string) {
  await remove(userRef(uid, `repairRecords/${id}`))
}
