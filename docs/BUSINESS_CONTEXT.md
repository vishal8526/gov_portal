# Business Context & Domain Knowledge

## Problem Statement

Government schools in India face significant challenges in managing admissions and scholarship allocations:

1. **Manual Processes**: Paper-based applications, handwritten notes, physical files
2. **Lack of Transparency**: Parents unsure of application status
3. **Inefficient Prioritization**: Difficult to identify most deserving candidates
4. **No Audit Trail**: Compliance requirements unmet
5. **Poor Seat Allocation**: Seats often under-utilized despite high demand
6. **Delayed Decisions**: Multiple review stages with unclear workflows

**Solution**: A digital-first admission & scholarship management system with transparent workflows, intelligent prioritization, and complete audit trails.

---

## Indian Education Context

### Reservation System (Affirmative Action)

India's Constitution mandates reservations for:

- **SC** (Scheduled Castes) — 15% seats
- **ST** (Scheduled Tribes) — 7.5% seats
- **OBC** (Other Backward Classes) — 27% seats
- **EWS** (Economically Weaker Section) — 10% seats (added 2019)
- **General/Unreserved** — Remaining seats

**Our System**: Stores category and scores priority accordingly. School staff make final allocation decisions within constitutional framework.

### Scholarship Types

#### Merit-Based

- Award high-performing students (80%+ grades)
- Recognizes academic excellence
- No income restrictions
- Competitive process

#### Need-Based

- Target economically disadvantaged families (income < ₹2.5L)
- Requires income certificate
- Social mobility enabler
- Most common scholarship type

#### Sports-Based

- Reward athletic achievement
- Requires documented achievements (district/state/national level)
- Incentivizes physical development
- Often merit + sports combined

#### Special Category

- For reserved categories (SC/ST/OBC/EWS)
- May include geographic quotas
- Regional priorities vary
- Compliance with reservation policy

---

## System Design Principles

### 1. Transparency

- Parents see real-time application status
- Clear criteria for decisions
- Feedback on rejections
- Timeline visibility

### 2. Fairness

- Automated priority scoring (removes bias)
- Multiple reviewers for high-value decisions
- Appeal mechanism (future)
- Equal access for all applicants

### 3. Efficiency

- Bulk operations for staff
- Smart filtering and search
- One-click decisions
- Automated notifications

### 4. Compliance

- Complete audit trail
- Never-deleted records
- Role-based access control
- Data retention policies

### 5. Scalability

- Handle 1000s of applications
- Grade-wise management
- Multiple academic years
- Historical data retention

---

## Priority Scoring Algorithm

### Purpose

Automatically rank applications to help staff focus on most deserving candidates first.

### Factors (100-point scale)

#### 1. Socio-Economic Factor (30 points)

```
Family Income:
├─ < ₹1,00,000 (BPL - Below Poverty Line)     → 30 points ⭐⭐⭐
├─ ₹1,00,000 - ₹2,50,000 (Low Income)        → 20 points ⭐⭐
├─ ₹2,50,000 - ₹5,00,000 (Middle Income)     → 10 points ⭐
└─ > ₹5,00,000 (Upper Income)                → 0 points

Rationale: Government schools primarily serve economically disadvantaged
families. Lower-income families face more barriers to quality education.
```

#### 2. Social Category Factor (20 points)

```
Reserved Category:
├─ SC/ST/EWS (Constitutionally protected)     → 20 points ⭐⭐
├─ OBC (Backward but not most protected)      → 10 points ⭐
└─ General/Unreserved                         → 0 points

Rationale: Historical discrimination has created generational disparities.
Protected categories need support to reach equal education status.
```

#### 3. Academic Preparedness Factor (15 points)

```
Previous Grade/Percentage:
├─ ≥ 90% (Excellent)                         → 15 points ⭐⭐
├─ ≥ 80% (Good)                              → 10 points ⭐
├─ ≥ 70% (Satisfactory)                      → 5 points
└─ < 70%                                     → 0 points

Rationale: Strong previous performance predicts success. Helps with
admission standards while being fair to under-resourced students.
```

#### 4. Application Type Factor (10 points)

```
Scholarship vs Admission:
├─ SCHOLARSHIP                               → 10 points ⭐
└─ ADMISSION                                 → 0 points

Rationale: Scholarship seekers are actively pursuing support, indicate
higher motivation. Separate pipeline.
```

#### 5. Early Submission Bonus (10 points, decaying)

