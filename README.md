# Government School Admission & Scholarship Portal

A modern, full-stack application for managing school admissions and scholarship applications. Built with Next.js 16, Prisma 7, TypeScript, and a sophisticated service-layer architecture.

## 🎯 Overview

This portal enables **parents** to apply for school admissions and scholarships, while **education staff** review applications, assess eligibility, allocate seats, and track decisions with a complete audit trail.

**Key Features:**

- 📋 Multi-step application forms with validation
- 👥 Role-based access (Parent, Staff, Admin)
- 📊 Intelligent priority scoring for applications
- 💰 Scholarship eligibility auto-checking
- 🎓 Seat allocation & management by grade
- 🔔 Real-time notifications
- 📝 Internal notes & staff collaboration
- 🔐 Full audit trail for compliance
- 📱 Responsive mobile-friendly design

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (with npm)
- SQLite (included)

### Installation & Setup

```bash
# Install dependencies
npm install

# Initialize database
npx prisma db push

# Seed with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Credentials

```
Parent:  parent@example.com / password123
Staff:   reviewer@govschool.edu.in / password123
Admin:   admin@govschool.edu.in / password123
```

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # REST API endpoints
│   ├── parent/            # Parent dashboard & forms
│   ├── staff/             # Staff review portal
│   ├── login/             # Auth page
│   └── page.tsx           # Landing page
│
├── services/              # Business logic layer
│   ├── intake.service.ts
│   ├── review.service.ts
│   ├── seat-allocation.service.ts
│   ├── notification.service.ts
│   └── audit.service.ts
│
├── lib/                   # Utilities
│   ├── prisma.ts
│   ├── auth.ts
│   ├── validators.ts
│   └── utils.ts
│
├── prisma/                # Database
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── styles/                # Global CSS & design system
└── docs/                  # Detailed documentation
```

---

## 🏗️ Architecture

**Service-Oriented Design** — Business logic is organized into focused services that handle specific domains (intake, review, seats, notifications, audit). This enables:

- ✅ Independent testing
- ✅ Easy to understand code flow
- ✅ Trivial extraction to microservices later
- ✅ Maintainable and scalable structure

**Tech Stack:**

- React 19 + Next.js 16 (App Router)
- Prisma 7 + SQLite
- TypeScript + Zod validation
- Cookie-based authentication
- CSS Modules + design system

---

## 🔑 Core Features

### Parent Portal

✅ Submit admission or scholarship applications  
✅ Track application status with timeline  
✅ View detailed feedback & decisions  
✅ Receive notifications for updates

### Staff Portal

✅ Review queue with filtering & sorting  
✅ Priority scoring auto-calculation  
✅ Approve/reject with internal notes  
✅ Bulk actions for efficiency  
✅ Seat allocation management

### Advanced

✅ Scholarship eligibility auto-checks  
✅ Complete audit trail  
✅ Internal collaboration notes  
✅ Event-driven notifications  
✅ Analytics dashboard

---

## 🧪 Testing & Verification

```bash
npm run build             # Production build
npm run lint              # ESLint check
npm run dev               # Development server
npm test                  # Run tests (when configured)
```

---

## 📚 Documentation

- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Dev setup and troubleshooting
- **[FEATURES.md](docs/FEATURES.md)** — Detailed feature documentation
- **[DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md)** — Design system & components
- **[BUSINESS_CONTEXT.md](docs/BUSINESS_CONTEXT.md)** — Domain knowledge & business logic

---

## 🚢 Deployment

```bash
npm run build   # Builds production-optimized bundle
npm start       # Runs production server on port 3000
```

Set environment variables in `.env`:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

---

## 📞 Support

Check the `/docs` folder for comprehensive guides and implementation details.

---

**Built with ❤️ using Next.js 16, Prisma 7, and TypeScript**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
