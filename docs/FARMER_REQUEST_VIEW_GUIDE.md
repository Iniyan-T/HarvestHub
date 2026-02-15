# 🎯 What Farmer Sees - Complete Visual Guide

## When Farmer Opens "Stock Request"

### The Request Card Display

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  John Buyer                                      Total: ₹120,000 │
│  2/5/2026                                                        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Crop Details:                                                   │
│  ┌───────────────┬──────────────┬────────────┬─────────────────┐ │
│  │ Crop Name     │ Quantity     │ Price      │ Amount          │ │
│  │               │ (quintals)   │ (₹/quintal)│                 │ │
│  ├───────────────┼──────────────┼────────────┼─────────────────┤ │
│  │ Wheat         │ 50           │ ₹2,400     │ ₹1,20,000       │ │
│  └───────────────┴──────────────┴────────────┴─────────────────┘ │
│                                                                   │
│  Notes:                                                          │
│  Buyer John Buyer requesting 50 quintals of Wheat              │
│                                                                   │
│  Contact: +91 98765 43210         [Chat] [Accept] [Deny]       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Field-by-Field Breakdown

### Header Section
```
┌─ BUYER NAME ──────────────────────┬─ TOTAL AMOUNT ─────────────┐
│                                   │                             │
│ John Buyer                        │ Total: ₹120,000             │
│ 2/5/2026                          │ (Automatically Calculated) │
│                                   │                             │
└───────────────────────────────────┴─────────────────────────────┘

Source: buyerName field from request
Source: createdAt timestamp from request
Source: totalAmount = requestedQuantity × offerPrice
```

### Crop Details Table
```
┌──────────────────────────────────────────────────────────────────┐
│                      CROP DETAILS TABLE                          │
├─────────────────┬──────────────┬──────────────┬─────────────────┤
│ Crop Name       │ Quantity     │ Offer Price  │ Amount          │
├─────────────────┼──────────────┼──────────────┼─────────────────┤
│ Wheat           │ 50           │ ₹2,400       │ ₹120,000        │
└─────────────────┴──────────────┴──────────────┴─────────────────┘

Each value from:
├─ "Wheat"        ← cropName
├─ "50"           ← requestedQuantity  
├─ "₹2,400"       ← offerPrice
└─ "₹120,000"     ← totalAmount (calculated)
```

### Notes Section
```
┌─ BUYER'S REQUEST NOTES ────────────────────────────────────────┐
│                                                                 │
│ Buyer John Buyer requesting 50 quintals of Wheat              │
│                                                                 │
│ (Auto-generated from buyer form data)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Contact & Action Buttons
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│ 📞 Contact: +91 98765 43210      [Chat] [Accept] [Deny]       │
│                                                                   │
│ Phone number from: buyerContact field                          │
│ Buttons allow farmer to:                                       │
│   - Open chat with buyer                                       │
│   - Accept the request (changes status)                        │
│   - Deny the request (changes status)                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## All Fields Farmer Can See

### Automatically Displayed

| Field | Value | Purpose |
|-------|-------|---------|
| Buyer Name | John Buyer | Who sent the request |
| Request Date | 2/5/2026 | When request was sent |
| Crop Name | Wheat | What crop buyer wants |
| Quantity | 50 quintals | How much buyer needs |
| Offer Price | ₹2,400/quintals | Price buyer offers |
| Total Amount | ₹120,000 | Complete transaction value |
| Buyer Contact | +91 98765 43210 | How to reach buyer |
| Request Notes | [Full message] | Additional buyer details |
| Status | Pending/Accepted/Denied | Current request state |

### Status Types

```
Status Flow:
  
  Pending → Accept → ✓ Accepted (Contract Terms Agreed)
           → Deny   → ✗ Denied (Farmer Rejected)
           → Complete → ✓ Completed (Transaction Done)
```

---

## Multiple Requests View

When farmer has multiple requests:

```
STOCK REQUEST PAGE
═══════════════════════════════════════════════════════════════

REQUEST 1 (Newest)
┌─────────────────────────────────────────────────────────────┐
│ Rajesh Sharma                     Total: ₹150,000            │
│ 2/5/2026 2:30 PM                                             │
│                                                              │
│ Crop: Rice | Qty: 60 | Price: ₹2,500 | Total: ₹150,000    │
│ Contact: +91 9876543210                                      │
│ [Chat] [✓Accepted]                                           │
└─────────────────────────────────────────────────────────────┘

REQUEST 2
┌─────────────────────────────────────────────────────────────┐
│ Priya Verma                       Total: ₹90,000             │
│ 2/5/2026 1:45 PM                                             │
│                                                              │
│ Crop: Wheat | Qty: 30 | Price: ₹3,000 | Total: ₹90,000    │
│ Contact: +91 8765432109                                      │
│ [Chat] [Accept] [Deny]                                       │
└─────────────────────────────────────────────────────────────┘

