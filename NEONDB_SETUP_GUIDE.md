# NeonDB PostgreSQL Setup Guide

## 🎯 Overview

This guide explains how to set up NeonDB PostgreSQL for the AI-Powered Study Assistant backend.

## 🚀 Why NeonDB?

- **Serverless PostgreSQL**: Auto-scaling, pay-per-use
- **Free Tier**: Generous free tier for development
- **Fast Setup**: Database ready in seconds
- **Modern**: Built for modern applications
- **Compatible**: Standard PostgreSQL

---

## 📋 Step-by-Step Setup

### Step 1: Create NeonDB Account

1. Visit https://neon.tech/
2. Click "Sign Up" (free account)
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project

1. Click "Create Project" or "New Project"
2. Fill in project details:
   - **Project Name**: `ai-study-assistant`
   - **Region**: Choose closest to you (e.g., `US East (Ohio)`)
   - **PostgreSQL Version**: Latest (15 or 16)
3. Click "Create Project"

### Step 3: Get Connection String

After project creation, you'll see your connection details:

```
Connection String:
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Copy this entire connection string!**

### Step 4: Configure Backend

1. Open `python-backend/.env`
2. Replace the `DATABASE_URL` value:

```env
DATABASE_URL=postgresql://your_username:your_password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Example**:
```env
DATABASE_URL=postgresql://alex:AbCdEf123456@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🗄️ Database Schema

### Required Tables

The backend will need these tables for the AI Study Assistant:

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. User Profiles Table
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    learning_style VARCHAR(50),
    difficulty_preference VARCHAR(50),
    mastered_skills JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Learning Sessions Table
```sql
CREATE TABLE learning_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(user_id),
    user_input TEXT,
    intent VARCHAR(100),
    emotional_tone VARCHAR(50),
    agent_outputs JSONB,
    reasoning_chain JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. User Progress Table
```sql
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    skill VARCHAR(255),
    proficiency_level INTEGER,
    last_practiced TIMESTAMP,
    total_practice_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Create Tables via NeonDB Console

1. Go to your NeonDB project dashboard
2. Click "SQL Editor" or "Query"
3. Copy and paste each CREATE TABLE statement
4. Click "Run" for each one

---

## 🔧 Backend Integration

### Install PostgreSQL Dependencies

```bash
cd python-backend
pip install psycopg2-binary sqlalchemy asyncpg
```

These are already in `requirements.txt`:
- `psycopg2-binary` - PostgreSQL adapter
- `sqlalchemy` - ORM for database operations
- `asyncpg` - Async PostgreSQL driver

### Update Memory Store

The memory store (`app/memory/mongodb_store.py`) will need to be updated to use PostgreSQL instead of MongoDB. 

**Key changes needed**:
1. Replace MongoDB client with SQLAlchemy
2. Update queries to use SQL instead of MongoDB queries
3. Use async PostgreSQL operations

---

## ✅ Verification

### Test Connection

Create a test script `test_db.py`:

```python
import asyncpg
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

async def test_connection():
    try:
        conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
        version = await conn.fetchval('SELECT version()')
        print(f"✅ Connected to PostgreSQL!")
        print(f"Version: {version}")
        await conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_connection())
```

Run it:
```bash
python test_db.py
```

Expected output:
```
✅ Connected to PostgreSQL!
Version: PostgreSQL 16.x on x86_64-pc-linux-gnu...
```

---

## 📊 NeonDB Dashboard Features

### Monitor Your Database

1. **Metrics**: View CPU, memory, storage usage
2. **Query Stats**: See slow queries
3. **Connections**: Monitor active connections
4. **Branches**: Create database branches for testing

### Useful Features

- **Branching**: Create instant database copies for testing
- **Time Travel**: Restore to any point in time
- **Auto-scaling**: Automatically scales based on load
- **Connection Pooling**: Built-in connection pooling

---

## 🔐 Security Best Practices

1. **Never commit `.env`**: Already in `.gitignore`
2. **Use environment variables**: Always use `DATABASE_URL` from env
3. **Rotate passwords**: Change database password periodically
4. **Use SSL**: NeonDB enforces `sslmode=require`
5. **Limit access**: Use IP allowlists if needed

---

## 💡 Tips

### Connection Pooling

For production, use connection pooling:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
```

### Free Tier Limits

NeonDB free tier includes:
- **Storage**: 3 GB
- **Compute**: 191.9 hours/month
- **Branches**: 10 branches
- **Projects**: Unlimited

---

## 🆘 Troubleshooting

### Issue: Connection timeout
**Solution**: Check your internet connection and NeonDB status

### Issue: SSL error
**Solution**: Ensure `?sslmode=require` is in connection string

### Issue: Authentication failed
**Solution**: Verify username and password are correct

### Issue: Database not found
**Solution**: Check database name in connection string

---

## 📚 Resources

- **NeonDB Docs**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **AsyncPG Docs**: https://magicstack.github.io/asyncpg/

---

## 🎓 Next Steps

1. ✅ Create NeonDB account
2. ✅ Get connection string
3. ✅ Update `.env` file
4. ✅ Install dependencies
5. ✅ Create database tables
6. ✅ Test connection
7. 🔄 Update memory store implementation
8. 🔄 Run backend and test

**Your NeonDB PostgreSQL database is now ready!**
