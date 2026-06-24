import { get, push, remove, set, update } from 'firebase/database'
import { userRef } from './firebase'
import type { InsuranceInput, InsuranceRecord } from '@/types/insurance'

function parse(snapshotValue: Record<string, Omit<InsuranceRecord, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
}

export async function fetchInsuranceRecords(uid: string) {
  const snapshot = await get(userRef(uid, 'insuranceRecords'))
  return parse(snapshot.val())
}

export async function createInsuranceRecord(uid: string, payload: InsuranceInput) {
  const now = Date.now()
  const recordRef = push(userRef(uid, 'insuranceRecords'))
  await set(recordRef, {
    ...payload,
    contactPhone: payload.contactPhone?.trim() || '',
    note: payload.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateInsuranceRecord(uid: string, id: string, payload: InsuranceInput) {
  await update(userRef(uid, `insuranceRecords/${id}`), {
    ...payload,
    contactPhone: payload.contactPhone?.trim() || '',
    note: payload.note?.trim() || '',
    updatedAt: Date.now(),
  })
}

export async function deleteInsuranceRecord(uid: string, id: string) {
  await remove(userRef(uid, `insuranceRecords/${id}`))
}
