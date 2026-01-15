# Separate Authentication System Documentation

## Overview
This document describes the separate login/logout system implemented for Admin, Seller, and User roles.

## Login Pages

### 1. User Login (Regular Customers)
- **Route**: `/login`
- **Purpose**: For regular customers who want to shop
- **Features**:
  - Standard email/password login
  - Links to admin and seller portals
  - Redirects to homepage after login
  - Registration link for new users

### 2. Admin Login
- **Route**: `/admin/login`
- **Purpose**: For platform administrators only
- **Features**:
  - Purple-themed UI with shield icon
  - Role verification (only admins can access)
  - Error message if non-admin tries to login
  - Redirects to admin dashboard after successful login
  - Links to user and seller login portals

### 3. Seller Login
- **Route**: `/seller/login`
- **Purpose**: For sellers to access their dashboard
- **Features**:
  - Amber-themed UI with store icon
  - Automatic seller profile fetch after login
  - Smart redirection based on seller status:
    - `approved` → `/seller` (dashboard)
    - `pending` → `/seller/pending`
    - `rejected` → `/seller/rejected`
    - No profile → `/seller/onboarding`
  - Links to user and admin login portals

## Logout Functionality

### Role-Specific Logout Functions

#### 1. `logoutAdmin()`
- Clears authentication state
- Clears seller profile (if any)
- Redirects to `/admin/login`
- Used in: Admin dashboard sidebar

#### 2. `logoutSeller()`
- Clears authentication state
- Clears seller profile
- Redirects to `/seller/login`
- Used in: Seller dashboard, Navbar (for sellers)

#### 3. `logoutUser()`
- Clears authentication state
- Clears seller profile (if any)
- Redirects to `/login`
- Used in: Navbar (for regular users)

#### 4. `clearAuth()`
- Generic function to clear auth state
- Doesn't redirect (for programmatic use)

### Smart Logout in Navbar
The Navbar component now uses a `handleLogout()` function that automatically:
- Detects the user's role
- Calls the appropriate logout function
- Redirects to the correct login page

```typescript
const handleLogout = () => {
    if (user?.role === 'admin') {
        logoutAdmin();
    } else if (user?.role === 'seller' || hasSeller) {
        logoutSeller();
    } else {
        logoutUser();
    }
};
```

## Middleware Protection

The middleware has been updated to:

### Admin Routes (`/admin/*`)
- Requires authentication
- Requires `admin` role
- Redirects to `/admin/login` if not authenticated
- Excludes `/admin/login` from protection

### Seller Routes (`/seller/*`)
- Requires authentication  
- Allows `seller` or `admin` roles
- Redirects to `/seller/login` if not authenticated
- Excludes `/seller/login` and `/seller/onboarding` from protection

### Login Page Redirects
- Admins visiting `/login` → redirected to `/admin`
- Sellers visiting `/login` → redirected to `/seller`
- Regular users visiting login when authenticated → redirected to `/`

## UI Locations

### Logout Buttons

1. **Admin Sidebar** (Desktop)
   - Location: Bottom of sidebar, above platform status
   - Style: Red outlined button
   - Text: "Admin Logout"

2. **Seller Dashboard**
   - Location: Top right header, next to Settings button
   - Style: Red outlined button
   - Text: "Logout"

3. **Navbar** (All user types)
   - Location: Top navigation bar
   - Icon: LogOut icon
   - Behavior: Smart detection of role

## File Structure

```
client/src/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   └── layout.tsx          # Admin layout with logout
│   │   └── admin-login/
│   │       └── page.tsx             # Admin login page
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx             # User login page (updated)
│   └── (main)/
│       └── seller/
│           ├── login/
│           │   └── page.tsx         # Seller login page
│           └── page.tsx             # Seller dashboard with logout
├── components/
│   └── shared/
│       └── Navbar.tsx               # Updated with role-specific logout
├── middleware.ts                    # Updated route protection
├── services/
│   └── seller.service.ts            # Added getMySellerProfile
└── store/
    └── authStore.ts                 # Added logout functions
```

## Testing the System

### Test Admin Login
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Should redirect to `/admin`
4. Click "Admin Logout" in sidebar
5. Should redirect to `/admin/login`

### Test Seller Login
1. Navigate to `/seller/login`
2. Login with any user account
3. Should redirect based on seller status
4. Click "Logout" in header
5. Should redirect to `/seller/login`

### Test User Login
1. Navigate to `/login`
2. Login with user credentials
3. Should redirect to `/`
4. Click logout icon in navbar
5. Should redirect to `/login`

### Cross-Portal Navigation
- Each login page has links to other portals
- User login → Links to admin and seller
- Admin login → Links to user and seller
- Seller login → Links to user and admin

## Benefits

1. **Security**: Each role has dedicated authentication flow
2. **UX**: Users don't get confused about which portal to use
3. **Clarity**: Each login page is tailored to its user type
4. **Flexibility**: Easy to extend with more roles in future
5. **Session Management**: Proper cleanup on logout
6. **Navigation**: Smart redirects based on authentication status

## Color Coding

- **Admin**: Purple theme (purple-600, purple-400)
- **Seller**: Amber theme (amber-600, amber-400)
- **User**: Indigo theme (indigo-600, indigo-400)

This color coding makes it visually clear which portal a user is accessing.
