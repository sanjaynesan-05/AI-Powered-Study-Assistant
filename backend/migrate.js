const { sequelize } = require('./src/config/database');
const models = require('./src/models/indexPG');

async function migrateDatabase() {
  try {
    console.log('🔄 Starting PostgreSQL database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All models synchronized successfully');
    
    console.log('🎉 Database migration completed successfully!');
    
    // Optional: Create sample data
    await createSampleData();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  try {
    console.log('📝 Creating sample data...');
    
    const { User, UserProfile, StudyMaterial } = models;
    
    // Check if any users exist
    const userCount = await User.count();
    
    if (userCount === 0) {
      // Create a sample user
      const sampleUser = await User.create({
        name: 'Sample User',
        email: 'sample@example.com',
        password: 'password123',
        interests: ['JavaScript', 'React', 'Node.js'],
        skills: ['Frontend Development', 'Backend Development']
      });
      
      // Create user profile
      await UserProfile.create({
        userId: sampleUser.id,
        bio: 'Sample user for testing the AI Study Assistant',
        education: 'student',
        location: {
          city: 'Sample City',
          country: 'Sample Country'
        }
      });
      
      // Create sample study material
      await StudyMaterial.create({
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming',
        category: 'Programming',
        difficulty: 'beginner',
        contentType: 'text',
        content: {
          text: 'JavaScript is a programming language...',
          examples: ['console.log("Hello World");']
        },
        estimatedTime: 60,
        tags: ['javascript', 'programming', 'basics'],
        createdBy: sampleUser.id
      });
      
      console.log('✅ Sample data created successfully');
    } else {
      console.log('ℹ️  Sample data already exists, skipping creation');
    }
  } catch (error) {
    console.error('⚠️  Error creating sample data:', error);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase, createSampleData };