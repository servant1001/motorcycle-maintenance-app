<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { getEnergyEfficiencyLabel, getEnergyRecordLabel } from '@/constants/vehicles'
import { useFuelStore } from '@/stores/fuelStore'
import { useMaintenanceStore } from '@/stores/maintenanceStore'
import { useRepairStore } from '@/stores/repairStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { getFuelInsights } from '@/utils/fuel'
import { formatCurrency, formatNumber } from '@/utils/format'

type ExpenseCategory = 'maintenance' | 'repair' | 'fuel'

type ExpenseRecord = {
  date: string
  amount: number
  category: ExpenseCategory
  vehicleId: string
}

const vehicleStore = useVehicleStore()
const maintenanceStore = useMaintenanceStore()
const repairStore = useRepairStore()
const fuelStore = useFuelStore()

const selectedVehicleId = ref('')
const selectedYear = ref(new Date().getFullYear())

const monthlyExpenseChartRef = ref<HTMLDivElement | null>(null)
const yearlyExpenseChartRef = ref<HTMLDivElement | null>(null)
const expenseCompositionChartRef = ref<HTMLDivElement | null>(null)
const efficiencyTrendChartRef = ref<HTMLDivElement | null>(null)

let monthlyExpenseChart: EChartsType | null = null
let yearlyExpenseChart: EChartsType | null = null
let expenseCompositionChart: EChartsType | null = null
let efficiencyTrendChart: EChartsType | null = null

const palette = {
  maintenance: '#38BDF8',
  repair: '#F56C6C',
  fuel: '#67C23A',
  text: '#DCE7F5',
  textSoft: 'rgba(220, 231, 245, 0.7)',
  splitLine: 'rgba(148, 163, 184, 0.16)',
  tooltipBg: 'rgba(15, 23, 42, 0.92)',
}

const expenseRecords = computed<ExpenseRecord[]>(() => [
  ...maintenanceStore.records.map((record) => ({
    date: record.date,
    amount: record.cost,
    category: 'maintenance' as const,
    vehicleId: record.vehicleId,
  })),
  ...repairStore.records.map((record) => ({
    date: record.date,
    amount: record.cost,
    category: 'repair' as const,
    vehicleId: record.vehicleId,
  })),
  ...fuelStore.records.map((record) => ({
    date: record.date,
    amount: record.amount,
    category: 'fuel' as const,
    vehicleId: record.vehicleId,
  })),
])

const selectedVehicle = computed(() =>
  vehicleStore.vehicles.find((vehicle) => vehicle.id === selectedVehicleId.value) ?? null,
)

const filteredExpenseRecords = computed(() =>
  expenseRecords.value.filter((record) => !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value),
)

const filteredFuelRecords = computed(() =>
  fuelStore.records.filter((record) => !selectedVehicleId.value || record.vehicleId === selectedVehicleId.value),
)

const availableYears = computed(() => {
  const years = new Set<number>()
  expenseRecords.value.forEach((record) => years.add(Number(record.date.slice(0, 4))))
  return [...years].sort((a, b) => b - a)
})

const recordsForSelectedYear = computed(() =>
  filteredExpenseRecords.value.filter((record) => Number(record.date.slice(0, 4)) === selectedYear.value),
)

const monthlyCategoryTotals = computed(() => {
  const months = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)
  const maintenance = Array.from({ length: 12 }, () => 0)
  const repair = Array.from({ length: 12 }, () => 0)
  const fuel = Array.from({ length: 12 }, () => 0)

  recordsForSelectedYear.value.forEach((record) => {
    const monthIndex = Number(record.date.slice(5, 7)) - 1
    if (monthIndex < 0 || monthIndex > 11) return
    if (record.category === 'maintenance') maintenance[monthIndex] += record.amount
    if (record.category === 'repair') repair[monthIndex] += record.amount
    if (record.category === 'fuel') fuel[monthIndex] += record.amount
  })

  return { months, maintenance, repair, fuel }
})