REQUEST 3
┌─────────────────────────────────────────────────────────────┐
│ Amit Kumar                        Total: ₹45,000             │
│ 2/5/2026 12:00 PM                                            │
│                                                              │
│ Crop: Potato | Qty: 50 | Price: ₹900 | Total: ₹45,000     │
│ Contact: +91 7654321098                                      │
│ [Chat] [✗Denied]                                             │
└─────────────────────────────────────────────────────────────┘

(Requests sorted by newest first)
```

---

## What Happens When Farmer Clicks Accept/Deny

### Before:
```
Pending Status:
│ [Chat] [Accept] [Deny] │
```

### After Click Accept:
```
Accepted Status:
│ [Chat] [✓ Accepted] │  (Button changes to badge)
```

### After Click Deny:
```
Denied Status:
│ [Chat] [✗ Denied] │  (Button changes to badge)
```

---

## Data Integrity Verification

### What Comes From Buyer's Input

| Item | Farmer Sees | Matches Buyer's Input? |
|------|------------|----------------------|
| Name | "John Buyer" | ✅ Exact match |
| Contact | "+91 98765 43210" | ✅ Exact match |
| Quantity | "50 quintals" | ✅ Exact match |
| Price | "₹2,400/quintal" | ✅ Exact match |
| Notes | Full message | ✅ Auto-generated from inputs |

### What Gets Calculated

| Item | Farmer Sees | Formula |
|------|------------|---------|
| Total Amount | "₹120,000" | Qty (50) × Price (2,400) |
| Request Date | "2/5/2026" | Server timestamp |

---

## Error States

### If Farmer Tries to Accept/Deny (Error Cases)

```
Backend Down:
┌─────────────────────────────────────────┐
│ ❌ Error: Failed to update request      │
│                                         │
│ [Retry]                                 │
└─────────────────────────────────────────┘

No Internet:
┌─────────────────────────────────────────┐
│ ❌ Failed to connect to server          │
│                                         │
│ [Retry]                                 │
└─────────────────────────────────────────┘

(Button disabled during update, re-enabled after response)
```

---

## Loading & Empty States

### Initial Load
```
Loading requests...

(Spinner animation)
```

### No Requests Yet
```
No requests yet

(Empty state message)
```

### After Sending Request But Before Refresh
```
(Request immediately visible if StockRequest component 
 is still open and auto-refreshing)
```

---

## Complete Information Flow Diagram

```
BUYER FILLS FORM                    → REQUEST SAVED IN DATABASE
  │                                    │
  ├─ Name: "John Buyer"               ├─ _id: "507f..."
  ├─ Contact: "+91 98765..."          ├─ farmerId: "507f..."
  ├─ Qty: "50"                        ├─ buyerName: "John Buyer"
  ├─ Price: "2400"                    ├─ buyerContact: "+91 98765..."
  └─ Crop: "Wheat"                    ├─ cropName: "Wheat"
                                       ├─ requestedQuantity: 50
                                       ├─ offerPrice: 2400
                                       ├─ totalAmount: 120000
                                       ├─ status: "pending"
                                       ├─ createdAt: "2026-02-05..."
                                       └─ notes: "Buyer John..."
                                            │
                                            ↓
                                    FARMER APP FETCHES
                                    REQUEST & DISPLAYS
                                            │
                                    ┌───────┴─────────┐
                                    │ Crop Details    │
                                    │ Buyer Contact   │
                                    │ Total Amount    │
                                    │ Status Buttons  │
                                    │ Request Date    │
                                    └─────────────────┘
```

---

## Browser Display Resolution

### Desktop View (1920x1080)
```
Full table visible, all fields readable
Buttons side-by-side
Card width: 500-600px
```

### Tablet View (768px)
```
Table scrollable horizontally
Buttons wrap to next line
Card width: 90% of screen
```

### Mobile View (375px)
```
Table stacks vertically
Buttons stack vertically
Single column layout
```

---

## Farmer's Complete Action Flow

```
1. Login/Open Farmer App
   ↓
2. Click "Stock Request" in sidebar
   ↓
3. Component fetches requests from database
   ↓
4. All requests display with COMPLETE buyer details
   ↓
5. Farmer reviews each request details:
   ✓ Who sent it (Buyer Name)
   ✓ How to contact them (Phone)
   ✓ What they need (Crop & Quantity)
   ✓ What they're paying (Price & Total)
   ↓
6. Farmer decides to Accept or Deny
   ↓
7. Status updates immediately
   ↓
8. Farmer can refresh and see persisted status
```

---

## ✅ Verification Checklist for Farmer Display

- [ ] Buyer name visible and correct
- [ ] Contact number visible and clickable
- [ ] Crop name matches what was requested
- [ ] Quantity shows in quintals
- [ ] Price shows with ₹ symbol
- [ ] Total amount calculated correctly
- [ ] Request date/time displays
- [ ] Status badge visible
- [ ] Accept/Deny buttons work
- [ ] Chat button present
- [ ] All text is readable (font size OK)
- [ ] Colors match design (emerald green theme)
- [ ] No missing or truncated fields
- [ ] Multiple requests stack properly
- [ ] Newest requests shown first

