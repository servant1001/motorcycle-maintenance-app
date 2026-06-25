import dayjs from 'dayjs'
import type { InsuranceRecord, InsuranceReminder } from '@/types/insurance'

export function buildInsuranceReminder(record: InsuranceRecord): InsuranceReminder {
  const remainingDays = dayjs(record.endDate).startOf('day').diff(dayjs().startOf('day'), 'day')
  const status = remainingDays < 0 ? 'overdue' : remainingDays <= 30 ? 'warning' : 'normal'

  return {
    ...record,
    remainingDays,
    status,
  }
}

export function sortInsuranceByExpiry(records: InsuranceRecord[]) {
  return [...records].sort((a, b) => a.endDate.localeCompare(b.endDate))
}

export function getInsuranceReminders(records: InsuranceRecord[]) {
  return sortInsuranceByExpiry(records).map(buildInsuranceReminder)
}

export function getNearestInsurance(records: InsuranceRecord[]) {
  const reminders = getInsuranceReminders(records)
  return reminders.length ? reminders[0] : null
}

export function getInsuranceStatusLabel(reminder: InsuranceReminder) {
  if (reminder.status === 'overdue') return '請立即續保'
  if (reminder.status === 'warning') return '即將到期'
  return '有效'
}
