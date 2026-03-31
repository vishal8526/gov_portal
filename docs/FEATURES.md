# Features Documentation

## Complete Feature Overview

This document describes every feature in the Government School Admission & Scholarship Portal, including user workflows, technical implementation, and validation rules.

---

## 1. Authentication & Session Management

### Login Screen

**Path**: `/login`

Users can toggle between Login and Registration modes.

#### Login Flow

1. User enters email and password
2. System authenticates against stored hash
3. HttpOnly session cookie is created
4. User is redirected based on role:
   - **PARENT** → `/parent/dashboard`
   - **STAFF** → `/staff/dashboard`
   - **ADMIN** → `/staff/dashboard`

#### Registration Flow

1. User selects role (Parent/Staff)
2. System validates email uniqueness
3. Password is hashed with bcrypt (12 rounds)
4. User account is created
5. Session is created automatically

#### Demo Credentials (Pre-seeded)

```
Parent:  parent@example.com / password123
Staff:   reviewer@govschool.edu.in / password123
Admin:   admin@govschool.edu.in / password123
```

#### Technical Details

- **Authentication**: Cookie-based with Base64 encoded session data
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Session Expiry**: 7 days
- **Cookie Flags**: HttpOnly, SameSite=Lax, Secure (production)

---

## 2. Parent Portal Features

### 2.1 Dashboard (`/parent/dashboard`)

**Purpose**: Overview of all submitted applications and quick actions

**Features**:

- Full list of parent's applications with status
- Color-coded status badges
- Quick action buttons for each app
- Link to apply for new admission/scholarship
- Application count summary

**Application Card shows**:

- Student name and grade
- Application type (Admission/Scholarship)
- Current status with color indicator
- Submission and review dates
- Seat assignment status (if approved)

**Database Query**:

```typescript
applications = await prisma.application.findMany({
  where: { parentId: session.user.id },
  include: { scholarshipDetail: true, seatAssignment: true },
  orderBy: { createdAt: "desc" },
});
```

---

### 2.2 Submission: Admission Form (`/parent/apply/admission`)

**Purpose**: Submit admission application

**Fields**:

```
Student Information:
├─ Student Name (required, 2-100 chars)
├─ Date of Birth (required)
├─ Gender (required: Male/Female/Other)
├─ Grade Applying For (required: 1-12)
└─ Previous School (optional)

Academic Information:
├─ Previous Grade/Percentage (optional, 0-100%)
└─ Family Income (optional, ₹)

Contact Information:
├─ Address (required, 5-500 chars)
├─ Phone Number (required, 10-15 digits)
```

**Validation**: Zod schema in `lib/validators.ts`

**Processing**:

1. Form data validated client-side
2. Submitted to `POST /api/applications`
3. Service calculates priority score
4. Application created with `SUBMITTED` status
5. Audit log entry created
6. Parent notification sent

**Priority Score Calculation**:

- Base score: 0
- Income < ₹1L: +30 points
- Income < ₹2.5L: +20 points
- Grade >80%: +10 points
- Early submission bonus: up to +10 points
- **Result**: Score out of 100

---

### 2.3 Submission: Scholarship Form (`/parent/apply/scholarship`)

**Purpose**: Apply for scholarship with eligibility pre-checks

**Extends Admission Form with**:

```
Scholarship Information:
├─ Scholarship Type (MERIT/NEED_BASED/SPORTS/SPECIAL_CATEGORY)
├─ Category (GENERAL/SC/ST/OBC/EWS)
├─ Achievements (optional, up to 1000 chars)
├─ BPL Certificate (yes/no)
└─ Income Certificate (yes/no)

Income Requirement:
└─ Family Income (REQUIRED for scholarships)
```

**Eligibility Pre-checks**:
The system automatically evaluates eligibility based on:

- **MERIT**: Grade percentage ≥ 80%
- **NEED_BASED**: Income < ₹2,50,000 AND has income certificate
- **SPORTS**: Has achievements listed
- **SPECIAL_CATEGORY**: Belongs to SC/ST/EWS/OBC with category certificate

