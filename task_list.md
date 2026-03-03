# Task List: Authentication & Verification System

This document summarizes the steps taken to implement a secure OAuth-based authentication and role-based verification system.

## 1. Backend Implementation

### Authentication Module
- [x] Installed dependencies: `passport`, `passport-google-oauth20`, `passport-linkedin-oauth2`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`.
- [x] Refactored `User` model to support OAuth fields, roles (`student`, `employer`, `admin`), and verification status (`pending`, `approved`, `rejected`).
- [x] Configured `Passport.js` strategies for Google and LinkedIn.
- [x] Created `authController.js` to handle:
    - User Registration/Login (Legacy).
    - OAuth Callbacks (Google/LinkedIn).
    - JWT generation and secure HTTP-only cookie setting.
    - `getMe` endpoint for session persistence.
- [x] Implemented `authRoutes.js` and mounted at `/api/auth`.

### Verification Module
- [x] Installed `multer` for handling file uploads (Student IDs, Business Docs).
- [x] Created `verificationController.js` to handle:
    - Student ID upload.
    - Employer Business Document upload.
    - Admin actions (Get Pending, Approve, Reject).
- [x] Implemented `verificationRoutes.js` and mounted at `/api/verification`.
- [x] Configured static file serving for uploaded documents (`/uploads`).

### Middleware & Security
- [x] Updated `auth.js` middleware:
    - `protect`: Verifies JWT from cookie.
    - `authorize`: Checks user role.
    - `verifyStatus`: Blocks unverified users from sensitive actions (e.g., applying).

## 2. Frontend Implementation

### Authentication Context
- [x] Created `AuthContext.js` provider to manage global user state.
- [x] Implemented `useAuth` hook for easy access to user data and login/logout functions.
- [x] Wrapped application with `Providers` component in `layout.jsx`.

### Verified Pages
- [x] Created `/verify-student/page.jsx`:
    - Checks if user is student.
    - Form to enter ID number and upload ID image.
    - Displays verification status (Pending/Approved).
- [x] Created `/verify-employer/page.jsx`:
    - Checks if user is employer.
    - Form to enter company details and upload business document.
    - Displays verification status.
- [x] Created `/admin/verifications/page.jsx`:
    - Lists pending verification requests.
    - Allows Admin to Approve/Reject users.
    - Validates Admin role access.

### UI Components
- [x] Updated `/login/page.jsx` with Google and LinkedIn OAuth buttons.
- [x] Added visual status indicators for verified/pending users.