```
Days Since Submission:
├─ 0 days (submitted today)                  → 10 points
├─ 1-5 days                                  → 9-5 points
├─ 6-10 days                                 → 4-0 points
└─ > 10 days                                 → 0 points

Rationale: Encourages timely submission. Decays to not overly penalize
students who submit later but are still qualifying.
```

### Score Ranges & Interpretation

```
90-100  High Priority   Need immediate review
        [████████████████] High socio-economic need + excellence
        Example: SC student, BPL income, 85%, scholarship

70-89   Medium-High     Review within week
        [████████████   ] Above-average need/merit combination
        Example: OBC student, needs-based scholarship

50-69   Medium          Review by deadline
        [████████       ] Moderate factors
        Example: General category, middle income

30-49   Low-Medium      Review if capacity allows
        [█████          ] Few high-priority factors
        Example: Upper income, high marks

< 30    Low Priority    Review last
        [            ] Only lowest need/merit indicators
        Example: Very high income, moderate grades
```

### Why This Algorithm?

✅ **Transparent**: Parents understand why they're prioritized
✅ **Fair**: Removes personal bias from ranking
✅ **Defensible**: Based on government policy objectives
✅ **Flexible**: School can override with justification
✅ **Explainable**: Staff can articulate reasons to parents

---

## Scholarship Eligibility Rules

### MERIT Scholarship

**Eligibility Criteria**:

- Previous academic performance ≥ 80%
- Any income level (no restrictions)
- Any category

**Approval**: Nearly automatic if criteria met (staff spot-check)

**Typical Award**: Books, supplies, optional fee waiver

**Rationale**: Recognize academic excellence; incentivize hard work

### NEED-BASED Scholarship

**Eligibility Criteria**:

- Family income < ₹2,50,000/year
- Must provide income certificate
- Any academic level (no minimum grade)
- Any category

**Approval**: Staff reviews income cert authenticity; may request additional docs

**Typical Award**: Fee waiver, meal allowance, uniform support

**Rationale**: Help economically disadvantaged but motivated students

### SPORTS Scholarship

**Eligibility Criteria**:

- Documented athletic achievement (district/state/national level)
- Grade ≥ 70% (minimum academic standard)
- No income restrictions
- Any category

**Approval**: Sports committee reviews certificates; may require trials

**Typical Award**: Equipment, coaching, competition fees, hostel support

**Rationale**: Develop athletic talent; balance academic and physical development

### SPECIAL CATEGORY Scholarship

**Eligibility Criteria**:

- Belong to SC/ST/OBC/EWS category
- Provide category certificate
- No income restrictions
- No grade minimums

**Approval**: Verify certificate authenticity; may request additional docs

**Typical Award**: Full fee waiver, supplies, hostel support if applicable

**Rationale**: Constitutional obligation; remove barriers for reserved categories

---

## Seat Allocation Process

### Step 1: Capacity Planning

School determines seats available per grade:

```
Grade 1:  50 seats (typical starter class size)
Grade 2:  50 seats
...
Grade 10: 65 seats (may vary based on infrastructure)
```

### Step 2: Application Review

Staff reviews applications in priority order (via queue).

### Step 3: Decision Making

For each application:

```
❌ REJECT  → Low priority, no capacity, poor grades
⏳ WAITLIST → Good candidate, no seats currently
✅ APPROVE → Meets criteria, seat available
```

### Step 4: Seat Assignment

Upon approval:

- System suggests student's requested grade
- Staff confirms or changes grade based on:
  - Availability
  - Student's profile fit
  - Balanced class composition
- Seat marked as allocated
- Parent receives notification

### Step 5: Confirmation

