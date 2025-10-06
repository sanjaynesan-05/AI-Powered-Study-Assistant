# PostgreSQL Migration Guide

This guide will help you migrate from MongoDB to PostgreSQL for the AI-Powered Study Assistant.

## Prerequisites

1. **Install PostgreSQL**
   - Download and install PostgreSQL from: https://www.postgresql.org/download/
   - Remember the password you set for the postgres user during installation
   - Default port is 5432

2. **Create Database**
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create database
   CREATE DATABASE ai_study_assistant;
   
   -- Create user (optional)
   CREATE USER ai_assistant WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ai_study_assistant TO ai_assistant;
   ```

## Environment Configuration

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file with your PostgreSQL credentials**
   ```env
   DATABASE_NAME=ai_study_assistant
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_actual_password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   
   NODE_ENV=development
   PORT=5000
   ```

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Database Migration**
   ```bash
   npm run migrate
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

## Key Changes from MongoDB to PostgreSQL

### Models
- **MongoDB**: Uses Mongoose schemas
- **PostgreSQL**: Uses Sequelize models with proper data types
- **UUIDs**: Primary keys are now UUIDs instead of ObjectIds
- **JSONB**: Complex data structures stored as JSONB for better performance

### Relationships
- **Foreign Keys**: Proper foreign key constraints
- **Associations**: Defined using Sequelize associations
- **Indexes**: Automatic indexing on foreign keys and important fields

### Queries
- **Find Operations**: `findOne({ email })` → `findOne({ where: { email } })`
- **Create Operations**: `new Model()` → `Model.create()`
- **Update Operations**: `findByIdAndUpdate()` → `model.update()`
- **Delete Operations**: `findByIdAndDelete()` → `model.destroy()`

## Benefits of PostgreSQL

1. **ACID Compliance**: Better data consistency and reliability
2. **Advanced Features**: JSON/JSONB support, full-text search, advanced indexing
3. **Scalability**: Better performance for complex queries
4. **Data Integrity**: Foreign key constraints and validation
5. **SQL Power**: Rich query language with joins, aggregations, etc.

## Testing the Migration

1. **API Endpoints**: All existing API endpoints should work without changes
2. **Authentication**: JWT authentication remains the same
3. **Data Persistence**: Progress tracking and user data now stored in PostgreSQL
4. **Real-time Features**: WebSocket functionality unaffected

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
```

### Permission Issues
```sql
-- Grant permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Reset Database
```bash
# Drop and recreate database if needed
npm run migrate -- --force
```

## File Structure Changes

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Updated for PostgreSQL
│   │   └── database.js        # New Sequelize config
│   ├── models/
│   │   ├── indexPG.js         # Central model index
│   │   ├── userModelPG.js     # PostgreSQL User model
│   │   ├── progressModelsPG.js # Progress models
│   │   └── ...                # Other PostgreSQL models
│   ├── controllers/
│   │   ├── userControllerPG.js # Updated for Sequelize
│   │   └── progressControllerPG.js
│   └── middleware/
│       └── authMiddlewarePG.js # Updated auth middleware
├── migrate.js                 # Database migration script
└── .env.example              # PostgreSQL environment template
```

## Next Steps

1. **Update Frontend**: No changes needed for frontend - all APIs remain compatible
2. **Performance Tuning**: Add indexes for frequently queried fields
3. **Backup Strategy**: Set up regular PostgreSQL backups
4. **Monitoring**: Implement database monitoring and logging