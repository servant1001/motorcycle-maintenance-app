import dayjs from 'dayjs'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDate(value?: string | number) {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD')
}

export function startOfMonth() {
  return dayjs().startOf('month')
}

export function startOfYear() {
  return dayjs().startOf('year')
}
