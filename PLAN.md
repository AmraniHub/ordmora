# Ordmora — Build Plan

## Overview
**Ordmora** is a COD (cash on delivery) e-commerce app with a built-in loyalty/rewards system.
- **Web:** Next.js (App Router) + Tailwind CSS + Framer Motion
- **Android:** React Native (Expo)
- **Backend:** Supabase (Postgres + Auth + Realtime + Storage + Edge Functions)
- **Notifications:** WhatsApp API (Twilio)
- **Design:** Bright bold colors, gamified points/rewards as hero feature

---

## 7 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Auth** | Client registration (name, phone, city, address) + multi-role admin |
| 2 | **Products** | Catalog with categories + points assigned per product |
| 3 | **Orders** | Place order → auto "En cours" → admin confirms "Livrée" |
| 4 | **Delivery** | Status timeline + WhatsApp notification on each change |
| 5 | **Wallet** | Points auto-added on delivery, 6-month expiry, admin can adjust |
| 6 | **Gifts** | Catalog with point cost, redeem = subtract points |
| 7 | **Admin** | Full CRUD on products/orders/clients/points/gifts + role management |

---

## Business Rules

- **Payment:** COD only (no online payment)
- **Points:** Auto-assigned per product when order status = "Livrée"
- **Points expiry:** 6 months from date earned
- **Gift redemption:** Points subtracted (wallet NOT reset to zero)
- **Insufficient points:** Show "Il te manque X points pour débloquer ce cadeau"
- **Admin roles:** Multiple admins with different permissions

### Points per product (example)
```
Produit A = 10 points
Produit B = 25 points
Produit C = 40 points
```

---

## Tech Stack

```
ordmora/
├── web/                    # Next.js App Router
│   ├── app/
│   │   ├── (client)/       # Client-facing pages
│   │   │   ├── store/      # Product catalog
│   │   │   ├── orders/     # My orders
│   │   │   ├── wallet/     # Points wallet
│   │   │   └── gifts/      # Gift catalog
│   │   ├── (admin)/        # Admin panel
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── clients/
│   │   │   ├── points/
│   │   │   └── gifts/
│   │   └── auth/           # Login / Register
│   ├── components/
│   ├── lib/
│   │   └── supabase/
│   └── styles/
│
├── mobile/                 # React Native (Expo)
│   ├── app/                # Expo Router
│   ├── components/
│   └── lib/
│
└── supabase/
    ├── migrations/         # DB schema
    └── functions/          # Edge Functions (points expiry, etc.)
```

---

## Database Schema (Supabase)

### Tables
- `profiles` — client data (name, phone, city, address, points_total)
- `admin_users` — admin accounts with roles
- `products` — catalog (name, category, price, image, points_value)
- `orders` — order record (client_id, product_id, status, created_at)
- `order_items` — line items per order
- `wallet_transactions` — points log (client_id, points, type, expires_at)
- `gifts` — gift catalog (name, image, points_required, stock)
- `gift_redemptions` — redemption log (client_id, gift_id, points_spent)

---

## Build Roadmap

| Week | Deliverable |
|------|-------------|
| 1 | DB schema + Supabase setup + Auth (web) |
| 2 | Products store + Order flow (web) |
| 3 | Wallet + Points engine |
| 4 | Gifts catalog + Redemption |
| 5 | Admin panel (full) |
| 6 | React Native app (mirrors web) |
| 7 | WhatsApp notifications + Edge Functions |
| 8 | Testing + Deploy (Vercel + Play Store) |

---

## Design System

- **Style:** Bright bold colors, premium feel
- **Hero:** Points/rewards UX — animated counter, progress bars, confetti on redemption
- **Web:** Mobile-first, PWA-installable
- **Android:** Native stack transitions, offline wallet

### Color Palette (to be finalized)
- Primary: Electric purple `#7C3AED` or Cobalt `#2563EB`
- Accent: Coral `#F97316` or Gold `#F59E0B`
- Background: `#0F0F0F` (dark) or `#FAFAFA` (light)
- Success: `#10B981`

---

## Status
- [ ] DB schema designed
- [ ] Next.js scaffolded
- [ ] Supabase project connected
- [ ] Auth working
- [ ] Products CRUD
- [ ] Orders flow
- [ ] Wallet engine
- [ ] Gifts + redemption
- [ ] Admin panel
- [ ] React Native app
- [ ] WhatsApp integration
- [ ] Deployed
