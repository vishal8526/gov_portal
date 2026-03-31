# Design Philosophy & UI System

## Design Principles

### 1. Clarity Over Aesthetics

- Clear hierarchy and navigation
- Obvious call-to-action buttons
- Minimize cognitive load
- Government audiences prefer simplicity

### 2. Accessibility First

- High contrast ratios (WCAG AA standard)
- Keyboard navigation support
- Screen reader friendly
- Readable font sizes (≥ 14px body text)
- Color-blind safe palette

### 3. Efficiency

- Minimal clicks to complete tasks
- Lazy loading for performance
- Mobile-first responsive design
- Fast load times (< 2s target)

### 4. Professional & Trustworthy

- Clean, minimal design
- Professional typography
- Consistent spacing and alignment
- Government-appropriate aesthetics

### 5. Data-Driven

- Show relevant information first
- Reduce clutter
- Prioritize content based on user role
- Clear visual hierarchy

---

## Color Palette

### Primary Colors

| Color       | Hex       | Usage                        | Accessibility                   |
| ----------- | --------- | ---------------------------- | ------------------------------- |
| **Navy**    | `#0f172a` | Primary actions, headers     | Deep, trustworthy, professional |
| **Emerald** | `#10b981` | Success, approval, positive  | WCAG AA contrast on white       |
| **Amber**   | `#f59e0b` | Warnings, pending, attention | High visibility for cautions    |

### Semantic Colors

| Use         | Hex       | Component                | Example       |
| ----------- | --------- | ------------------------ | ------------- |
| **Success** | `#34d399` | Status badge, checkmarks | ✅ Approved   |
| **Error**   | `#f87171` | Errors, rejections       | ❌ Rejected   |
| **Info**    | `#60a5fa` | Informational messages   | ℹ️ Note added |
| **Muted**   | `#9ca3af` | Disabled, secondary text | Pending       |

### Neutral Grays

| Use                | Hex       | Component                  |
| ------------------ | --------- | -------------------------- |
| **Text Primary**   | `#111827` | Body text, headings        |
| **Text Secondary** | `#6b7280` | Secondary text, hints      |
| **Border**         | `#d1d5db` | Input borders, dividers    |
| **Background**     | `#f3f4f6` | Card backgrounds, sections |
| **White**          | `#ffffff` | Card surfaces, form fields |

### Dark Mode (Future)

All colors have dark mode variants defined in CSS variables.

---

## Typography System

### Font Family

```css
--font-sans: Inter, system-ui, -apple-system, sans-serif;
```

**Why Inter?**

- Optimized for screen reading (not print)
- Professional without being corporate
- Excellent at small sizes
- Open-source (Google Fonts)
- Government-appropriate

### Scale & Sizes

```css
/* Heading Styles */
--text-4xl: 2.25rem (36px);   h1, page titles
--text-3xl: 1.875rem (30px);  h2, section headers
--text-2xl: 1.5rem (24px);    h3, subsections
--text-xl: 1.25rem (20px);    h4, card titles
--text-lg: 1.125rem (18px);   h5, emphasis

/* Body Styles */
--text-base: 1rem (16px);     Normal body text, buttons
--text-sm: 0.875rem (14px);   Secondary text, labels
--text-xs: 0.75rem (12px);    Captions, timestamps

/* Font Weights */
--fw-normal: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;   Headings (compact)
--leading-normal: 1.5;   Body text (readable)
--leading-relaxed: 1.75; Long-form content
```

---

## Spacing System

### Base Unit: 4px

All spacing is a multiple of 4px for perfect alignment.

```css
--space-1: 0.25rem (4px);     Micro-spacing
--space-2: 0.5rem (8px);      Padding in buttons
--space-3: 0.75rem (12px);    Component spacing
--space-4: 1rem (16px);       Section padding, card spacing
--space-6: 1.5rem (24px);     Between major sections
--space-8: 2rem (32px);       Between components
--space-12: 3rem (48px);      Between major sections
```

### Usage Examples

```css
/* Buttons */
padding: var(--space-3) var(--space-4);

/* Cards */
padding: var(--space-6);
margin-bottom: var(--space-6);

/* Form fields */
gap: var(--space-3);
margin-bottom: var(--space-4);

/* Page layout */
padding: var(--space-8);
```

---

## Border Radius

```css
--radius-sm: 0.25rem (4px);    Subtle rounding (inputs)
--radius-md: 0.5rem (8px);     Cards, modals
--radius-lg: 1rem (16px);      Large interactive elements
--radius-full: 9999px;         Pills, full circles
```

### Application

```css
input {
  border-radius: var(--radius-sm);
}
.card {
  border-radius: var(--radius-md);
}
.button {
  border-radius: var(--radius-sm);
}
.badge {
  border-radius: var(--radius-full);
}
```

---

## Component Library

### Buttons

#### Variants

**Primary Button**

```
Background: Navy (#0f172a)
Text: White
Hover: Darker navy
Usage: Main call-to-action (Submit, Save, Approve)
```

**Secondary Button**

```
Background: Gray
Text: Navy
Hover: Light gray
Usage: Alternative actions (Cancel, Back)
```

**Success Button**

```
Background: Emerald
Text: White
Hover: Darker emerald
Usage: Positive confirmations (Approve, Confirm)
```

