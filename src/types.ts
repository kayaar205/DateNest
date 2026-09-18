export const CATEGORIES = ['Work', 'Documents', 'Travel', 'Vehicle', 'Finance', 'Rent', 'Subscription', 'Warranty', 'Personal', 'Events', 'Other'] as const
export type Category = typeof CATEGORIES[number]
export type Recurrence = 'none' | 'monthly' | 'yearly'
export type DateStatus = 'upcoming' | 'today' | 'overdue'

export interface ImportantDate {
  id: string
  title: string
  category: Category
  date: string // Calendar date in YYYY-MM-DD form (never a UTC timestamp).
  notes?: string
  reminderDays?: number
  recurrence: Recurrence
  createdAt: string
  updatedAt: string
}

export interface PlannerData { version: 1; dates: ImportantDate[] }
