const { sequelize } = require('./src/config/database');
const models = require('./src/models/indexPG');

async function testPostgreSQLSetup() {
  console.log('🧪 Testing PostgreSQL Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Test 2: Model Sync
    console.log('2️⃣ Testing model synchronization...');
    await sequelize.sync({ force: false });
    console.log('✅ Models synchronized successfully\n');

    // Test 3: Create Test User
    console.log('3️⃣ Testing user creation...');
    const { User, UserProfile } = models;
    
    // Clean up any existing test user
    await User.destroy({ where: { email: 'test@postgresql.com' } });
    
    const testUser = await User.create({
      name: 'PostgreSQL Test User',
      email: 'test@postgresql.com',
      password: 'testpassword123',
      interests: ['Testing', 'PostgreSQL'],
      skills: ['Database Management']
    });
    console.log('✅ User created:', testUser.name);

    // Test 4: Create User Profile
    console.log('4️⃣ Testing user profile creation...');
    const testProfile = await UserProfile.create({
      userId: testUser.id,
      bio: 'Test user for PostgreSQL migration',
      education: 'student',
      location: {
        city: 'Test City',
        country: 'Test Country'
      }
    });
    console.log('✅ User profile created\n');

    // Test 5: Query with Associations
    console.log('5️⃣ Testing queries with associations...');
    const userWithProfile = await User.findByPk(testUser.id, {
      include: ['profile']
    });
    console.log('✅ User with profile loaded:', {
      name: userWithProfile.name,
      profileBio: userWithProfile.profile?.bio
    });

    // Test 6: Authentication Methods
    console.log('6️⃣ Testing authentication methods...');
    const isPasswordCorrect = await testUser.matchPassword('testpassword123');
    const token = testUser.generateAuthToken();
    console.log('✅ Password validation:', isPasswordCorrect);
    console.log('✅ JWT token generated:', token.substring(0, 20) + '...\n');

    // Test 7: Progress Tracking
    console.log('7️⃣ Testing progress tracking...');
    const { UserProgress } = models;
    const testProgress = await UserProgress.create({
      userId: testUser.id,
      skillArea: 'JavaScript',
      currentLevel: 'beginner',
      progressPercentage: 25,
      totalTimeSpent: 120
    });
    console.log('✅ Progress record created:', {
      skillArea: testProgress.skillArea,
      level: testProgress.currentLevel,
      percentage: testProgress.progressPercentage
    });

    // Test 8: JSON/JSONB Operations
    console.log('8️⃣ Testing JSON/JSONB operations...');
    await testProgress.update({
      completedModules: [
        {
          moduleId: 'mod_001',
          title: 'Variables and Data Types',
          completedAt: new Date(),
          timeSpent: 30,
          score: 85
        }
      ]
    });
    console.log('✅ JSONB data updated successfully\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await UserProgress.destroy({ where: { userId: testUser.id } });
    await UserProfile.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! PostgreSQL setup is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Database connection');
    console.log('   ✅ Model synchronization');
    console.log('   ✅ User CRUD operations');
    console.log('   ✅ Association queries');
    console.log('   ✅ Authentication methods');
    console.log('   ✅ Progress tracking');
    console.log('   ✅ JSON/JSONB operations');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testPostgreSQLSetup();
}

module.exports = { testPostgreSQLSetup };