const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const LearningPath = require('./models/learningPathModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    profilePicture: 'admin.jpg',
    skills: ['JavaScript', 'React', 'Node.js'],
    interests: ['Web Development', 'AI', 'Machine Learning'],
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    profilePicture: 'john.jpg',
    skills: ['Python', 'Data Science', 'SQL'],
    interests: ['AI', 'Machine Learning', 'Data Visualization'],
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    profilePicture: 'jane.jpg',
    skills: ['UX Design', 'UI Design', 'Figma'],
    interests: ['Design', 'User Experience', 'Web Design'],
  },
];

const learningPaths = [
  {
    title: 'Become a React Developer',
    description: 'Learn everything you need to become a React developer',
    category: 'Frontend Development',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    steps: [
      {
        title: 'Learn JavaScript Fundamentals',
        description: 'Master JavaScript basics before diving into React',
        resources: [
          {
            title: 'JavaScript Basics',
            url: 'https://javascript.info/',
            type: 'Course',
          },
          {
            title: 'JavaScript ES6 Features',
            url: 'https://www.udemy.com/course/javascript-es6-tutorial/',
            type: 'Course',
          },
        ],
        completed: false,
      },
      {
        title: 'React Basics',
        description: 'Learn the basics of React including components, props, and state',
        resources: [
          {
            title: 'React Documentation',
            url: 'https://reactjs.org/docs/getting-started.html',
            type: 'Article',
          },
          {
            title: 'React Crash Course',
            url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
            type: 'Video',
          },
        ],
        completed: false,
      },
      {
        title: 'Build a React Project',
        description: 'Apply your knowledge by building a real-world project',
        resources: [
          {
            title: 'Build a To-Do App with React',
            url: 'https://www.youtube.com/watch?v=pCA4qpQDZD8',
            type: 'Video',
          },
          {
            title: 'React Project Ideas',
            url: 'https://www.freecodecamp.org/news/react-projects-to-improve-your-skills/',
            type: 'Article',
          },
        ],
        completed: false,
      },
    ],
    isPublic: true,
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    title: 'Data Science for Beginners',
    description: 'A comprehensive path to learn data science from scratch',
    category: 'Data Science',
    difficulty: 'Beginner',
    estimatedTime: 60,
    steps: [
      {
        title: 'Learn Python Basics',
        description: 'Python is the foundation of most data science work',
        resources: [
          {
            title: 'Python for Everybody',
            url: 'https://www.py4e.com/',
            type: 'Course',
          },
          {
            title: 'Python Crash Course',
            url: 'https://ehmatthes.github.io/pcc/',
            type: 'Book',
          },
        ],
        completed: false,
      },
      {
        title: 'Data Analysis with Pandas',
        description: 'Learn to manipulate and analyze data with Pandas',
        resources: [
          {
            title: 'Pandas Documentation',
            url: 'https://pandas.pydata.org/docs/',
            type: 'Article',
          },
          {
            title: 'Data Analysis with Pandas',
            url: 'https://www.youtube.com/watch?v=vmEHCJofslg',
            type: 'Video',
          },
        ],
        completed: false,
      },
      {
        title: 'Data Visualization',
        description: 'Learn to create compelling visualizations',
        resources: [
          {
            title: 'Matplotlib Tutorial',
            url: 'https://matplotlib.org/stable/tutorials/index.html',
            type: 'Article',
          },
          {
            title: 'Seaborn Tutorial',
            url: 'https://seaborn.pydata.org/tutorial.html',
            type: 'Article',
          },
        ],
        completed: false,
      },
    ],
    isPublic: true,
    tags: ['Python', 'Data Science', 'Pandas', 'Matplotlib'],
  },
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await LearningPath.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Add createdBy field to learning paths
    const sampleLearningPaths = learningPaths.map((path) => {
      return { ...path, createdBy: adminUser };
    });

    // Insert learning paths
    await LearningPath.insertMany(sampleLearningPaths);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await LearningPath.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
