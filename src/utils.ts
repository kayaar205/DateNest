import type { Category, ImportantDate, PlannerData } from './types'
import { CATEGORIES } from './types'

export const STORAGE_KEY = 'life-date-planner:v1'
export const REMINDER_PREFERENCES_KEY = 'datenest:reminder-preferences:v1'
export const NOTIFICATION_HISTORY_KEY = 'datenest:notification-history:v1'
export const REMINDER_OPTIONS = [30, 14, 7, 3, 1, 0] as const
export type ReminderPreferences = { days: number[] }
export const defaultReminderPreferences = (): ReminderPreferences => ({ days: [7, 1, 0] })
export function loadReminderPreferences(): ReminderPreferences { try { const data = JSON.parse(localStorage.getItem(REMINDER_PREFERENCES_KEY) || 'null'); const days = data?.days; return Array.isArray(days) ? { days: REMINDER_OPTIONS.filter(day => days.includes(day)) } : defaultReminderPreferences() } catch { return defaultReminderPreferences() } }
export function saveReminderPreferences(preferences: ReminderPreferences): void { localStorage.setItem(REMINDER_PREFERENCES_KEY, JSON.stringify(preferences)) }
export function todayISO(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
// Constructing from date parts keeps a chosen calendar day stable in every timezone.
export function parseISODate(value: string): Date { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d) }
export function toISODate(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function isValidISODate(value: unknown): value is string { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = parseISODate(value); return !Number.isNaN(date.getTime()) && toISODate(date) === value }
export function formatDate(value: string): string { return parseISODate(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) }
export function daysUntil(value: string): number { return Math.round((parseISODate(value).getTime() - parseISODate(todayISO()).getTime()) / 86400000) }
export function dateStatus(item: ImportantDate): 'upcoming' | 'today' | 'overdue' | 'completed' { if (item.completedAt) return 'completed'; const d = daysUntil(item.date); return d < 0 ? 'overdue' : d === 0 ? 'today' : 'upcoming' }
export function urgencyLabel(item: ImportantDate): string { if (item.completedAt) return 'Completed'; const days = daysUntil(item.date); if (days < 0) return 'Overdue'; if (days === 0) return 'Due today'; if (days <= 7) return 'This week'; if (days <= 30) return 'This month'; return 'Later' }
export function countdownLabel(item: ImportantDate): string { if (item.completedAt) return 'Completed'; const d = daysUntil(item.date); if (!d) return 'Due today'; const unit = Math.abs(d) === 1 ? 'day' : 'days'; return d < 0 ? `${Math.abs(d)} ${unit} overdue` : `${d} ${unit} left` }
export function attentionLabel(item: ImportantDate): string { const days = daysUntil(item.date); if (days < 0) return 'OVERDUE'; if (days === 0) return 'DUE TODAY'; if (days === 1) return 'TOMORROW'; return `${days} DAYS LEFT` }
export function reminderDaysFor(item: ImportantDate, preferences: ReminderPreferences): number[] { if (Array.isArray(item.reminderDaysList)) return item.reminderDaysList; if (typeof item.reminderDays === 'number' && Number.isInteger(item.reminderDays)) return [item.reminderDays]; return preferences.days }
export function notificationMessage(item: ImportantDate): string { const days = daysUntil(item.date); if (days === 0) return `${item.title} is due today.`; if (days === 1) return `${item.title} is due tomorrow.`; return `${item.title} is due in ${days} days.` }
export function sendDueReminders(items: ImportantDate[], preferences: ReminderPreferences): void { if (!('Notification' in window) || Notification.permission !== 'granted') return; const today = todayISO(); const history = new Set<string>(JSON.parse(localStorage.getItem(NOTIFICATION_HISTORY_KEY) || '[]')); let changed = false; items.filter(item => !item.completedAt && daysUntil(item.date) >= 0).forEach(item => reminderDaysFor(item, preferences).forEach(offset => { if (daysUntil(item.date) !== offset) return; const key = `${item.id}:${item.date}:${today}`; if (history.has(key)) return; new Notification('DateNest', { body: notificationMessage(item) }); history.add(key); changed = true })); if (changed) localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify([...history].slice(-500))) }

export function nextOccurrence(item: ImportantDate): ImportantDate {
  if (item.recurrence === 'none') return item
  const candidate = parseISODate(item.date), today = parseISODate(todayISO()), original = candidate.getDate(), originalMonth = candidate.getMonth()
  while (candidate < today) {
    if (item.recurrence === 'custom') { candidate.setDate(candidate.getDate() + Math.max(1, item.recurrenceIntervalDays || 1)); continue }
    if (item.recurrence === 'monthly') { candidate.setDate(1); candidate.setMonth(candidate.getMonth() + 1); candidate.setDate(Math.min(original, new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate())) }
    else { candidate.setFullYear(candidate.getFullYear() + 1); if (candidate.getMonth() !== originalMonth) candidate.setDate(0) }
  }
  return { ...item, date: toISODate(candidate) }
}

function validRecord(value: unknown): value is ImportantDate {
  if (!value || typeof value !== 'object') return false
  const x = value as Partial<ImportantDate>
  return typeof x.id === 'string' && typeof x.title === 'string' && x.title.trim().length > 0 && typeof x.category === 'string' && x.category.trim().length > 0 && isValidISODate(x.date) && ['none', 'monthly', 'yearly', 'custom'].includes(x.recurrence as string) && typeof x.createdAt === 'string'
}
export function validateBackup(value: unknown): ImportantDate[] | null {
  if (!value || typeof value !== 'object' || !Array.isArray((value as PlannerData).dates)) return null
  const dates = (value as PlannerData).dates
  return dates.every(validRecord) ? dates.map(d => ({ ...d, notes: d.notes || '', reminderDays: Number.isInteger(d.reminderDays) ? d.reminderDays : undefined, reminderDaysList: Array.isArray(d.reminderDaysList) ? REMINDER_OPTIONS.filter(day => d.reminderDaysList?.includes(day)) : undefined, recurrenceIntervalDays: Number.isInteger(d.recurrenceIntervalDays) && d.recurrenceIntervalDays! > 0 ? d.recurrenceIntervalDays : undefined, context: typeof d.context === 'string' ? d.context : '', tags: Array.isArray(d.tags) ? d.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 12) : [], important: d.important === true, actionUrl: typeof d.actionUrl === 'string' ? d.actionUrl : '', archived: d.archived === true, snoozedUntil: isValidISODate(d.snoozedUntil) ? d.snoozedUntil : undefined, updatedAt: d.updatedAt || d.createdAt, completedAt: typeof d.completedAt === 'string' ? d.completedAt : undefined })) : null
}
export function loadData(): ImportantDate[] { try { return validateBackup(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')) || [] } catch { return [] } }
export function saveData(dates: ImportantDate[]): void { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, dates })) }
export function uid(): string { return crypto.randomUUID() }
