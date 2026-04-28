# BaloWaci - Complete Setup Guide

## Overview
This guide walks you through setting up and running the complete BaloWaci full-stack website.

## System Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: v16 or higher
- **PostgreSQL**: v12 or higher
- **npm**: v7 or higher (comes with Node.js)

## Step 1: Install PostgreSQL

### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password for the `postgres` user
4. Ensure PostgreSQL service is running

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

## Step 2: Create Database

Open PostgreSQL command line (psql) and run:

```sql
-- Create user
CREATE USER balowaci_user WITH PASSWORD 'balowaci_secure_123';

-- Create database
CREATE DATABASE balowaci_db OWNER balowaci_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE balowaci_db TO balowaci_user;

-- Verify
\l  -- List databases
\du -- List users
```

## Step 3: Initialize Database Schema

```bash
cd database

# Run the schema file
psql -U balowaci_user -d balowaci_db -a -f schema.sql

# Verify tables were created
psql -U balowaci_user -d balowaci_db -c "\dt"
```

## Step 4: Set Up Backend

```bash
cd backend

# Install Node.js dependencies
npm install

# Backend .env file is already configured:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=balowaci_user
# DB_PASSWORD=balowaci_secure_123
# DB_NAME=balowaci_db
# PORT=5000

# Test backend connection
node -e "require('./src/db/connection').query('SELECT NOW()').then(r => console.log('✅ DB Connected:', r.rows[0]))"
```

## Step 5: Start Backend Server

```bash
# From backend folder
npm run dev

# You should see:
# BaloWaci Backend running on http://localhost:5000
```

Test the API in another terminal:
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true,"status":"API is running",...}
```

## Step 6: Start Frontend

```bash
# From project root folder (balowaci –website)

# Option 1: Use Python's built-in server
python -m http.server 8000

# Option 2: Use Node.js http-server
npx http-server -p 8000

# Option 3: Use VS Code Live Server
# Right-click index.html > Open with Live Server
```

## Step 7: Access the Website

Open your browser and navigate to:
```
http://localhost:8000
```

You should see:
- ✅ Purple/gold luxury theme
- ✅ Animated stars in background
- ✅ Hero section with "BaloWaci" logo
- ✅ Live time interpretation panel updating
- ✅ Feedback form ready to submit

## Testing

### Test Time Interpretation API
```bash
curl http://localhost:5000/api/time/current
```

### Test Feedback Submission
```bash
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstImpression": "Amazing",
    "isUnique": "Very unique",
    "interests": "Time interpretation",
    "journeyThoughts": "Love this project",
    "targetCustomer": "Global teams and education programs",
    "problemSolved": "It gives people a new way to interpret time across contexts",
    "willingnessToPay": "Yes, if packaged for teams or licensing",
    "adoptionBarriers": "People may need a clear demo and simple onboarding",
    "mustHaveFeatures": "Mobile app, API access, and case studies",
    "pilotInterest": "Yes, I would recommend a pilot conversation"
  }'
```

### Test Get All Feedback
```bash
curl http://localhost:5000/api/feedback/all
```

### Open Admin Dashboard
Visit:
```bash
http://localhost:5000/admin
```

The dashboard shows feedback totals, investor-ready responses, payment signals, partnership signals, detailed submissions, and CSV export.

## Project Structure

```
balowaci –website/
├── index.html               # Frontend SPA (650 lines)
├── README.md               # Project overview
├── SETUP_GUIDE.md          # This file
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── .env                # Database credentials (pre-configured)
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── controllers/
│       ├── routes/
│       └── db/
│
└── database/
    ├── schema.sql
    └── README.md
```

## Troubleshooting

### PostgreSQL Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
- Windows: Check Services or pgAdmin
- macOS: `brew services start postgresql@15`
- Linux: `sudo service postgresql start`

### Port 5000 Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Frontend Can't Connect to Backend
```
Error: Failed to load from http://localhost:5000
```
**Solution**: 
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_BASE_URL in index.html

### Database Tables Not Found
```
Error: relation "feedback" does not exist
```
**Solution**: Run the schema file
```bash
psql -U balowaci_user -d balowaci_db -a -f database/schema.sql
```

## Next Steps

### Development
1. Modify `index.html` for UI changes
2. Modify `backend/src/` files for API changes
3. Restart backend for changes to take effect
4. Frontend auto-refreshes in browser

### Adding Features
- New API endpoints: Add route in `backend/src/routes/`
- New frontend sections: Add HTML in `index.html`
- Database changes: Create SQL migration and run it

### Deployment

**Frontend**:
- Deploy `index.html` to Vercel, Netlify, GitHub Pages

**Backend**:
- Deploy to Heroku, Render, AWS
- Set environment variables in production

## Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start with auto-reload
npm start               # Start production

# Frontend
cd ..
python -m http.server   # Serve on port 8000

# Database
psql -U balowaci_user -d balowaci_db  # Connect to DB
\dt                     # List tables
SELECT * FROM feedback; # Query feedback
```

## Environment Variables

The `.env` file in backend folder:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=balowaci_user
DB_PASSWORD=balowaci_secure_123
DB_NAME=balowaci_db
PORT=5000
NODE_ENV=development
```

For production, use a strong password and secure methods.

## Support

For issues:
1. Check README.md
2. Review error messages in backend terminal
3. Check browser console
4. Verify database connection: `psql -U balowaci_user -d balowaci_db -c "SELECT 1"`

Good luck! 🚀
