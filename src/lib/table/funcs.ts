// ── Date formatters (inlined from /lib/dates.ts) ─────────────────────────────

function formatDate(dt: any): string {
  if (!dt) return ''
  const parsedDate = Date.parse(dt)
  if (isNaN(parsedDate)) return dt
  if (typeof dt === 'string') dt = new Date(dt)
  return new Intl.DateTimeFormat('he-IL').format(dt).replaceAll('.', '/')
}

function formatDateTime(dt: any): string {
  if (!dt) return dt
  const parsedDate = Date.parse(dt)
  if (isNaN(parsedDate)) return dt
  if (typeof dt === 'string') dt = new Date(dt)
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' })
    .format(dt)
    .replaceAll('.', '/')
}

// ── Number formatters (inlined from /lib/funcs.ts) ───────────────────────────

function formatCurrency(num: number): any {
  if (!num) num = 0
  if (isNaN(num)) return num
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function formatRoundCurrency(num: number): any {
  if (!num) num = 0
  if (isNaN(num)) return num
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatPrecent(num: number): any {
  if (!num) return '0%'
  if (isNaN(num)) return num
  return Math.round(num) + '%'
}

function formatShortCurrency(num: number): any {
  if (!num) num = 0
  if (isNaN(num)) return num
  const res = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num)
  return res + ' ₪'
}

// ── Table utilities ───────────────────────────────────────────────────────────

export function checkedIds(): number[] {
  const checkItems = document.querySelectorAll("[name='checkRow']:checked") as NodeListOf<HTMLInputElement>
  return Array.from(checkItems).map((item) => Number(item.id))
}

export function sortTable(col: string, direction: 'asc' | 'desc', data: any[]): any[] {
  return data.sort((a, b) => {
    const val1 = a[col] || '0'
    const val2 = b[col] || '0'
    if (val1 < val2) return direction === 'asc' ? -1 : 1
    if (val1 > val2) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function onCheckAll(): void {
  const checked = (document.getElementById('checkAll') as HTMLInputElement).checked
  const checkItems = document.querySelectorAll("[name='checkRow']") as NodeListOf<HTMLInputElement>
  checkItems.forEach((item) => { item.checked = checked })
}

export function getNestedValue(obj: any, keys: string): any {
  if (!keys.includes('.')) return obj ? obj[keys] : ''
  return keys.split('.').reduce((acc, key) => (acc ? acc[key] : ''), obj)
}

export const formatFuncs: { [key: string]: (value?: any, item?: any) => any } = {
  formatDate,
  formatCurrency,
  formatDateTime,
  formatPrecent,
  formatShortCurrency,
  formatRoundCurrency,
}
