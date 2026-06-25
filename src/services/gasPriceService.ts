export interface GasMarketSnapshot {
  weeklyOilPrice: string
  weeklyExchangeRate: string
  changeRate: string
  nextWeekGasolineAdjustment: string
  nextWeekEffectiveDate: string
  updatedAt: string
  cpc92: string
  cpc95: string
  cpc98: string
  cpcDiesel: string
  sourceUrl: string
}

const SOURCE_URL = 'https://gas.goodlife.tw/'
const WORKER_API_URL = import.meta.env.VITE_GAS_PRICE_API_URL?.trim()
const DIRECT_FETCH_TARGETS = [
  SOURCE_URL,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(SOURCE_URL)}`,
  'https://r.jina.ai/http://gas.goodlife.tw/',
]

function cleanText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractHtmlListValue(html: string, label: string) {
  const pattern = new RegExp(`<h3>\\s*${escapeRegex(label)}\\s*<\\/h3>\\s*([\\s\\S]*?)<\\/li>`, 'i')
  const match = html.match(pattern)
  return match ? cleanText(match[1]) : ''
}

function extractHtmlSectionValue(html: string, sectionTitle: string, label: string) {
  const sectionPattern = new RegExp(`<h2>\\s*${escapeRegex(sectionTitle)}\\s*<\\/h2>[\\s\\S]*?<ul>([\\s\\S]*?)<\\/ul>`, 'i')
  const sectionMatch = html.match(sectionPattern)
  if (!sectionMatch) return ''

  const itemPattern = new RegExp(`<h3>\\s*${escapeRegex(label)}\\s*<\\/h3>\\s*([\\s\\S]*?)<\\/li>`, 'i')
  const itemMatch = sectionMatch[1].match(itemPattern)
  return itemMatch ? cleanText(itemMatch[1]) : ''
}

function extractHtmlUpdatedAt(html: string) {
  const match = html.match(/最後更新時間:\s*([^<(]+)/i)
  return match ? cleanText(match[1]) : ''
}

function extractHtmlNextWeekInfo(html: string) {
  const dateMatch = html.match(/<p>\s*(下週一[\s\S]*?)<\/p>/i)
  const adjustmentMatch = html.match(/預計汽油每公升:<\/p>\s*<h2>([\s\S]*?)<\/h2>/i)

  return {
    nextWeekEffectiveDate: dateMatch ? cleanText(dateMatch[1]) : '',
    nextWeekGasolineAdjustment: adjustmentMatch ? cleanText(adjustmentMatch[1]) : '',
  }
}

function parseHtmlSnapshot(html: string): GasMarketSnapshot {
  const nextWeekInfo = extractHtmlNextWeekInfo(html)

  const snapshot: GasMarketSnapshot = {
    weeklyOilPrice: extractHtmlListValue(html, '本週油價:'),
    weeklyExchangeRate: extractHtmlListValue(html, '本週匯率:'),
    changeRate: extractHtmlListValue(html, '變動幅度:'),
    nextWeekGasolineAdjustment: nextWeekInfo.nextWeekGasolineAdjustment,
    nextWeekEffectiveDate: nextWeekInfo.nextWeekEffectiveDate,
    updatedAt: extractHtmlUpdatedAt(html),
    cpc92: extractHtmlSectionValue(html, '今日中油油價', '92:'),
    cpc95: extractHtmlSectionValue(html, '今日中油油價', '95油價:'),
    cpc98: extractHtmlSectionValue(html, '今日中油油價', '98:'),
    cpcDiesel: extractHtmlSectionValue(html, '今日中油油價', '柴油:'),
    sourceUrl: SOURCE_URL,
  }

  if (!snapshot.weeklyOilPrice || !snapshot.weeklyExchangeRate || !snapshot.changeRate || !snapshot.nextWeekGasolineAdjustment) {
    throw new Error('無法解析油價網站 HTML 資料')
  }

  return snapshot
}

function extractMarkdownValue(markdown: string, label: string) {
  const pattern = new RegExp(`###\\s*${escapeRegex(label)}\\s*\\n+([^\\n]+)`, 'i')
  const match = markdown.match(pattern)
  return match ? cleanText(match[1]) : ''
}

