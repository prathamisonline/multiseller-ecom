# 🚀 Next.js Marketplace Frontend Roadmap

This document provides a detailed blueprint for building a high-end, production-grade frontend that integrates with the **Antigravity Marketplace Backend**.

## 🛠 Tech Stack Recommendations

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SEO, Server Components, and optimized routing. |
| **Styling** | Tailwind CSS + Shadcn UI | Premium aesthetics with fully customizable components. |
| **State Management** | Zustand | Lightweight and performant for Cart and User state. |
| **Data Fetching** | TanStack Query (React Query) | Essential for caching, loading states, and mutations. |
| **Forms** | React Hook Form + Zod | Type-safe validation for onboarding and products. |
| **Animations** | Framer Motion | For that "Premium" feel (page transitions, hover effects). |
| **Charts** | Recharts / Chart.js | Visualizing sales and revenue analytics. |
| **Payments** | Razorpay SDK | Direct integration for the checkout flow. |

---

## 📂 Project Structure

```text
/src
  /app                 # Next.js App Router (Pages & Layouts)
    /(auth)            # Login, Register, Forgot Password
    /(main)            # Public Store, Product Details, Home
    /(dashboard)
      /admin           # Admin Panel (Sellers, Products, Stats)
      /seller          # Seller Panel (Orders, My Products, Analytics)
      /user            # User Profile, My Orders
  /components
    /ui                # Shadcn primitives
    /shared            # Navbar, Footer, Sidebar
    /storefront        # Product Cards, Filters, Search
    /dashboard         # Charts, Stat Cards, Data Tables
  /hooks               # Custom hooks (useCart, useAuth, useOrders)
  /services            # API wrapper (Axios/Fetch instances)
  /store               # Zustand stores (authStore, cartStore)
  /types               # TypeScript interfaces matching Backend
  /lib                 # Utilities (formating, cn helper)
```

---

## 🎨 Design System (Aesthetics)

- **Color Palette**: Dark Mode by default or Sleek Modern Light (e.g., Slate-950 background with Indigo-500 primary).
- **Glassmorphism**: Use `backdrop-blur` for Navbars and Dashboards.
- **Micro-interactions**: Hover scales for product cards, shimmer loading for lists.
- **Typography**: Inter or Montserrat for a clean "Tech" look.

---

## 🗺 Page Breakdown & Features

### 1. Public Storefront (Customer Flow)
- **Home**: Hero section, Featured Categories, Trending Products.
- **Search & Results**: Real-time search using `?search=` and sidebar filters (Price, Category).
- **Product Details**: Image gallery, dynamic QR code display, specifications, and "Add to Cart".
- **Cart Drawer**: Side panel showing items, quantity updates, and subtotal.
- **Checkout**: Multi-step flow (Address -> Order Summary -> Razorpay Payment).

### 2. Seller Dashboard
- **Onboarding**: Multi-step form for Store Name, GST, and Bank Details.
- **Order Management**: List of orders containing their items.
- **Product CRUD**: Rich text editor for descriptions, image upload, and stock tracking.
- **Analytics**: Sales charts (Daily/Monthly) and "Top Selling Products" table.
- **Tools**: Button to "Download Shipping Label" (PDF) and "Export to Excel".

### 3. Admin Panel
- **Approvals**: Dedicated tabs for "Pending Sellers" and "Pending Products".
- **Global Stats**: platform-wide revenue, total users, and seller performance.
- **User/Seller Management**: Ability to suspend/reactivate accounts.
- **System Exports**: Download platform-wide order history in Excel.

---

## ⚡ Integration Details for Backend Modules

### 💳 Razorpay Integration
1. Call `POST /api/v1/payments/create-order`.
2. Use the returned `razorpayOrderId` and `razorpayKeyId`.
3. Load Razorpay script in Next.js `layout.tsx`.
4. Run `rzp.open()` and on success, call `POST /api/v1/payments/verify`.

### 📊 Charts & Analytics
- Transform the data from `GET /api/v1/analytics/admin/revenue` into a format compatible with **Recharts AreaChart**.
- Use the **OrderStatusDistribution** data for a **Donut Chart** in the Admin dashboard.

### 🧾 PDF & Excel Handling
- **Excel**: Use a simple `window.location.href = API_URL` or a fetch with blob to trigger the download from the `/api/v1/exports/` endpoints.
- **Shipping Labels**: Use an `<iframe>` or `window.open` to point to the `/api/v1/shipping/label/:id` endpoint for printable PDFs.

### 🖼 QR Codes
- Call `GET /api/v1/qrcode/product/:id`.
- Display the `qrCode` (Base64 string) inside an `<img />` tag in the product management section.

---

## 🛡 Auth & Security
- Use **Middleware (`middleware.ts`)** to protect routes:
  - `/seller/*` -> Check if `user.role === 'seller'`.
  - `/admin/*` -> Check if `user.role === 'admin'`.
- Store JWT in **HTTP-only Cookies** or **LocalStorage** (with a secure store).

---

## 🚀 Getting Started (Sample API Service)

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
});

// Automatically add Token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 📈 Roadmap for FE Build
1. **Week 1**: Auth pages + Navbar + Footer.
2. **Week 3**: Product Listing + Filters + Cart Logic.
3. **Week 3**: Checkout + Razorpay + Order Success pages.
4. **Week 4**: Seller & Admin Dashboards (Tables, Charts, Tooling).
5. **Week 5**: Polish (Animations, Error Handling, Mobile Responsiveness).