**Real-time Feedback**:

- ✅ Eligible for selected scholarship type
- ⚠️ Needs additional documents
- ❌ Does not meet criteria

---

### 2.4 Application Detail View (`/parent/application/[id]`)

**Purpose**: Track progress and view full application details

**Left Column—Details**:

- Student information (name, DOB, gender, grade)
- Contact and address
- Family income

**Right Column—Timeline**:

- Status history with timestamps
- Who changed status and why
- Seat assignment details (if approved)

**Scholarship Details** (if applicable):

- Type, category, eligibility status
- Uploaded documents status
- Eligibility notes from staff

**Read-only Notes Section**:

- Internal staff notes (if any)
- Professional feedback to parent

---

### 2.5 Notifications Dashboard (`/parent/notifications`)

**Purpose**: View all notifications and updates

**Badge**: Shows unread count in navigation

**Notification Types**:

- ✅ `SUCCESS` — Application submitted, approved
- ⚠️ `WARNING` — Additional documents needed
- ℹ️ `INFO` — Status changed
- ❌ `ERROR` — Application rejected (with reason)

**Each Notification Shows**:

- Title and message
- Application ID
- Timestamp (relative)
- Mark as read button
- Link to application

---

## 3. Staff Portal Features

### 3.1 Dashboard (`/staff/dashboard`)

**Purpose**: Overview of system metrics and activity

**Metrics Cards**:

```
📊 Total Applications  │ 342
🔄 Under Review        │ 45
✅ Approved            │ 189
❌ Rejected            │ 78
⏳ Waitlisted          │ 30
```

**Recent Activity Feed**:

- Last 20 actions across system
- Shows who did what and when
- Links to applications

---

### 3.2 Review Queue (`/staff/review`)

**Purpose**: Prioritized list of applications for review

**Filtering & Sorting**:

```
Filters:
├─ Status (All, Submitted, Under Review, etc.)
├─ Type (All, Admission, Scholarship)
├─ Grade (All, 1-12)
└─ Text search (student name, email, ID)

Sort Options:
├─ Priority Score (default, descending)
├─ Submission Date (newest first)
├─ Grade Applying (ascending)
└─ Student Name (A-Z)
```

**Application Queue Card Shows**:

- Student name and applying grade
- Application type badge
- Current priority score (visual indicator)
- Parent name and email
- Status badge with color
- Number of internal notes
- Assigned reviewer (if any)

**Quick Actions**:

- ✏️ Open for detailed review
- 📌 Assign to yourself
- 🏷️ Add tag (internal notes)

**Bulk Actions** (select multiple):

- ✅ Approve all selected
- ❌ Reject all selected
- ⏳ Waitlist selected
- 👤 Assign reviewer

---

### 3.3 Detailed Review (`/staff/review/[id]`)

**Purpose**: In-depth review of single application

**Left Panel—Application Data**:

- Full student information
- Academic history
- Family income (if scholarship)
- Scholarship details & eligibility

**Right Panel—Actions**:

```
Status Update:
├─ Current Status: [badge]
├─ New Status: [dropdown]
│  ├─ UNDER_REVIEW
│  ├─ APPROVED
│  ├─ REJECTED
│  └─ WAITLISTED
└─ Note (optional)

Reviewer Assignment:
├─ Currently assigned to: [name]
└─ Assign to: [staff list]
```

**Seat Assignment** (if approved):

```
Grade Availability:
├─ Grade 5: 45/50 seats available
├─ Grade 7: 12/40 seats available
└─ Grade 10: 0/30 (FULL)

Allocation:
├─ Reserve seat in: [grade]
└─ Confirm assignment
```

**Internal Notes Section**:

- Read all internal notes
- No parent visibility
- Add new note (text editor)
- Notes are audit-logged

**Audit Trail**:

- Complete history of all changes
- Who changed what and when
- Before/after values for key fields

---

### 3.4 Seat Allocation Manager (`/staff/seats`)

**Purpose**: Manage capacity and allocation by grade

**Seats by Grade**:

