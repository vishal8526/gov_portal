# Testing Guide

## Available commands

- `npm test` — runs the Vitest suite once
- `npm run test:coverage` — runs the suite with coverage output
- `npm run lint` — checks formatting and code quality with ESLint
- `npm run build` — verifies the production Next.js build

## What is covered

- Pure utility logic in `lib/utils.ts`
- Admission and scholarship intake flows in `services/intake.service.ts`
- Review queue and status transitions in `services/review.service.ts`
- Seat allocation helpers in `services/seat-allocation.service.ts`

## Notes

The service tests use mocked Prisma behavior, so they run quickly without requiring a live database file.
