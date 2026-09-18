# DateNest — MVP

A local-first React + TypeScript MVP for tracking important dates.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Included

- Dashboard with overdue/today/7-day/30-day views
- Generic Add Important Date form
- Categories, notes, reminder preferences
- Monthly/yearly/custom recurrence
- Countdown and overdue calculations
- Calendar view
- Search, filter, nearest-date sorting
- JSON export/import
- Clear-all data action
- LocalStorage-only persistence
- Responsive mobile UI
- No backend, login, analytics, or server-side user data

## Deliberately not included

Actual email/push/WhatsApp delivery is not part of this local-only MVP. The reminder preferences are stored with each date so a future backend can use the same data model.

## Architecture

The core date model is isolated in `src/types.ts` and date/storage logic in `src/utils.ts`, making a future migration from LocalStorage to an API/database straightforward.