- Parent receives seat assignment letter
- Student name added to roster
- Seat marked confirmed
- Can be released only with school approval (if student doesn't join)

---

## Workflow: From Application to Enrollment

```
Day 1: SUBMISSION
  Parent submits application
  ├─ System validates data
  ├─ Calculates priority score
  ├─ Creates audit log entry
  └─ Sends confirmation notification

Days 2-7: REVIEW
  Staff reviews in priority order
  ├─ Reads application details
  ├─ Checks scholarship eligibility
  ├─ Reviews internal notes
  ├─ Makes decision (with reason)
  └─ Updates status

Decision: APPROVED
  System allocates seat
  ├─ Finds available seat in requested grade
  ├─ Assigns seat to application
  ├─ Creates audit entry
  ├─ Notifies parent of approval
  └─ Sends seat assignment details

Decision: REJECTED
  System records rejection
  ├─ Records reason for future reference
  ├─ Creates audit entry
  ├─ Notifies parent
  └─ Suggests next steps (appeal, reapply next year)

Decision: WAITLISTED
  Application held for future decisions
  ├─ Can be approved when seat opens
  ├─ Can be rejected later
  ├─ Parent notified of waitlist status
  └─ No immediate action needed

Parent Confirms: YES
  Enrollment completed
  ├─ Seat marked CONFIRMED
  ├─ Student added to class roster
  ├─ Generate enrollment letter
  └─ Record in permanent database

Parent Confirms: NO
  Seat released
  ├─ Seat marked available again
  ├─ Can be assigned to waitlisted candidate
  ├─ Notification sent to next in priority
  └─ Audit entry created
```

---

## Compliance & Audit Requirements

### Legal Context

- **Right to Education Act, 2009**: Free, compulsory education to age 14
- **Reservation Policy**: Constitutional mandates for SC/ST/OBC/EWS
- **Grade Promotion Rules**: Autonomous schools can set own admission criteria
- **Annual Reporting**: Schools must report admissions data to education department

### Our System Ensures

✅ Complete audit trail of all decisions
✅ No information loss (immutable logs)
✅ Clear decision rationale
✅ Reversibility for corrections
✅ Role-based access to sensitive data
✅ Data retention for compliance period

### Audit Log Contents

```
{
  entityType: "APPLICATION",
  action: "STATUS_CHANGED",
  changedBy: "Rajesh Kumar (Reviewer)",
  oldValue: { status: "SUBMITTED" },
  newValue: { status: "APPROVED" },
  description: "Approved for Grade 5 | Merit scholarship eligible",
  timestamp: "2026-03-31T10:30:00Z",
  reason: "Strong academic performance, meets all criteria"
}
```

---

## Data Privacy & Security

### Data Classification

```
Public:
  ├─ School name, location
  ├─ General admission criteria
  └─ Scholarship deadlines

Confidential:
  ├─ Student personal information
  ├─ Family income details
  ├─ Academic records
  └─ Eligibility details

Staff-Only:
  ├─ Internal notes
  ├─ Reviewer recommendations
  ├─ Audit logs
  └─ Decision rationale
```

### Access Control

- **Parents**: Can view only their own applications
- **Staff**: Can view applications assigned to them + own submissions
- **Admins**: Full system access with full audit compliance
- **No one**: Can modify or delete audit logs

### Future Enhancements

- [ ] Two-factor authentication
- [ ] Encrypted sensitive fields
- [ ] Right to be forgotten (with audit trail preservation)
- [ ] Data export for parents
- [ ] GDPR compliance for international access

---

## Business Metrics

### Key Performance Indicators

```
📊 Application Metrics
├─ Total applications received
├─ Approval rate (apps approved / total)
├─ Rejection rate
├─ Average review time (days)
└─ Queue wait time (days to first review)

💰 Seat Utilization
├─ Capacity vs actual enrollment
├─ Seats filled per grade
├─ Waitlist depth per grade
└─ Acceptance rate (approved vs offered)

🎓 Scholarship Metrics
├─ % of students on scholarship
├─ Merit vs need-based breakdown
├─ % of reserved category students
└─ Scholarship disbursement

👥 Process Efficiency
├─ Avg decisions per reviewer per day
├─ Decision turnaround time
├─ Manual interventions required
└─ System uptime %
```

---

## Future Enhancements

### Phase 2: Automation & Intelligence

- [ ] AI-powered ranking refinement
- [ ] Predictive performance scoring
- [ ] Automated eligibility verification
- [ ] Document OCR for certificates

### Phase 3: Communication & Engagement

- [ ] SMS notifications
- [ ] Email digests
- [ ] Parent portal customization
- [ ] Multilingual support (Hindi, regional)

### Phase 4: Integration & Analytics

- [ ] DISE (district education) data integration
- [ ] District-wide consolidated reporting
- [ ] Predictive enrollment modeling
- [ ] Long-term student outcome tracking

### Phase 5: Democratization

- [ ] Mobile app for parents
- [ ] Kiosk-based registration
- [ ] AEPS (biometric) payment integration
- [ ] Accessibility for students with disabilities

---

## Change Log

- **v1.0** (Current): Initial system launch with core features
- **v1.1** (Planned): Bulk operations, advanced filtering
- **v1.2** (Planned): Analytics dashboard
- **v2.0** (Planned): Mobile app, AI ranking

---

## Support & Questions

This domain knowledge informs all feature decisions. When in doubt about why something works a certain way, refer to this document and the government education policy context.

Questions? Check `/docs/` or reach out to the system administrators.
