import type { Vehicle, VehicleFuelType, VehicleType } from '@/types/vehicle'

export const VEHICLE_TYPE_OPTIONS: Array<{ label: string; value: VehicleType }> = [
  { label: '機車', value: 'motorcycle' },
  { label: '汽車', value: 'car' },
  { label: '電動機車', value: 'electric_motorcycle' },
  { label: '電動汽車', value: 'electric_car' },
]

export const VEHICLE_FUEL_TYPE_OPTIONS: Array<{ label: string; value: VehicleFuelType }> = [
  { label: '汽油', value: 'gasoline' },
  { label: '柴油', value: 'diesel' },
  { label: '油電', value: 'hybrid' },
  { label: '純電', value: 'electric' },
]

const MAINTENANCE_ITEMS_BY_TYPE: Record<VehicleType, string[]> = {
  motorcycle: ['機油', '齒輪油', '空濾', '火星塞', '煞車皮', '輪胎', '皮帶', '驗車'],
  car: ['機油', '機油芯', '空氣濾芯', '冷氣濾網', '變速箱油', '煞車油', '水箱水', '火星塞', '輪胎', '電瓶', '驗車'],
  electric_motorcycle: ['電池健康檢查', '煞車皮', '輪胎', '傳動系統', '冷卻系統', '驗車'],
  electric_car: ['電池健康檢查', '冷卻液', '冷氣濾網', '煞車油', '輪胎', '12V電瓶', '驗車'],
}

const DEFAULT_REMINDERS_BY_TYPE: Record<VehicleType, Array<{ item: string; intervalKm: number }>> = {
  motorcycle: [
    { item: '機油', intervalKm: 1000 },
    { item: '齒輪油', intervalKm: 3000 },
    { item: '空濾', intervalKm: 5000 },
    { item: '火星塞', intervalKm: 8000 },
    { item: '皮帶', intervalKm: 15000 },
  ],
  car: [
    { item: '機油', intervalKm: 5000 },
    { item: '機油芯', intervalKm: 10000 },
    { item: '空氣濾芯', intervalKm: 10000 },
    { item: '冷氣濾網', intervalKm: 10000 },
    { item: '變速箱油', intervalKm: 40000 },
    { item: '煞車油', intervalKm: 20000 },
    { item: '水箱水', intervalKm: 20000 },
    { item: '輪胎', intervalKm: 30000 },
  ],
  electric_motorcycle: [
    { item: '電池健康檢查', intervalKm: 5000 },
    { item: '煞車皮', intervalKm: 8000 },
    { item: '輪胎', intervalKm: 12000 },
    { item: '傳動系統', intervalKm: 10000 },
  ],
  electric_car: [
    { item: '電池健康檢查', intervalKm: 10000 },
    { item: '冷卻液', intervalKm: 20000 },
    { item: '冷氣濾網', intervalKm: 10000 },
    { item: '煞車油', intervalKm: 20000 },
    { item: '輪胎', intervalKm: 15000 },
  ],
}

export function getVehicleTypeLabel(type?: VehicleType) {
  const option = VEHICLE_TYPE_OPTIONS.find((item) => item.value === type)
  return option?.label ?? '車輛'
}

export function getVehicleFuelLabel(type?: VehicleFuelType) {
  const option = VEHICLE_FUEL_TYPE_OPTIONS.find((item) => item.value === type)
  return option?.label ?? '未設定'
}

export function getVehicleTypeIcon(type?: VehicleType) {
  if (type === 'car') return '🚗'
  if (type === 'motorcycle') return '🛵'
  if (type === 'electric_car' || type === 'electric_motorcycle') return '⚡'
  return '🚘'
}

export function isElectricVehicle(type?: VehicleType) {
  return type === 'electric_car' || type === 'electric_motorcycle'
}

export function isCarVehicle(type?: VehicleType) {
  return type === 'car' || type === 'electric_car'
}

export function getVehicleEntityText(type?: VehicleType) {
  return getVehicleTypeLabel(type)
}

export function getMaintenanceItemsByVehicleType(type?: VehicleType) {
  return MAINTENANCE_ITEMS_BY_TYPE[type ?? 'motorcycle']
}

export function getDefaultReminderIntervalsByVehicleType(type?: VehicleType) {
  return DEFAULT_REMINDERS_BY_TYPE[type ?? 'motorcycle']
}

export function getEnergyRecordLabel(type?: VehicleType) {
  return isElectricVehicle(type) ? '充電紀錄' : '加油紀錄'
}

export function getEnergyActionLabel(type?: VehicleType) {
  return isElectricVehicle(type) ? '充電' : '加油'
}

export function getEnergyUnitLabel(type?: VehicleType) {
  return isElectricVehicle(type) ? '充電度數 kWh' : '公升數 L'
}

export function getEnergyEfficiencyLabel(type?: VehicleType) {
  return isElectricVehicle(type) ? '電耗 km/kWh' : '油耗 km/L'
}

export function getEnergySourceOptions(vehicle?: Vehicle) {
  if (vehicle?.fuelType === 'electric' || isElectricVehicle(vehicle?.vehicleType)) {
    return [{ label: '純電', value: 'electric' as const }]
  }
  if (vehicle?.fuelType === 'diesel') {
    return [{ label: '柴油', value: 'diesel' as const }]
  }
  return [
    { label: '92', value: '92' as const },
    { label: '95', value: '95' as const },
    { label: '98', value: '98' as const },
  ]
}
