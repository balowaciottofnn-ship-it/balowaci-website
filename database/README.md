# BaloWaci - Database Setup

## PostgreSQL Installation & Setup

### 1. Create Database and User

```sql
-- Create user
CREATE USER balowaci_user WITH PASSWORD 'balowaci_secure_123';

-- Create database
CREATE DATABASE balowaci_db OWNER balowaci_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE balowaci_db TO balowaci_user;
```

### 2. Initialize Schema

Connect to the database and run:

```bash
psql -U balowaci_user -d balowaci_db -a -f database/schema.sql
```

### 3. Verify Tables

```sql
\dt
```

You should see:
- feedback
- interpretations
- admin_users

## Connection String

```
postgresql://balowaci_user:balowaci_secure_123@localhost:5432/balowaci_db
```

## Environment Variables

Update `.env` file in backend folder:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=balowaci_user
DB_PASSWORD=balowaci_secure_123
DB_NAME=balowaci_db
```