**Danger Button**

```
Background: Error Red
Text: White
Hover: Darker red
Usage: Destructive actions (Reject, Delete)
```

**Ghost Button**

```
Background: Transparent
Text: Navy
Border: 1px Navy
Hover: Light background
Usage: Tertiary actions, links
```

#### Button States

```
Normal:    Interactive, full opacity
Hover:     Shade change, cursor pointer
Active:    Pressed appearance
Disabled:  Reduced opacity, no pointer
Loading:   Spinner, disabled state
```

### Forms

#### Input Fields

**Text Input**

```tsx
<input type="text" placeholder="Enter value" className="form-input" />
```

Styles:

```css
.form-input {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-navy);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}
```

#### Labels

```css
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}
```

#### Validation

```css
.form-input.error {
  border-color: var(--color-error);
}

.form-error {
  color: var(--color-error);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}

.form-input.valid {
  border-color: var(--color-success);
}
```

### Status Badges

```
SUBMITTED    → Blue badge     [pending]
UNDER_REVIEW → Amber badge    [in progress]
APPROVED     → Green badge    [success]
REJECTED     → Red badge      [error]
WAITLISTED   → Gray badge     [on hold]
```

### Cards

**Card Structure**

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
  </div>
  <div className="card-body">Content here</div>
  <div className="card-footer">Actions here</div>
</div>
```

**Styles**

```css
.card {
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid var(--border-default);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}

.card-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}
```

### Data Tables

```tsx
<table className="data-table">
  <thead>
    <tr>
      <th>Header</th>
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="clickable">
      <td>Data</td>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

**Styles**

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.data-table th {
  background: var(--bg-secondary);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--border-default);
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-default);
}

.data-table tr.clickable:hover {
  background: var(--bg-secondary);
  cursor: pointer;
}
```

### Modals

```tsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2>Modal Title</h2>
      <button className="modal-close">✕</button>
    </div>
    <div className="modal-body">Content</div>
    <div className="modal-footer">Buttons</div>
  </div>
</div>
```

### Notifications/Alerts

```tsx
<div className="alert alert-success">
  ✅ Success message
</div>

<div className="alert alert-error">
  ❌ Error message
</div>

<div className="alert alert-warning">
  ⚠️ Warning message
</div>

<div className="alert alert-info">
  ℹ️ Information message
</div>
```

---

## Layout Patterns

### Grid System

```css
/* 2-column responsive */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

/* 3-column responsive */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

/* Sidebar layout */
.sidebar-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .sidebar-layout {
    grid-template-columns: 1fr;
  }
}
```

### Flexbox Utilities

```css
.flex {
  display: flex;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
```

---

## Responsive Design

### Breakpoints

```css
--mobile: < 640px; /* Phone */
--tablet: 640px - 1024px; /* iPad */
--desktop: > 1024px; /* Desktop */
```

### Mobile-First Approach

```css
/* Base (mobile) styles */
.card {
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 640px) {
  .card {
    padding: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card {
    padding: var(--space-8);
  }
}
```

---

## Animation & Transitions

### Timing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Durations

```css
--duration-75: 75ms;    Quick interactions
--duration-100: 100ms;  Button hover
--duration-200: 200ms;  Page transitions
--duration-300: 300ms;  Modal entrance
--duration-500: 500ms;  Complex animations
```

### Common Animations

**Fade In**

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 200ms ease-out;
}
```

**Slide In**

```css
@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 300ms ease-out;
}
```

---

## Dark Mode (Future)

CSS custom properties enable easy dark mode:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1f2937;
    --text-primary: #f3f4f6;
  }
}
```

---

## Accessibility Checklist

- [ ] All form inputs have associated labels
- [ ] Buttons have clear text or aria-labels
- [ ] Color not used as the only differentiator
- [ ] Images have alt text
- [ ] Links are distinguishable
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Contrast ratios ≥ 4.5:1
- [ ] Font size ≥ 16px (typical body)
- [ ] Interactive elements ≥ 44x44px (touch targets)

---

## CSS Architecture

### Structure

```
styles/
├── globals.css         /* Design system variables, resets */
├── animations.css      /* Keyframe animations */
└── components/
    ├── Button.module.css
    ├── Form.module.css
    ├── Card.module.css
    └── ...
```

### CSS Modules

Each component has scoped styles:

```typescript
import styles from './Button.module.css';

export function Button({ variant }) {
  return <button className={styles[variant]}>Click</button>;
}
```

This prevents style conflicts and makes maintenance easier.

---

## Design Tokens Reference

All design decisions are controlled by CSS variables in `styles/globals.css`.

To update the design system:

1. Change variable value
2. All components using that variable update automatically
3. No component files need modification

---

## Component Examples

See inline code comments in component files for implementation details.

Each component follows these patterns:

- Props-based configuration
- Semantic HTML
- CSS Module scoping
- Accessibility attributes
- TypeScript typing
- JSDoc comments

---

## Future Design Enhancements

- [ ] Dark mode support
- [ ] Animation library (Framer Motion)
- [ ] Icon system (with SVG optimization)
- [ ] Component storybook
- [ ] Design tokens in JSON
- [ ] Accessibility audit tool integration

---
