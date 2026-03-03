# Implementation Plan: Secure Authentication & Verification System

This document outlines the architectural changes implemented to support role-based authentication and verification.

## 1. Authentication Flow

### Strategy
We use **Passport.js** for OAuth (Google/LinkedIn) and **JWT** for session management via HTTP-only cookies.

- **OAuth**: Users authenticate via Google/LinkedIn.
- **Callback**: Server verifies provider response, creates or finds user, generates JWT.
- **JWT**: Contains `userId` and `role`. Stored in HTTP-only cookie to prevent XSS.
- **Session**: `checkUserLoggedIn` persists session on page reload via `/api/auth/me`.

### Database Schema (User Model)
- **Authentication**: `email` (unique), `password` (hashed), `oauthProvider`, `providerId`.
- **Identity**: `name`, `profilePicture`, `role` (default: 'student').
- **Verification**: `isVerified` (bool), `verificationStatus` (enum: 'none', 'pending', 'approved', 'rejected').
- **Student Specific**: `studentId`, `studentIdImage` (path).
- **Employer Specific**: `companyName`, `businessRegistrationNumber`, `businessDocument` (path), `website`.

## 2. Verification Workflow

### Student Verification
1.  **Submission**: User submits **Student ID** + **Image Upload** (`POST /api/verification/student`).
2.  **Storage**: File saved locally to `uploads/`. Metadata updated in DB (`verificationStatus: 'pending'`).
3.  **Review**: Admin reviews submission via `/admin/verifications`.
4.  **Approval**: Admin approves (`PUT /api/verification/:id/approve`), setting `isVerified: true`.

### Employer Verification
1.  **Submission**: User submits **Company Name**, **Reg No**, **Website** + **PDF Upload** (`POST /api/verification/employer`).
2.  **Storage**: File saved locally to `uploads/`.
3.  **Review**: Admin reviews submission via `/admin/verifications`.
4.  **Approval**: Admin approves, enabling internship posting.

## 3. Security Architecture

### Role-Based Access Control (RBAC)
Middleware ensures:
- **protect**: Validates JWT token.
- **authorize('admin')**: Restricts admin endpoints.
- **verifyStatus**: Blocks sensitive actions (e.g., Applying, Posting) for unverified users.

### File Validation
- **Multer**: Limits file size to 5MB.
- **Ext Check**: Only permits `.jpg`, `.jpeg`, `.png`, `.pdf`.

### CORS & Cookies
- `httpOnly`: Prevents client-side script access.
- `secure`: Enabled in production.
- `sameSite`: Configurable based on deployment environment.

## 4. Admin Functionality

Admins can manipulate verification status directly.
- **View Pending**: List all users with `verificationStatus: 'pending'`.
- **Approve**: Updates status to `approved` and `isVerified: true`.
- **Reject**: Updates status to `rejected`, requiring re-submission.