const yearlyCategoryTotals = computed(() => {
  const yearMap = new Map<number, { maintenance: number; repair: number; fuel: number }>()

  filteredExpenseRecords.value.forEach((record) => {
    const year = Number(record.date.slice(0, 4))
    const bucket = yearMap.get(year) ?? { maintenance: 0, repair: 0, fuel: 0 }
    bucket[record.category] += record.amount
    yearMap.set(year, bucket)
  })

  const years = [...yearMap.keys()].sort((a, b) => a - b)

  return {
    years: years.map((year) => `${year}`),
    maintenance: years.map((year) => yearMap.get(year)?.maintenance ?? 0),
    repair: years.map((year) => yearMap.get(year)?.repair ?? 0),
    fuel: years.map((year) => yearMap.get(year)?.fuel ?? 0),
  }
})

const expenseComposition = computed(() => {
  const totals = filteredExpenseRecords.value.reduce(
    (result, record) => {
      result[record.category] += record.amount
      return result
    },
    { maintenance: 0, repair: 0, fuel: 0 },
  )

  return [
    { name: '保養', value: totals.maintenance, color: palette.maintenance },
    { name: '維修', value: totals.repair, color: palette.repair },
    {
      name: selectedVehicle.value ? getEnergyRecordLabel(selectedVehicle.value.vehicleType) : '能源',
      value: totals.fuel,
      color: palette.fuel,
    },
  ]
})

const fuelInsightsMap = computed(() => getFuelInsights(filteredFuelRecords.value))

const efficiencyTrend = computed(() =>
  filteredFuelRecords.value
    .filter((record) => fuelInsightsMap.value.get(record.id)?.efficiency)
    .sort((a, b) => a.date.localeCompare(b.date) || a.mileage - b.mileage)
    .map((record) => ({
      label: record.date,
      value: fuelInsightsMap.value.get(record.id)?.efficiency ?? 0,
    })),
)

const totalExpense = computed(() =>
  filteredExpenseRecords.value.reduce((sum, record) => sum + record.amount, 0),
)

const selectedYearExpense = computed(() =>
  recordsForSelectedYear.value.reduce((sum, record) => sum + record.amount, 0),
)

const monthlyAverageExpense = computed(() => {
  const totals = monthlyCategoryTotals.value
  const grandTotal = [...totals.maintenance, ...totals.repair, ...totals.fuel].reduce((sum, value) => sum + value, 0)
  const activeMonthCount = totals.months.filter((_, index) =>
    totals.maintenance[index] || totals.repair[index] || totals.fuel[index],
  ).length
  return activeMonthCount ? grandTotal / activeMonthCount : 0
})

const averageEfficiency = computed(() => {
  const samples = efficiencyTrend.value.map((point) => point.value).filter((value) => Number.isFinite(value))
  return samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : null
})

const highestExpenseMonth = computed(() => {
  const totals = monthlyCategoryTotals.value.months.map((month, index) => ({
    month,
    total:
      monthlyCategoryTotals.value.maintenance[index] +
      monthlyCategoryTotals.value.repair[index] +
      monthlyCategoryTotals.value.fuel[index],
  }))

  return totals.reduce((best, current) => (current.total > best.total ? current : best), {
    month: '-',
    total: 0,
  })
})

const statisticsCards = computed(() => [
  {
    label: '累積總支出',
    value: formatCurrency(totalExpense.value),
    accent: 'accent-cyan',
  },
  {
    label: `${selectedYear.value} 年支出`,
    value: formatCurrency(selectedYearExpense.value),
    accent: 'accent-blue',
  },
  {
    label: '月平均支出',
    value: formatCurrency(monthlyAverageExpense.value),
    accent: 'accent-green',
  },
  {
    label: '平均效率',
    value: averageEfficiency.value
      ? `${formatNumber(averageEfficiency.value, 1)} ${getEnergyEfficiencyLabel(selectedVehicle.value?.vehicleType)}`
      : '尚無資料',
    accent: 'accent-ice',
  },
])

