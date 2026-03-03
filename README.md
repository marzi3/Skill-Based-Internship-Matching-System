# Internship Matching Platform

A full-stack internship matching platform built with React (Next.js) frontend and Node.js (Express) backend.

## Project Structure

```
internship-matching-platform/
├── frontend/          # React + Next.js frontend
├── backend/           # Node.js + Express backend
├── database/          # Database migrations and seeds
├── scripts/           # Setup and deployment scripts
├── infrastructure/    # Nginx, PM2 configurations
└── README.md
```

## Features

- **Student Features**: Profile management, internship search, skill matching
- **Employer Features**: Internship posting, candidate matching, application management
- **Admin Features**: User management, analytics, reporting
- **Matching Engine**: AI-powered skill-based matching system

## Getting Started

1. **Setup the project:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Start development servers:**
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```

## Technology Stack

### Frontend
- React 18
- Next.js 14
- Tailwind CSS
- TypeScript

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Infrastructure
- Nginx (Reverse Proxy)
- PM2 (Process Manager)
- Docker (Optional)

## License

MIT License