```
Grade │ Total │ Allocated │ Available │ Utilization
------|-------|-----------|-----------|------------
  1   │  50   │    42     │     8     │    84%
  2   │  50   │    45     │     5     │    90%
  3   │  48   │    48     │     0     │   100%
  4   │  50   │    38     │    12     │    76%
  5   │  60   │    52     │     8     │    87%
  6   │  60   │    45     │    15     │    75%
  7   │  65   │    60     │     5     │    92%
  8   │  65   │    54     │    11     │    83%
  9   │  70   │    68     │     2     │    97%
 10   │  65   │    65     │     0     │   100%
 11   │  55   │    45     │    10     │    82%
 12   │  55   │    48     │     7     │    87%
```

**Actions**:

- 📝 Edit total seats per grade
- 👤 View applications assigned to each grade
- 📊 Export seat report
- 🔄 Auto-allocate based on priority

**Assignment Workflow**:

1. Staff reviews approved applications
2. System suggests grade based on application submitted grade
3. Staff confirms or adjusts grade
4. Student receives notification of seat assignment
5. Audit log records the allocation

---

## 4. Advanced Features

### 4.1 Priority Scoring System

**Automatic Calculation** when application is submitted:

```
Base: 0 points

Income (Family Welfare Factor):
├─ < ₹1,00,000                          → +30
├─ ₹1,00,000 - ₹2,50,000               → +20
├─ ₹2,50,000 - ₹5,00,000               → +10
└─ > ₹5,00,000                          → 0

Category (Reservation Factor):
├─ SC/ST/EWS                            → +20
├─ OBC                                  → +10
└─ GENERAL                              → 0

Academic Performance:
├─ ≥ 90%                                → +15
├─ ≥ 80%                                → +10
├─ ≥ 70%                                → +5
└─ < 70%                                → 0

Application Type:
├─ SCHOLARSHIP                          → +10
└─ ADMISSION                            → 0

Early Submission Bonus:
└─ Max +10, decays by 1 point per day

TOTAL POSSIBLE SCORE: 100 points
```

**Staff Notes**: Can adjust priority if special circumstances exist (with audit trail).

---

### 4.2 Scholarship Eligibility Engine

Automatically evaluates applications against criteria:

```
MERIT Scholarship:
├─ Grade ≥ 80%                          ✓/✗
├─ Category (any)                       ✓
└─ Result: ELIGIBLE or NOT ELIGIBLE

NEED_BASED Scholarship:
├─ Family Income ≤ ₹2,50,000           ✓/✗
├─ Income Certificate provided          ✓/✗
└─ Result: ELIGIBLE, INELIGIBLE, or NEEDS_DOCS

SPORTS Scholarship:
├─ Has achievements documented          ✓/✗
├─ Grade ≥ 70%                          ✓/✗
└─ Result: ELIGIBLE, INELIGIBLE, or PENDING_REVIEW

SPECIAL_CATEGORY Scholarship:
├─ Category (SC/ST/OBC/EWS)            ✓/✗
├─ Category Certificate                 ✓/✗
└─ Result: ELIGIBLE or NOT ELIGIBLE
```

**Status Indicators**:

- 🟢 ELIGIBLE — Auto-approved for next step
- 🟡 PENDING — Manual review required
- 🔴 NOT ELIGIBLE — Requires manual override to proceed

---

### 4.3 Audit Trail & Compliance

**What Gets Logged**:

- ✓ Application creation
- ✓ Status changes (with reason)
- ✓ Staff assignments
- ✓ Eligibility determinations
- ✓ Seat assignments
- ✓ Note additions
- ✓ Deletions (if allowed)

**Audit Entry Contains**:

```
{
  id: "uuid",
  entityType: "APPLICATION",
  entityId: "app-uuid",
  action: "STATUS_CHANGED",
  changedBy: { name: "Rajesh Kumar", role: "STAFF" },
  oldValue: { status: "SUBMITTED" },
  newValue: { status: "APPROVED" },
  description: "Approved for grade 5 | Seat allocated",
  timestamp: "2026-03-31T10:30:00Z"
}
```