function buildTooltip() {
  return {
    backgroundColor: palette.tooltipBg,
    borderWidth: 0,
    textStyle: {
      color: '#F8FAFC',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 18px 40px rgba(2, 8, 23, 0.35); border-radius: 16px; padding: 12px 14px;',
  }
}

function buildMonthlyExpenseOption() {
  const { months, maintenance, repair, fuel } = monthlyCategoryTotals.value

  return {
    animationDuration: 700,
    tooltip: { ...buildTooltip(), trigger: 'axis' },
    legend: {
      data: ['保養', '維修', '能源'],
      top: 0,
      textStyle: { color: palette.textSoft },
      icon: 'roundRect',
    },
    grid: { left: 8, right: 8, top: 52, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: palette.textSoft },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: palette.textSoft },
      splitLine: { lineStyle: { color: palette.splitLine } },
    },
    series: [
      {
        name: '保養',
        type: 'bar',
        stack: 'expense',
        barMaxWidth: 22,
        data: maintenance,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#63E6FF' },
            { offset: 1, color: '#1D9BF0' },
          ]),
        },
      },
      {
        name: '維修',
        type: 'bar',
        stack: 'expense',
        barMaxWidth: 22,
        data: repair,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF9A8B' },
            { offset: 1, color: '#F56C6C' },
          ]),
        },
      },
      {
        name: '能源',
        type: 'bar',
        stack: 'expense',
        barMaxWidth: 22,
        data: fuel,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8EEA7C' },
            { offset: 1, color: '#3FB950' },
          ]),
        },
      },
    ],
  }
}

function buildYearlyExpenseOption() {
  const { years, maintenance, repair, fuel } = yearlyCategoryTotals.value

  return {
    animationDuration: 700,
    tooltip: { ...buildTooltip(), trigger: 'axis' },
    legend: {
      data: ['保養', '維修', '能源'],
      top: 0,
      textStyle: { color: palette.textSoft },
      icon: 'roundRect',
    },
    grid: { left: 8, right: 8, top: 52, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: years,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: palette.textSoft },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: palette.textSoft },
      splitLine: { lineStyle: { color: palette.splitLine } },
    },
    series: [
      {
        name: '保養',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: maintenance,
        lineStyle: { width: 3, color: palette.maintenance },
        itemStyle: { color: palette.maintenance },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 189, 248, 0.28)' },
            { offset: 1, color: 'rgba(56, 189, 248, 0.02)' },
          ]),
        },
      },
      {
        name: '維修',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: repair,
        lineStyle: { width: 3, color: palette.repair },
        itemStyle: { color: palette.repair },
      },
      {
        name: '能源',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: fuel,
        lineStyle: { width: 3, color: palette.fuel },
        itemStyle: { color: palette.fuel },
      },
    ],
  }
}

function buildExpenseCompositionOption() {
  return {
    animationDuration: 700,
    tooltip: { ...buildTooltip(), trigger: 'item' },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: palette.textSoft },
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 16,
          borderColor: 'rgba(7, 17, 34, 0.95)',
          borderWidth: 4,
          shadowBlur: 18,
          shadowColor: 'rgba(15, 23, 42, 0.28)',
        },
        label: {
          color: '#F8FAFC',
          formatter: '{b}\n{d}%',
          fontSize: 12,
        },
        labelLine: {
          lineStyle: { color: 'rgba(220, 231, 245, 0.55)' },
        },
        data: expenseComposition.value.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  }
}

function buildEfficiencyTrendOption() {
  return {
    animationDuration: 700,
    tooltip: { ...buildTooltip(), trigger: 'axis' },
    grid: { left: 8, right: 8, top: 18, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: efficiencyTrend.value.map((point) => point.label),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: palette.textSoft },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: palette.textSoft },
      splitLine: { lineStyle: { color: palette.splitLine } },
    },
    series: [
      {
        name: '效率',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: efficiencyTrend.value.map((point) => point.value),
        lineStyle: { width: 3, color: '#7DD3FC' },
        itemStyle: {
          color: '#E0F2FE',
          borderColor: '#38BDF8',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 189, 248, 0.32)' },
            { offset: 1, color: 'rgba(56, 189, 248, 0.02)' },
          ]),
        },
      },
    ],
  }
}