function extractMarkdownSectionValue(markdown: string, sectionTitle: string, label: string) {
  const sectionPattern = new RegExp(`##\\s*${escapeRegex(sectionTitle)}([\\s\\S]*?)(?:##\\s|$)`, 'i')
  const sectionMatch = markdown.match(sectionPattern)
  if (!sectionMatch) return ''

  const itemPattern = new RegExp(`###\\s*${escapeRegex(label)}\\s*\\n+([^\\n]+)`, 'i')
  const itemMatch = sectionMatch[1].match(itemPattern)
  return itemMatch ? cleanText(itemMatch[1]) : ''
}

function extractMarkdownUpdatedAt(markdown: string) {
  const match = markdown.match(/最後更新時間:\s*([^\n]+)/i)
  return match ? cleanText(match[1]) : ''
}

function extractMarkdownNextWeekInfo(markdown: string) {
  const dateMatch = markdown.match(/(下週一[^\n]+)/i)
  const adjustmentMatch = markdown.match(/預計汽油每公升:\s*\n+\s*##\s*([^\n]+)/i)

  return {
    nextWeekEffectiveDate: dateMatch ? cleanText(dateMatch[1]) : '',
    nextWeekGasolineAdjustment: adjustmentMatch ? cleanText(adjustmentMatch[1]) : '',
  }
}

function parseMarkdownSnapshot(markdown: string): GasMarketSnapshot {
  const nextWeekInfo = extractMarkdownNextWeekInfo(markdown)

  const snapshot: GasMarketSnapshot = {
    weeklyOilPrice: extractMarkdownValue(markdown, '本週油價:'),
    weeklyExchangeRate: extractMarkdownValue(markdown, '本週匯率:'),
    changeRate: extractMarkdownValue(markdown, '變動幅度:'),
    nextWeekGasolineAdjustment: nextWeekInfo.nextWeekGasolineAdjustment,
    nextWeekEffectiveDate: nextWeekInfo.nextWeekEffectiveDate,
    updatedAt: extractMarkdownUpdatedAt(markdown),
    cpc92: extractMarkdownSectionValue(markdown, '今日中油油價', '92:'),
    cpc95: extractMarkdownSectionValue(markdown, '今日中油油價', '95油價:'),
    cpc98: extractMarkdownSectionValue(markdown, '今日中油油價', '98:'),
    cpcDiesel: extractMarkdownSectionValue(markdown, '今日中油油價', '柴油:'),
    sourceUrl: SOURCE_URL,
  }

  if (!snapshot.weeklyOilPrice || !snapshot.weeklyExchangeRate || !snapshot.changeRate || !snapshot.nextWeekGasolineAdjustment) {
    throw new Error('無法解析油價備援資料')
  }

  return snapshot
}

function isGasMarketSnapshot(value: unknown): value is GasMarketSnapshot {
  if (!value || typeof value !== 'object') return false

  const data = value as Record<string, unknown>
  return (
    typeof data.weeklyOilPrice === 'string' &&
    typeof data.weeklyExchangeRate === 'string' &&
    typeof data.changeRate === 'string' &&
    typeof data.nextWeekGasolineAdjustment === 'string'
  )
}

async function fetchFromWorkerApi(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Worker API 請求失敗: ${response.status}`)
  }

  const json = await response.json()
  if (!isGasMarketSnapshot(json)) {
    throw new Error('Worker API 回傳格式不正確')
  }

  return json
}

async function fetchFromDirectSource(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`油價來源請求失敗: ${response.status}`)
  }

  const body = await response.text()
  return body.includes('<html') ? parseHtmlSnapshot(body) : parseMarkdownSnapshot(body)
}

export async function fetchGasMarketSnapshot() {
  let lastError: unknown = null

  if (WORKER_API_URL) {
    try {
      return await fetchFromWorkerApi(WORKER_API_URL)
    } catch (error) {
      lastError = error
    }
  }

  for (const url of DIRECT_FETCH_TARGETS) {
    try {
      return await fetchFromDirectSource(url)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('無法取得油價資訊')
}
