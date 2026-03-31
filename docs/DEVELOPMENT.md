# Development Guide

## Setting Up Your Development Environment

### 1. Prerequisites

- **Node.js**: 18.x or higher (`node --version`)
- **npm**: 9.x or higher (`npm --version`)
- **Git**: For version control (optional)

### 2. Initial Setup

```bash
# Clone or navigate to the project directory
cd d:/downloads/vibe_coding

# Install all dependencies
npm install

# Set up environment file (copy template if needed)
# DATABASE_URL should already be set in .env
cat .env

# Initialize the database
npx prisma db push

# Seed with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

### 3. Verify Installation

Visit **http://localhost:3000** in your browser. You should see the landing page.

Try logging in with demo credentials:

- Email: `parent@example.com`
- Password: `password123`

---

## Development Workflow

### Running the Dev Server

```bash
npm run dev
```

- Runs on **http://localhost:3000**
- Hot-reloads on file changes
- Shows TypeScript errors in terminal
- Use `Ctrl+C` to stop

### Building for Production

```bash
npm run build
```

Outputs optimized bundle to `.next/` folder. Run `npm start` to serve.

### Linting

```bash
npm run lint
```

Runs ESLint across TypeScript and JSX files. Fix issues automatically:

```bash
npx eslint --fix
```

### Database Operations

```bash
# View database GUI
npx prisma studio
# Opens at http://localhost:5555

# Generate new migration (after schema changes)
npx prisma migrate dev --name descriptive_name

# Push schema changes to database
npx prisma db push

# Reset database (use with caution!)
npx prisma migrate reset

# Re-seed data
npx tsx prisma/seed.ts
```

---

## Project Architecture

### Services Layer (`/services`)

Each service encapsulates domain-specific logic:

```typescript
// Services have clear responsibilities
intake.service.ts          → Application submission workflow
review.service.ts          → Staff review & decision logic
seat-allocation.service.ts → Seat assignment logic
notification.service.ts    → Event notifications
audit.service.ts           → Audit trail queries
```

**Pattern**: Import services in API routes, call service methods, handle responses.

```typescript
// Example: app/api/applications/route.ts
import { createAdmissionApplication } from "@/services/intake.service";

// Use the service
const app = await createAdmissionApplication({
  parentId: session.user.id,
  studentName: data.studentName,
  // ... other fields
});
```

### API Routes (`/app/api`)

REST endpoints organized by resource:

```
/api/auth          → Login, register, sessions
/api/applications  → CRUD operations for applications
/api/dashboard     → Metrics and analytics
/api/notifications → Notification queries
/api/seats         → Seat management
```

**Pattern**: Route handlers call services, return JSON responses.

### Validation (`/lib/validators.ts`)

Zod schemas for all form inputs:

```typescript
// Define schema
export const admissionSchema = z.object({
  studentName: z.string().min(2),
  studentGender: z.enum(["Male", "Female", "Other"]),
  // ... more fields
});

// Use in API route
const result = admissionSchema.safeParse(data);
if (!result.success) return error(result.error);
```

---

## Adding New Features

### Example: Add a new API endpoint

1. **Create the service method** (`/services`):

```typescript
// seat-allocation.service.ts
export async function allocateSeatsToGrade(grade: number, count: number) {
  return prisma.seatAllocation.update({
    where: { grade },
    data: { totalSeats: count },
  });
}
```

2. **Create API route** (`/app/api`):

```typescript
// app/api/seats/allocate/route.ts
export async function POST(req: NextRequest) {
  const { grade, count } = await req.json();
  const seats = await allocateSeatsToGrade(grade, count);
  return NextResponse.json(seats);
}
```

3. **Use in component or form**:

```typescript
const response = await fetch("/api/seats/allocate", {
  method: "POST",
  body: JSON.stringify({ grade: 5, count: 50 }),
});
```

### Example: Add a new database model

1. **Update Prisma schema** (`/prisma/schema.prisma`):

```prisma
model FeedbackItem {
  id        String   @id @default(uuid())
  appId     String
  feedback  String
  createdAt DateTime @default(now())

  app Application @relation(fields: [appId], references: [id])
}
```

2. **Create migration**:

```bash
npx prisma migrate dev --name add_feedback_model
```

3. **Access in services**:

```typescript
const feedback = await prisma.feedbackItem.create({ data: { ... } });
```

---

## Database Schema Understanding

### Key Relationships

```
User
├─ submits → Application (one-to-many)
├─ reviews → Application (one-to-many via assignedReviewerId)
├─ creates → StaffNote (one-to-many)
└─ creates → AuditLog (one-to-many)

Application
├─ has → ScholarshipDetail (one-to-one, for scholarship type)
├─ has → SeatAssignment (one-to-one, after approval)
├─ has → StaffNote[] (one-to-many, internal notes)
└─ has → AuditLog[] (one-to-many, change history)

SeatAllocation
├─ has → SeatAssignment[] (one-to-many)
└─ tracks seats for specific grade & academic year
```

---

## Debugging Tips

### TypeScript Errors

If you see errors that don't make sense:

```bash
# Regenerate Prisma types
npx prisma generate

# Clear TypeScript cache
rm -rf .turbo
npm run build
```

### Runtime Errors

Enable debug logging in services:

```typescript
// At top of service file
const DEBUG = true;

export async function myService(id: string) {
  if (DEBUG) console.log("myService called with:", id);
  // ... logic
}
```

### Database Issues

```bash
# Check database state
npx prisma studio

# View migrations
npx prisma migrate status

# Reset everything (careful!)
rm dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

### Port Already in Use

```bash
# Find process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test path/to/file.test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Example service test:

```typescript
// __tests__/services/intake.test.ts
import { describe, it, expect } from "vitest";
import { createAdmissionApplication } from "@/services/intake.service";

describe("Intake Service", () => {
  it("should create an admission application", async () => {
    const app = await createAdmissionApplication({
      parentId: "test-user-id",
      studentName: "John Doe",
      // ... other fields
    });

    expect(app).toBeDefined();
    expect(app.studentName).toBe("John Doe");
  });
});
```

---

## Performance Optimization

### Database Queries

Always use `include/select` to avoid N+1 queries:

```typescript
// ❌ Bad - N+1 queries
const apps = await prisma.application.findMany();
for (const app of apps) {
  const parent = await prisma.user.findUnique({ where: { id: app.parentId } });
}

// ✅ Good - single query with relations
const apps = await prisma.application.findMany({
  include: { parent: true },
});
```

### Pagination

Always paginate large result sets:

```typescript
const pageSize = 20;
const page = 1;

const apps = await prisma.application.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"

**Solution**:

```bash
npx prisma generate
npm install
```

### Issue: "Database is locked"

**Solution**: Close Prisma Studio or other database connections:

```bash
# Kill all node processes
killall node

# Restart dev server
npm run dev
```

### Issue: "Type not found after schema change"

**Solution**:

```bash
npx prisma generate
npm run build
```

---

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Used by ESLint (prettier-compatible)
- **Naming**: camelCase for variables/functions, PascalCase for types
- **Comments**: Document public APIs and complex logic
- **Imports**: Organize by builtin → package → local

---

## Useful Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npm start                # Run production build
npm run lint             # Check code quality

npx prisma studio       # Database GUI
npx prisma db push      # Sync schema
npx prisma migrate dev  # Create migration
npx tsx prisma/seed.ts # Run seed script
```

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Zod Validation**: https://zod.dev

---

Feel free to reach out if you encounter any issues!