function ensureChart(chart: EChartsType | null, element: HTMLDivElement | null) {
  if (!element) return null
  return chart ?? echarts.init(element)
}

function renderCharts() {
  monthlyExpenseChart = ensureChart(monthlyExpenseChart, monthlyExpenseChartRef.value)
  yearlyExpenseChart = ensureChart(yearlyExpenseChart, yearlyExpenseChartRef.value)
  expenseCompositionChart = ensureChart(expenseCompositionChart, expenseCompositionChartRef.value)
  efficiencyTrendChart = ensureChart(efficiencyTrendChart, efficiencyTrendChartRef.value)

  monthlyExpenseChart?.setOption(buildMonthlyExpenseOption())
  yearlyExpenseChart?.setOption(buildYearlyExpenseOption())
  expenseCompositionChart?.setOption(buildExpenseCompositionOption())
  efficiencyTrendChart?.setOption(buildEfficiencyTrendOption())
}

function resizeCharts() {
  monthlyExpenseChart?.resize()
  yearlyExpenseChart?.resize()
  expenseCompositionChart?.resize()
  efficiencyTrendChart?.resize()
}

function disposeCharts() {
  monthlyExpenseChart?.dispose()
  yearlyExpenseChart?.dispose()
  expenseCompositionChart?.dispose()
  efficiencyTrendChart?.dispose()
  monthlyExpenseChart = null
  yearlyExpenseChart = null
  expenseCompositionChart = null
  efficiencyTrendChart = null
}

watch(
  availableYears,
  (years) => {
    if (!years.length) return
    if (!years.includes(selectedYear.value)) {
      selectedYear.value = years[0]
    }
  },
  { immediate: true },
)

watch([filteredExpenseRecords, filteredFuelRecords, selectedVehicleId, selectedYear], async () => {
  await nextTick()
  renderCharts()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchAll(),
    maintenanceStore.fetchAll(),
    repairStore.fetchAll(),
    fuelStore.fetchAll(),
  ])

  await nextTick()
  renderCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  disposeCharts()
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>統計分析</h1>
        <p>以更清楚的 KPI 卡片與科技感圖表，快速掌握月度支出、年度趨勢、支出結構與效率表現。</p>
      </div>
    </div>

    <div class="toolbar">
      <el-select v-model="selectedVehicleId" clearable placeholder="全部車輛">
        <el-option
          v-for="option in vehicleStore.vehicleOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <el-select v-model="selectedYear" placeholder="選擇年份">
        <el-option
          v-for="year in availableYears"
          :key="year"
          :label="`${year} 年`"
          :value="year"
        />
      </el-select>
    </div>

    <div class="statistics-kpis">
      <article
        v-for="card in statisticsCards"
        :key="card.label"
        class="statistics-kpi-card"
        :class="card.accent"
      >
        <p class="metric-label">{{ card.label }}</p>
        <div class="statistics-kpi-value">{{ card.value }}</div>
      </article>
    </div>

    <div class="statistics-grid">
      <section class="statistics-panel statistics-panel--wide tech-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Monthly Expense</p>
            <h3>{{ selectedYear }} 年月度支出</h3>
          </div>
          <span class="panel-chip">12 個月份</span>
        </div>
        <div ref="monthlyExpenseChartRef" class="chart-host" />
      </section>

      <section class="statistics-panel tech-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Expense Mix</p>
            <h3>支出結構占比</h3>
          </div>
          <span class="panel-chip">即時比例</span>
        </div>
        <div ref="expenseCompositionChartRef" class="chart-host chart-host--compact" />
      </section>

      <section class="statistics-panel statistics-panel--wide tech-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Yearly Trend</p>
            <h3>年度支出趨勢</h3>
          </div>
          <span class="panel-chip">跨年度比較</span>
        </div>
        <div ref="yearlyExpenseChartRef" class="chart-host" />
      </section>

      <section class="statistics-panel tech-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Efficiency Trend</p>
            <h3>效率變化</h3>
          </div>
          <span class="panel-chip">能源表現</span>
        </div>
        <div ref="efficiencyTrendChartRef" class="chart-host chart-host--compact" />
      </section>
    </div>

    <section class="statistics-summary soft-panel">
      <div>
        <p class="eyebrow">Quick Summary</p>
        <h3>統計摘要</h3>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="metric-label">保養支出</span>
          <strong>{{ formatCurrency(expenseComposition[0]?.value ?? 0) }}</strong>
        </div>
        <div class="summary-item">
          <span class="metric-label">維修支出</span>
          <strong>{{ formatCurrency(expenseComposition[1]?.value ?? 0) }}</strong>
        </div>
        <div class="summary-item">
          <span class="metric-label">{{ selectedVehicle ? getEnergyRecordLabel(selectedVehicle.vehicleType) : '能源支出' }}</span>
          <strong>{{ formatCurrency(expenseComposition[2]?.value ?? 0) }}</strong>
        </div>
        <div class="summary-item">
          <span class="metric-label">最高支出月份</span>
          <strong>{{ highestExpenseMonth.month }}</strong>
          <small>{{ formatCurrency(highestExpenseMonth.total) }}</small>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.statistics-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
}

