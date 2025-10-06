const { sequelize } = require('./database');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully');
    
    // Sync database tables (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to PostgreSQL database:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
