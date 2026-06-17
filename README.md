# Alexandria Port — Dark Ship Detection System

created this as my gradution project with the help of habibaharfosh and karemelfeky
A full-stack maritime surveillance dashboard for Alexandria Port. Detects dark ships (vessels with disabled AIS transponders) using SAR satellite imagery and AI analysis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Leaflet + Recharts |
| Backend | Express.js + JWT Auth |
| AI | YOLOv8 mock detection pipeline |

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Alexandria_Port
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs dependencies for the root workspace, backend, and frontend in one command.

### 3. Start the development servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend API** → http://localhost:3001
- **Frontend app** → http://localhost:5150

Open http://localhost:5150 in your browser.

---

## Demo Credentials

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Operator | `operator` | `port2024` | Standard access |
| Admin | `admin` | `admin123` | Requires keypass: `ALEX-PORT-2024` |

For admin login, toggle **ADMIN ACCESS** on the login page to reveal the keypass field.

---

## Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Command Dashboard | All |
| `/map` | 3D Tactical Map (F4Map) | All |
| `/alerts` | Threat Matrix | All |
| `/sar` | SAR Intelligence | All |
| `/vessels` | Vessel Registry | All |
| `/integrated-feed` | SAR Map + Intel Feed | All |
| `/analytics` | Analytics | Admin only |
| `/settings` | Settings | All |

---

## Project Structure

```
Alexandria_Port/
├── backend/           # Express API server (port 3001)
│   ├── data/          # Mock vessel, alert, and SAR data
│   ├── middleware/    # JWT authentication
│   ├── routes/        # API route handlers
│   └── server.js
├── frontend/          # React + Vite SPA (port 5150)
│   └── src/
│       ├── components/
│       ├── context/
│       ├── lib/
│       └── pages/
└── package.json       # Root workspace (run scripts here)
```
