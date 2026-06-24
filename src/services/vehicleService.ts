import { get, push, remove, set, update } from 'firebase/database'
import { userRef } from './firebase'
import type { Vehicle, VehicleInput } from '@/types/vehicle'

function fromSnapshot<T>(snapshotValue: Record<string, Omit<T, 'id'>> | null) {
  if (!snapshotValue) return []
  return Object.entries(snapshotValue).map(([id, value]) => ({ id, ...value })) as T[]
}

function normalizeVehicle(vehicle: Vehicle): Vehicle {
  const isElectric = vehicle.vehicleType?.includes('electric') || vehicle.fuelType === 'electric'

  return {
    ...vehicle,
    vehicleType: vehicle.vehicleType ?? (isElectric ? 'electric_motorcycle' : 'motorcycle'),
    fuelType: vehicle.fuelType ?? (isElectric ? 'electric' : 'gasoline'),
    imageUrl: vehicle.imageUrl ?? '',
    note: vehicle.note ?? '',
  }
}

export async function fetchVehicles(uid: string) {
  const [vehiclesSnapshot, activeVehicleSnapshot] = await Promise.all([
    get(userRef(uid, 'vehicles')),
    get(userRef(uid, 'settings/activeVehicleId')),
  ])

  const vehicles = fromSnapshot<Vehicle>(vehiclesSnapshot.val())
    .map(normalizeVehicle)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return {
    vehicles,
    activeVehicleId: activeVehicleSnapshot.exists() ? activeVehicleSnapshot.val() : null,
  }
}

export async function createVehicle(uid: string, payload: VehicleInput) {
  const now = Date.now()
  const recordRef = push(userRef(uid, 'vehicles'))
  const vehicle: Omit<Vehicle, 'id'> = {
    ...payload,
    imageUrl: payload.imageUrl?.trim() || '',
    vehicleType: payload.vehicleType,
    fuelType: payload.fuelType,
    year: payload.year || undefined,
    note: payload.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
  }

  await set(recordRef, vehicle)
  return recordRef.key ?? ''
}

export async function updateVehicle(uid: string, id: string, payload: VehicleInput) {
  await update(userRef(uid, `vehicles/${id}`), {
    ...payload,
    imageUrl: payload.imageUrl?.trim() || '',
    vehicleType: payload.vehicleType,
    fuelType: payload.fuelType,
    year: payload.year || undefined,
    note: payload.note?.trim() || '',
    updatedAt: Date.now(),
  })
}

export async function deleteVehicle(uid: string, id: string) {
  await Promise.all([
    remove(userRef(uid, `vehicles/${id}`)),
    get(userRef(uid, 'settings/activeVehicleId')).then(async (snapshot) => {
      if (snapshot.exists() && snapshot.val() === id) {
        await set(userRef(uid, 'settings/activeVehicleId'), null)
      }
    }),
  ])
}

export async function setActiveVehicle(uid: string, vehicleId: string | null) {
  await set(userRef(uid, 'settings/activeVehicleId'), vehicleId)
}

export async function syncVehicleMileage(uid: string, vehicleId: string, mileage: number) {
  const snapshot = await get(userRef(uid, `vehicles/${vehicleId}/currentMileage`))
  const currentMileage = snapshot.exists() ? Number(snapshot.val()) : 0

  if (mileage > currentMileage) {
    await update(userRef(uid, `vehicles/${vehicleId}`), {
      currentMileage: mileage,
      updatedAt: Date.now(),
    })
  }
}
