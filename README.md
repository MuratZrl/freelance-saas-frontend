# Freelance SaaS — Frontend

Next.js frontend for the Freelance Invoice & Client Manager SaaS.

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **HTTP:** Axios
- **Icons:** Lucide React

## Features

- JWT authentication (login / register)
- Dashboard with revenue stats
- Client management (create, edit, delete)
- Invoice creation with line items, tax, discount, live total calculation
- Invoice status management (draft, sent, paid, overdue)
- Protected routes with automatic redirect

## Running Locally
```bash
npm install
npm run dev
```

App runs at `http://localhost:3001`

## Environment

Make sure the backend is running at `http://localhost:3000` before starting the frontend.

Backend repo: [freelance-saas](https://github.com/MuratZrl/freelance-saas)