# Walkthrough: Authentication & Verification System

This guide explains how to test the authentication and verification features.

## Prerequisites

1.  **Configure Environment**:
    Create a `.env` file in `backend/` with the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/internship_matching
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    LINKEDIN_CLIENT_ID=your_linkedin_client_id
    LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
    FRONTEND_URL=http://localhost:3000
    ```
2.  **Start Services**:
    - **Backend**: `cd backend && npm run dev`
    - **Frontend**: `cd frontend && npm run dev`

## Testing Steps

### 1. Student Authentication & Verification
1.  **Open Browser**: Navigate to `http://localhost:3000/login`.
2.  **Login**: Click **Sign in with Google** (Simulated if keys missing, OR register via `Don't have an account?`).
3.  **Redirect**: After successful login, you are redirected to `/dashboard`.
4.  **Verify**: Navigate to `/verify-student`.
5.  **Form**: Enter `Student ID` and upload an ID image.
6.  **Submit**: Click **Verify Identity**. Status changes to **Pending**.

### 2. Employer Authentication & Verification
1.  **Logout**: Log out.
2.  **Login**: Create a new account via `/register` with role `Employer` (or modify `authController` to default to Employer for testing).
    *   *Note*: Edit `backend/src/controllers/authController.js` logic if using OAuth to set different default role, or use Registration form.
3.  **Verify**: Navigate to `/verify-employer`.
4.  **Form**: Enter `Company Name`, `Reg No`, `Website` and upload a PDF document.
5.  **Submit**: Click **Verify Business**. Status changes to **Pending**.

### 3. Admin Approval
1.  **Create Admin**: Since there is no public admin signup, use MongoDB Shell:
    ```javascript
    use internship_matching
    db.users.insertOne({
      name: "Admin User",
      email: "admin@example.com",
      password: "hashed_password_here",
      role: "admin",
      isVerified: true,
      verificationStatus: "approved"
    })
    ```
    *Alternatively, register a normal user then update their role in DB.*
2.  **Login**: Log in as Admin.
3.  **Dashboard**: Navigate to `/admin/verifications`.
4.  **Review**: See the pending Student and Employer requests.
5.  **Action**: Click **Approve**.
6.  **Verify**: Log back in as the student/employer. Confirmation message should indicate verification success.

## Troubleshooting

- **Upload Failures**: Ensure `backend/uploads/` directory exists and has write permissions.
- **CORS Errors**: Check `FRONTEND_URL` in `.env`.
- **OAuth Loops**: Ensure Callback URLs are registered in Google Cloud Console.