**Parent Access**:

- Can see their application timeline
- Cannot see internal staff notes
- Cannot see rejection reasons (unless explicitly provided)

**Staff Access**:

- Full audit trail for all applications
- Filters by date range, action type, user
- Export audit reports

---

### 4.4 Internal Collaboration Notes

**Staff Notes Features**:

- ✄ Private notes visible only to staff
- 👤 Attributed to specific staff member
- 🕐 Timestamped
- 🔒 Not visible to parents
- 📝 Support rich text formatting
- 🔍 Searchable

**Example Uses**:

```
"Flagged for manual review - income documentation unclear"
"Scholarship eligible but borderline. Recommend SPORTS scholarship instead."
"Student is sibling of existing student (2022). Consider legacy priority."
```

---

### 4.5 Notification System

**Events That Trigger Notifications**:
| Event | Recipient | Message |
|-------|-----------|---------|
| Application Submitted | Parent | "Your admission application has been submitted" |
| Status Changed | Parent | "Your application status is now APPROVED" |
| Seat Assigned | Parent | "Congratulations! Seat assigned in Grade 5" |
| Application Rejected | Parent | "Unfortunately, your application was not approved" |
| Needs Review | Staff | "5 new applications submitted for review" |
| Eligibility Check | Staff | "2 scholarship applications need manual review" |

**Notification Preferences** (future enhancement):

- Email notifications
- SMS alerts
- Push notifications
- Quiet hours

---

## 5. Data Validation

### Form Validations

**All inputs validated with Zod schemas**:

```typescript
// Admission Form
studentName: string (min: 2, max: 100)
studentDob: ISO date
studentGender: enum ('Male', 'Female', 'Other')
gradeApplying: number (1-12, integer)
phone: string (10-15 digits)
familyIncome: number (≥ 0, optional)

// Scholarship Form
scholarshipType: enum (MERIT, NEED_BASED, SPORTS, SPECIAL_CATEGORY)
category: enum (GENERAL, SC, ST, OBC, EWS)
bplCertificate: boolean
incomeCertificate: boolean
```

### Database Constraints

```
Users
├─ email: UNIQUE NOT NULL
└─ passwordHash: NOT NULL

Applications
├─ parentId: NOT NULL (references Users)
├─ studentName: NOT NULL
├─ status: NOT NULL (verified against enum)
├─ type: NOT NULL (ADMISSION or SCHOLARSHIP)
└─ unique(parentId, studentName, studentDob) - one app per student per parent

ScholarshipDetail
├─ applicationId: UNIQUE NOT NULL
└─ scholarshipType: NOT NULL
```

---

## 6. API Endpoints Reference

### Authentication

```
POST   /api/auth           Login or Register
POST   /api/auth/logout    Logout (clear session)
GET    /api/auth/session   Get current session
```

### Applications

```
GET    /api/applications            List applications (role-based)
POST   /api/applications            Create new application
GET    /api/applications/[id]       Get single application
PATCH  /api/applications/[id]       Update status/notes
POST   /api/applications/bulk       Bulk actions
```

### Management

```
GET    /api/dashboard      Get dashboard metrics
GET    /api/seats          Get seat allocations
PATCH  /api/seats          Update seat capacity
GET    /api/notifications  Get user notifications
```

---

## 7. User Workflows

### Parent Workflow

```
1. Register/Login
2. Dashboard
   a. Create admission application
   b. OR create scholarship application
3. Track application status
4. Receive notifications
5. View decision and seat assignment (if approved)
```

### Staff Workflow

```
1. Login to staff/admin account
2. View dashboard metrics
3. Review queue
   a. Filter and search
   b. View applications by priority
4. Select application
5. Detailed review
   a. Add internal notes
   b. Check scholarship eligibility
6. Make decision
   a. Approve → Assign seat
   b. Reject → Send reason
   c. Waitlist → Mark for future consideration
7. Bulk actions for efficiency
8. Check audit trail
```

---

## Support & Questions

For detailed implementation of each feature, see the corresponding service file in `/services/`.
