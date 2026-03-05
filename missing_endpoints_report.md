# Missing Endpoints Report

After analyzing the backend routing map (`backend/src/routes/index.js`) and cross-referencing it with the frontend's API calls (via `grep 'axios'`), several missing integrations and path discrepancies have been identified. 

## 1. Missing Frontend Integrations
The backend defines these endpoints, but the frontend currently lacks UI/components to trigger them:

### A. Student Bookmarks / Saved Internships
The backend `studentRoutes.js` exposes:
- `GET /api/v1/students/bookmarks` (Get Saved Internships)
- `POST /api/v1/students/bookmarks/:id` (Bookmark an Internship)
- `DELETE /api/v1/students/bookmarks/:id` (Unbookmark an Internship)
**Missing:** The frontend doesn't have a "Saved Internships" page or bookmark buttons on the internship cards.

### B. Search & Filtering API
The backend `searchRoutes.js` exposes:
- `GET /api/v1/search/internships` (Advanced search with filters)
- `GET /api/v1/search/students` (Employer search for students)
**Missing:** The frontend (`/find-internships/page.jsx` and `/employer/dashboard/page.jsx`) appears to be fetching all data and filtering it client-side instead of utilizing these robust backend search endpoints.

### C. Advanced Profile Management
The backend `studentRoutes.js` exposes:
- `POST /api/v1/students/profile/certification`
- `DELETE /api/v1/students/profile/certification/:id`
- `DELETE /api/v1/students/profile/education/:id`
- `DELETE /api/v1/students/profile/reset`
**Missing:** The frontend `student-profile` page does not currently support adding/removing specific certifications or resetting the profile entirely.

---

## 2. API Path Discrepancies (Urgent Fix Required)
The backend registers all its central routing through `/api/v1/` (`backend/src/app.js` line 84). However, many frontend components are hardcoding incorrect paths or missing the `v1` prefix. If the backend strictly enforces the `v1` router namespace, these frontend calls will currently result in `404 Not Found`.

**Examples of Misconfigured Frontend Paths:**
- `axios.get('http://localhost:5001/api/applications/employer')` *(Missing /v1/)*
- `axios.get('/api/internships/my-postings')` *(Missing /v1/)*
- `axios.post('http://localhost:5001/api/matching/students')` *(Missing /v1/)*
- `axios.get('http://localhost:5001/api/admin/employers')` *(Missing /v1/)*
- `axios.post('http://localhost:5001/api/verification/student')` *(Missing /v1/)*

**Recommended Action:** 
We need to refactor the frontend to standardize all API requests to use the pre-configured `apiClient.ts` instance (which automatically prepends the `/api/v1` base URL and attaches the Auth token) instead of raw `axios` calls with hardcoded `http://localhost:5001`.
