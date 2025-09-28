# AI-Powered Study Assistant

A comprehensive AI-powered study companion that provides personalized learning guidance, programming help, career advice, and interview preparation. Built with React + TypeScript frontend and Node.js + Express backend, powered by Google's Gemini AI.

![AI Study Assistant](frontend/src/assets/kmentor-logo.jpg)

## ✨ Current Status: FULLY RESPONSIVE & FEATURE-COMPLETE ✨

🎉 **Latest Update**: Complete responsive design implementation with LinkedIn-style professional profile page!

## 📚 Table of Contents

- [Features](#features)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Responsive Design](#responsive-design)
- [API Endpoints](#api-endpoints)
- [Environment Setup](#environment-setup)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🌟 Features

### ✅ **Core AI Features:**
- **🤖 Real AI Conversations**: Chat with Google Gemini 2.0 for personalized study assistance
- **📚 Topic-Based Learning**: Specialized help for Programming, JavaScript, Career Guidance, Interview Prep, etc.
- **💬 Modern Chat Interface**: Clean, responsive chat UI similar to ChatGPT/Gemini
- **🎯 Suggested Questions**: Context-aware question suggestions for each topic
- **⚡ Real-time Responses**: Fast AI responses with typing indicators
- **🕒 Message History**: Full conversation history with timestamps

### ✅ **User Experience Features:**
- **📱 Fully Responsive Design**: Mobile-first approach works perfectly on all device sizes (phones, tablets, desktops)
- **🌗 Dark/Light Mode**: Theme support for better user experience
- **🔄 Auto-retry Logic**: Multiple model fallbacks for reliability
- **💡 Smart Error Handling**: Helpful study tips even when AI is unavailable
- **✨ Enhanced Animations**: Study-themed loading animations with gradient effects
- **🎨 Professional UI**: LinkedIn-inspired profile page with modern design patterns

### ✅ **Learning Management Features:**
- **📊 Learning Paths**: Interactive learning path creation and progress tracking
- **👤 Professional Profiles**: LinkedIn-style profile pages with image upload and skills management
- **📄 Resume Analysis**: AI-powered resume feedback and optimization suggestions
- **🛠️ Resume Builder**: Professional resume creation with multiple templates
- **💼 Career Guidance**: Personalized career recommendations and job market insights

### 🚀 **Advanced Features:**
- **🔍 Health Monitoring**: Real-time AI service status indicator
- **🎯 Topic Context**: AI responses tailored to selected study topics
- **💬 Conversation Management**: New chat functionality to start fresh conversations
- **📚 Fallback Content**: Educational content when AI service is temporarily unavailable
- **🎪 Interactive Components**: Animated cards, buttons, and loading spinners

## 🌐 Live Demo

**Frontend**: http://127.0.0.1:3001  
**Backend API**: http://localhost:5001  
**AI Chat Endpoint**: `POST http://localhost:5001/api/ai/ask`  

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- MongoDB (for data persistence)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-Powered-Study-Assistant
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   PORT=5001
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017/ai-study-assistant
   JWT_SECRET=your_jwt_secret_here
   
   # Start backend server
   node server.js
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Open http://127.0.0.1:3001 in your browser
   - Create an account or login
   - Explore all the responsive features on different devices!

## 🏗️ Project Structure

The project is architected with a modern, responsive frontend and a robust backend API:

```
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── services/          # 🔥 AI service with Gemini integration
│   │   │   └── geminiService.js  # Core AI logic with model fallbacks
│   │   ├── routes/            # API endpoints
│   │   │   ├── aiRoutes.js      # 🎯 /api/ai/* routes
│   │   │   ├── userRoutes.js    # User management endpoints
│   │   │   ├── learningPathRoutes.js  # Learning path management
│   │   │   └── resumeRoutes.js  # Resume analysis and building
│   │   ├── config/            # Database and app configuration
│   │   ├── controllers/       # Request handlers for all features
│   │   ├── middleware/        # Authentication, logging, error handling
│   │   └── models/            # Data models for MongoDB
│   ├── server.js              # 🚀 Main server entry point
│   ├── test-gemini.js         # 🧪 AI integration test script
│   └── .env                   # Environment variables
│
└── frontend/                   # React + TypeScript SPA (Fully Responsive)
    ├── src/
    │   ├── pages/             # 📱 Mobile-first responsive pages
    │   │   ├── LandingPage.tsx    # Hero section with responsive design
    │   │   ├── AIMentorPage.tsx   # 💬 Mobile-optimized chat interface
    │   │   ├── ProfilePage.tsx    # 👤 LinkedIn-style professional profile
    │   │   ├── LearningPathPage.tsx  # Interactive learning management
    │   │   ├── ResumeAnalysisPage.tsx  # AI resume feedback
    │   │   └── ResumeBuilderPage.tsx   # Professional resume creation
    │   ├── components/        # 🎨 Enhanced UI components
    │   │   ├── LoadingSpinner.tsx  # Study-themed animations
    │   │   ├── AnimatedButton.tsx  # Interactive button component
    │   │   ├── AnimatedCard.tsx    # Responsive card layouts
    │   │   └── Layout.tsx          # Mobile navigation & sidebar
    │   ├── contexts/          # React state management
    │   │   ├── AuthContext.tsx     # User authentication
    │   │   └── ThemeContext.tsx    # Dark/light mode
    │   ├── services/          # API communication layer
    │   ├── types/             # TypeScript interfaces
    │   └── utils/             # Utility functions and helpers
    ├── tailwind.config.js     # Responsive breakpoint configuration
    └── vite.config.ts         # Vite build configuration
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Model**: Gemini 2.0 Flash Experimental (`gemini-2.0-flash-exp`)
- **Environment**: dotenv for configuration
- **CORS**: Enabled for frontend communication

### Frontend  
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS with responsive breakpoints
- **Icons**: Lucide React
- **Animations**: Framer Motion for enhanced UX
- **HTTP Client**: Fetch API with custom service layer
- **State Management**: React hooks + Context API
- **Routing**: React Router v6

### Responsive Design System
- **Mobile-First**: All components designed for mobile, then enhanced for larger screens
- **Breakpoints**: `sm` (640px+), `md` (768px+), `lg` (1024px+), `xl` (1280px+)
- **Touch Targets**: Minimum 44px for mobile accessibility
- **Typography**: Responsive text scaling across all breakpoints
- **Navigation**: Collapsible sidebar for desktop, mobile hamburger menu

### AI Features
- **Primary Model**: `gemini-2.0-flash-exp` (confirmed working)
- **Fallback Models**: `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`, `gemini-1.5-flash`
- **Context-Aware**: Study buddy persona with topic-specific responses
- **Error Handling**: Graceful degradation with educational fallback content

## 📱 Responsive Design

### Mobile-First Implementation
All pages are designed with a mobile-first approach:

- **Landing Page**: Responsive hero section, mobile-optimized feature cards, collapsible testimonials
- **AI Mentor Chat**: Mobile-friendly header with compact controls, touch-optimized chat interface
- **Profile Page**: LinkedIn-inspired design with mobile image upload, responsive skill management
- **Learning Paths**: Card-based mobile view, table view for desktop, progress tracking
- **Resume Tools**: Touch-friendly forms, responsive preview layouts

### Breakpoint Strategy
```css
/* Mobile: Default styles */
.component { padding: 12px; font-size: 16px; }

/* Small tablets: 640px+ */
@media (min-width: 640px) { 
  .component { padding: 16px; font-size: 18px; }
}

/* Tablets: 768px+ */
@media (min-width: 768px) { 
  .component { padding: 20px; font-size: 20px; }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) { 
  .component { padding: 24px; font-size: 24px; }
}
```

## 🔌 API Endpoints

### Core AI Endpoints
```http
POST /api/ai/ask
Content-Type: application/json
{
  "prompt": "How do I learn JavaScript?",
  "topic": "Programming"
}

GET /api/ai/health
# Returns AI service health status

GET /api/ai/topics  
# Returns available study topics
```

### User Management
```http
POST /api/users/register
POST /api/users/login
GET /api/users/profile
PUT /api/users/profile
```

### Learning Paths
```http
GET /api/learning-paths
GET /api/learning-paths/:id
POST /api/learning-paths
PUT /api/learning-paths/:id
```

### Resume Management
```http
POST /api/resume/analyze
POST /api/resume/save
GET /api/resume/user-resumes
```

## ⚙️ Environment Setup

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Get your API key from: https://makersuite.google.com/app/apikey
```

## 🧪 Testing

### Test AI Integration
```bash
cd backend
node test-gemini.js          # Test current configuration
node test-all-models.js     # Find available models
```

### Test Responsive Design
1. Open the application in different browsers
2. Use browser dev tools to test various screen sizes
3. Test touch interactions on mobile devices
4. Verify all breakpoints function correctly

### Test API Endpoints
```bash
# PowerShell
$body = @{prompt="Hello"; topic="General"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5001/api/ai/ask" -Method POST -Body $body -ContentType "application/json"
```

## 📖 Documentation

Comprehensive documentation is available in the `docs` directory:

- **[API Documentation](docs/API_DOCS.md)**: Complete API reference with examples
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Setup and development workflow  
- **[User Guide](docs/USER_GUIDE.md)**: How to use the AI Study Assistant features
- **[Database Schema](docs/DATABASE_SCHEMA.md)**: MongoDB data structure and relationships
- **[Authentication System](docs/AUTH_SYSTEM.md)**: Security implementation details
- **[Secure User Data Guide](docs/SECURE_USER_DATA_GUIDE.md)**: Data privacy and security

## 🎯 Current Implementation Status

### ✅ Completed Features
- [x] **Real AI integration** with Google Gemini 2.0
- [x] **Fully responsive design** for mobile, tablet, and desktop
- [x] **LinkedIn-style profile page** with image upload and skills management
- [x] **Enhanced loading animations** with study-themed content and gradients
- [x] **Mobile-optimized chat interface** with compact controls
- [x] **Learning path management** with progress tracking
- [x] **Resume analysis and building** with AI feedback
- [x] **User authentication** with JWT and secure data storage
- [x] **Dark/light mode** with persistent theme selection
- [x] **Professional UI components** with consistent design patterns

### 🚀 Advanced Features Implemented
- [x] Interactive animated components
- [x] Touch-optimized mobile interface
- [x] Professional profile management
- [x] Skills and career tracking
- [x] Real-time AI health monitoring
- [x] Comprehensive error handling
- [x] Mobile-first responsive breakpoints

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit changes**: `git commit -am 'Add some feature'`
4. **Push to branch**: `git push origin feature/your-feature-name`
5. **Create a Pull Request**

### Development Setup
```bash
# Backend development with auto-restart
cd backend && nodemon server.js

# Frontend development with hot reload  
cd frontend && npm run dev

# Run tests
cd backend && npm test
```

### Design Guidelines
- Follow mobile-first responsive design principles
- Use Tailwind CSS utility classes for consistent styling
- Implement proper touch targets (minimum 44px) for mobile
- Test across multiple screen sizes and devices
- Maintain accessibility standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For providing the AI capabilities
- **React Team**: For the excellent frontend framework
- **Tailwind CSS**: For the utility-first CSS framework with responsive design
- **Vite**: For the fast build tool and development experience
- **MongoDB**: For flexible data storage solutions

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in the `/docs` folder
2. **Test responsive design** on different devices and screen sizes
3. **Run the test scripts** to verify your setup:
   ```bash
   cd backend
   node test-gemini.js
   node test-all-models.js
   ```
4. **Open an issue** on GitHub with detailed information

---

**Built with ❤️ for learners everywhere** 

**Status**: 🟢 Fully Functional & Responsive | **Last Updated**: September 28, 2025