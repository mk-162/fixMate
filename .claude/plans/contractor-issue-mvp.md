# MVP Proposal: Contractor Details on Issues

**Status**: Pending consultant sign-off
**Created**: 2026-01-04

---

## The Insight

**90% of the infrastructure already exists** - we just need to display it.

---

## What We Have Now

| Component | Status |
|-----------|--------|
| `contractor_assignments` table with notes, scheduled_for, quoted_amount | Exists |
| AssignTradesmanDialog captures all this data | Works |
| `getIssueAssignment()` function to fetch assignment details | Exists |
| **Display on issue detail page** | Missing |
| **Edit assignment notes** | Missing |

---

## MVP Scope (Simplest Possible)

### 1. Show Contractor Assignment Card on Issue Detail Page

```
┌─────────────────────────────────────────┐
│ Assigned Contractor                     │
├─────────────────────────────────────────┤
│ John Smith (ABC Plumbing)               │
│ Phone: 07700 900123  Email: john@abc.com│
│ Trade: Plumbing  •  Rate: £45/hr        │
├─────────────────────────────────────────┤
│ Scheduled: 15 Jan 2026, 10:00 AM        │
│ Quoted: £150                            │
├─────────────────────────────────────────┤
│ Notes:                                  │
│ "Tenant available after 9am. Access via │
│ back gate. Boiler is in kitchen."       │
│                              [Edit]     │
└─────────────────────────────────────────┘
```

### 2. Editable Notes Field

- PM can add/edit notes about the assignment
- Internal only (contractor doesn't see these)

### 3. "Comms" = Contact Info Display

- Phone number (clickable `tel:` link)
- Email (clickable `mailto:` link)
- PM contacts contractor externally (no in-app messaging)

---

## What This MVP Does NOT Include

- Contractor portal/login
- In-app messaging
- Email/SMS notifications
- Contractor seeing the notes
- Completion workflow (mark done, actual cost)

---

## Implementation

### Files to Modify

1. `src/app/[locale]/(auth)/dashboard/issues/[id]/page.tsx` - Add contractor card
2. `src/features/contractors/actions/contractorActions.ts` - Already has `getIssueAssignment()`

### Effort Estimate

~2-3 hours of work (mostly UI)

---

## Future Phases (Not MVP)

- **Phase 2**: Completion workflow (mark done, record actual cost)
- **Phase 3**: Email notifications when assigned
- **Phase 4**: Contractor portal to view assignments
- **Phase 5**: In-app messaging