.statistics-kpi-card {
  position: relative;
  overflow: hidden;
  padding: 18px 18px 20px;
  border-radius: 24px;
  border: 1px solid rgba(64, 158, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92)),
    var(--ds-surface);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.statistics-kpi-card::after {
  content: '';
  position: absolute;
  inset: auto -32px -32px auto;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.36), transparent 68%);
  pointer-events: none;
}

.statistics-kpi-value {
  margin-top: 10px;
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--ds-text);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.accent-cyan {
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.accent-blue {
  background:
    radial-gradient(circle at top right, rgba(29, 78, 216, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.accent-green {
  background:
    radial-gradient(circle at top right, rgba(103, 194, 58, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.accent-ice {
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.22), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.statistics-grid {
  display: grid;
  gap: 16px;
}

.statistics-panel {
  padding: 18px;
  min-width: 0;
}

.tech-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.18), transparent 26%),
    linear-gradient(160deg, #203047 0%, #162235 55%, #0f172a 100%);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.2);
}

.tech-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(transparent 0, transparent calc(100% - 1px), rgba(148, 163, 184, 0.06) calc(100% - 1px)),
    linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(148, 163, 184, 0.04) calc(100% - 1px));
  background-size: 100% 44px, 44px 100%;
  pointer-events: none;
  opacity: 0.7;
}

.panel-heading {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-heading h3 {
  margin: 6px 0 0;
  font-size: 22px;
  color: #f8fafc;
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(220, 231, 245, 0.82);
  font-size: 12px;
}

.tech-panel :deep(.eyebrow) {
  color: rgba(191, 219, 254, 0.72);
}

.chart-host {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 340px;
}

.chart-host--compact {
  height: 320px;
}

.statistics-summary {
  padding: 18px;
}

.statistics-summary h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.summary-item {
  padding: 16px;
  border-radius: 20px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item strong {
  font-size: 22px;
  line-height: 1.1;
}

.summary-item small {
  color: var(--ds-text-soft);
}

@media (min-width: 961px) {
  .statistics-grid {
    grid-template-columns: minmax(0, 1.32fr) minmax(320px, 0.68fr);
  }
}

@media (max-width: 768px) {
  .statistics-kpi-value {
    font-size: 28px;
  }

  .panel-heading {
    flex-direction: column;
  }

  .chart-host,
  .chart-host--compact {
    height: 300px;
  }
}
</style>
