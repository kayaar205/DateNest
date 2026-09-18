import type { Category, ImportantDate, PlannerData } from './types'
import { CATEGORIES } from './types'

export const STORAGE_KEY = 'life-date-planner:v1'
export function todayISO(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
// Constructing from date parts keeps a chosen calendar day stable in every timezone.
export function parseISODate(value: string): Date { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d) }
export function toISODate(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function isValidISODate(value: unknown): value is string { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = parseISODate(value); return !Number.isNaN(date.getTime()) && toISODate(date) === value }
export function formatDate(value: string): string { return parseISODate(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) }
export function daysUntil(value: string): number { return Math.round((parseISODate(value).getTime() - parseISODate(todayISO()).getTime()) / 86400000) }
export function dateStatus(item: ImportantDate): 'upcoming' | 'today' | 'overdue' { const d = daysUntil(item.date); return d < 0 ? 'overdue' : d === 0 ? 'today' : 'upcoming' }
export function countdownLabel(item: ImportantDate): string { const d = daysUntil(item.date); if (!d) return 'Due today'; const unit = Math.abs(d) === 1 ? 'day' : 'days'; return d < 0 ? `${Math.abs(d)} ${unit} overdue` : `${d} ${unit} left` }

export function nextOccurrence(item: ImportantDate): ImportantDate {
  if (item.recurrence === 'none') return item
  const candidate = parseISODate(item.date), today = parseISODate(todayISO()), original = candidate.getDate(), originalMonth = candidate.getMonth()
  while (candidate < today) {
    if (item.recurrence === 'monthly') { candidate.setDate(1); candidate.setMonth(candidate.getMonth() + 1); candidate.setDate(Math.min(original, new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate())) }
    else { candidate.setFullYear(candidate.getFullYear() + 1); if (candidate.getMonth() !== originalMonth) candidate.setDate(0) }
  }
  return { ...item, date: toISODate(candidate) }
}

function validRecord(value: unknown): value is ImportantDate {
  if (!value || typeof value !== 'object') return false
  const x = value as Partial<ImportantDate>
  return typeof x.id === 'string' && typeof x.title === 'string' && x.title.trim().length > 0 && CATEGORIES.includes(x.category as Category) && isValidISODate(x.date) && ['none', 'monthly', 'yearly'].includes(x.recurrence as string) && typeof x.createdAt === 'string'
}
export function validateBackup(value: unknown): ImportantDate[] | null {
  if (!value || typeof value !== 'object' || !Array.isArray((value as PlannerData).dates)) return null
  const dates = (value as PlannerData).dates
  return dates.every(validRecord) ? dates.map(d => ({ ...d, notes: d.notes || '', reminderDays: Number.isInteger(d.reminderDays) ? d.reminderDays : undefined, updatedAt: d.updatedAt || d.createdAt })) : null
}
export function loadData(): ImportantDate[] { try { return validateBackup(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')) || [] } catch { return [] } }
export function saveData(dates: ImportantDate[]): void { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, dates })) }
export function uid(): string { return crypto.randomUUID() }
