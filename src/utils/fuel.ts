import type { FuelRecord, FuelRecordInsight } from '@/types/fuel'

function sortByMileage(records: FuelRecord[]) {
  return [...records].sort((a, b) => {
    if (a.date === b.date) return a.mileage - b.mileage
    return a.date.localeCompare(b.date)
  })
}

export function getFuelInsights(records: FuelRecord[]) {
  const sorted = sortByMileage(records)
  const insights = new Map<string, FuelRecordInsight>()
  let previousFullRecord: FuelRecord | null = null

  sorted.forEach((record) => {
    let efficiency: number | null = null
    let costPerKm: number | null = null

    if (record.isFullTank && previousFullRecord) {
      const distance = record.mileage - previousFullRecord.mileage
      if (distance > 0 && record.liters > 0) {
        efficiency = distance / record.liters
        costPerKm = record.amount / distance
      }
    }

    if (record.isFullTank) {
      previousFullRecord = record
    }

    insights.set(record.id, { efficiency, costPerKm })
  })

  return insights
}

export function getAverageFuelEfficiency(records: FuelRecord[]) {
  const insights = [...getFuelInsights(records).values()]
  const samples = insights
    .map((item) => item.efficiency)
    .filter((value): value is number => value !== null && Number.isFinite(value))

  if (!samples.length) return null

  return samples.reduce((sum, value) => sum + value, 0) / samples.length
}
