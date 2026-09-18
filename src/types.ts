export const CATEGORIES = ['Work', 'Documents', 'Travel', 'Vehicle', 'Finance', 'Rent', 'Subscription', 'Warranty', 'Personal', 'Events', 'Other'] as const
export type Category = string
export type Recurrence = 'none' | 'monthly' | 'yearly' | 'custom'
export type DateStatus = 'upcoming' | 'today' | 'overdue' | 'completed'

export interface ImportantDate {
  id: string
  title: string
  category: Category
  date: string // Calendar date in YYYY-MM-DD form (never a UTC timestamp).
  notes?: string
  reminderDays?: number
  reminderDaysList?: number[]
  recurrenceIntervalDays?: number
  context?: string
  tags?: string[]
  important?: boolean
  actionUrl?: string
  archived?: boolean
  snoozedUntil?: string
  recurrence: Recurrence
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface PlannerData { version: 1; dates: ImportantDate[] }
