# BaloWaci - Full Stack Live Website

A complete interactive live website for BaloWaci - a unified time interpretation system.

## Project Structure

```
balowaci –website/
├── index.html                  # Frontend SPA (complete interactive site)
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── server.js          # Express server entry point
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # API routes
│   │   └── db/                 # Database connection
│   ├── package.json
│   ├── .env                    # Database credentials
│   └── .env.example            # Environment template
├── database/                   # PostgreSQL setup
│   ├── schema.sql              # Database schema
│   └── README.md               # DB setup instructions
├── README.md                   # This file
├── SETUP_GUIDE.md             # Step-by-step setup
└── .gitignore                 # Git ignore patterns
```

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript SPA with:
  - Luxury cinematic UI (purple + gold theme)
  - Animated star background
  - Live time interpretation panel
  - Feedback form connected to backend
  - Responsive mobile design

- **Backend**: Node.js + Express REST API with:
  - `/api/time/current` - Get live time interpretations
  - `/api/feedback/submit` - Submit visitor feedback
  - `/api/feedback/all` - Retrieve all feedback (admin)
  - `/api/feedback/stats` - Get dashboard metrics
  - `/api/feedback/export.csv` - Export feedback for investor review
  - `/api/health` - Health check endpoint
  - `/admin` - Interactive feedback dashboard

- **Database**: PostgreSQL with:
  - `feedback` table for visitor submissions
  - `interpretations` table for time history
  - `admin_users` table for admin access

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user and database
CREATE USER balowaci_user WITH PASSWORD 'balowaci_secure_123';
CREATE DATABASE balowaci_db OWNER balowaci_user;
GRANT ALL PRIVILEGES ON DATABASE balowaci_db TO balowaci_user;

# Exit psql and run schema
psql -U balowaci_user -d balowaci_db -a -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# .env file already configured with:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=balowaci_user
# DB_PASSWORD=balowaci_secure_123
# DB_NAME=balowaci_db
# PORT=5000

# Start development server
npm run dev

# Or start production
npm start
```

Backend will run on `http://localhost:5000`

Admin dashboard will run on `http://localhost:5000/admin`

### 3. Frontend Setup

```bash
# Open index.html in browser or use a local server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Option 3: VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

Frontend will run on `http://localhost:8000` (or your chosen port)

## API Endpoints

### Time Interpretation
```
GET /api/time/current
Response:
{
  "success": true,
  "data": {
    "timestamp": "2026-04-25T...",
    "standard": "12:34:56 PM",
    "military": "12:34:56",
    "rotational": "176.35°",
    "cultural": "52.43%"
  }
}
```

### Submit Feedback
```
POST /api/feedback/submit
Body: {
  "firstImpression": "text",
  "isUnique": "text",
  "interests": "text",
  "journeyThoughts": "text (optional)",
  "targetCustomer": "text",
  "problemSolved": "text",
  "willingnessToPay": "text",
  "adoptionBarriers": "text",
  "mustHaveFeatures": "text",
  "pilotInterest": "text"
}
```

### Get All Feedback
```
GET /api/feedback/all
```

### Feedback Stats
```
GET /api/feedback/stats
```

### Export Feedback
```
GET /api/feedback/export.csv
```

### Health Check
```
GET /api/health
```

## Features

### Frontend ✅
- Luxury purple/gold theme
- Animated glowing stars (40 stars)
- Full-screen hero section
- Live time panel (4 interpretation modes)
- Feedback form with validation
- Smooth scrolling
- Fully responsive (desktop, tablet, mobile)
- CORS-enabled API calls

### Backend ✅
- RESTful API with Express
- Time interpretation algorithm
- Feedback storage & retrieval
- Database connection pooling
- Error handling & validation

### Database ✅
- PostgreSQL schema with indexes
- Automatic timestamps & triggers
- Feedback storage table
- Performance optimized

## Deployment

- **Frontend**: Deploy index.html to Vercel, Netlify, GitHub Pages
- **Backend**: Deploy to Heroku, Render, AWS, Azure
- **Database**: Use managed PostgreSQL (DigitalOcean, AWS RDS, Azure)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection failed | Check PostgreSQL running, verify .env |
| Port 5000 in use | `lsof -i :5000` then `kill -9 <PID>` |
| CORS error | Backend must be running on port 5000 |
| Feedback not saving | Check database connection, run schema.sql |
| API shows 503 | PostgreSQL not connected, check DB credentials |

## Development

For step-by-step setup guidance, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For database setup details, see [database/README.md](database/README.md)
