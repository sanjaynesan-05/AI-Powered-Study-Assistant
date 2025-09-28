# AI-Powered Study Assistant

A comprehensive AI-powered study companion that provides personalized learning guidance, programming help, career advice, and interview preparation. Built with React + TypeScript frontend and Node.js + Express backend, powered by Google's Gemini AI.

![AI Study Assistant](frontend/src/assets/kmentor-logo.jpg)

## ✨ Current Status: FULLY FUNCTIONAL ✨

🎉 **Day 2 Complete**: Real AI chatbot integration working with Google Gemini 2.0!

## 📚 Table of Contents

- [Features](#features)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [API Endpoints](#api-endpoints)
- [Environment Setup](#environment-setup)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🌟 Features

### ✅ **Working Features:**
- **🤖 Real AI Conversations**: Chat with Google Gemini 2.0 for personalized study assistance
- **📚 Topic-Based Learning**: Specialized help for Programming, JavaScript, Career Guidance, Interview Prep, etc.
- **💬 Modern Chat Interface**: Clean, responsive chat UI similar to ChatGPT/Gemini
- **🎯 Suggested Questions**: Context-aware question suggestions for each topic
- **⚡ Real-time Responses**: Fast AI responses with typing indicators
- **🕒 Message History**: Full conversation history with timestamps
- **🌗 Dark/Light Mode**: Theme support for better user experience
- **📱 Mobile Responsive**: Works perfectly on all device sizes
- **🔄 Auto-retry Logic**: Multiple model fallbacks for reliability
- **💡 Smart Error Handling**: Helpful study tips even when AI is unavailable

### 🚀 **Advanced Features:**
- **Health Monitoring**: Real-time AI service status indicator
- **Topic Context**: AI responses tailored to selected study topics
- **Conversation Management**: New chat functionality to start fresh conversations
- **Fallback Content**: Educational content when AI service is temporarily unavailable

## � Live Demo

**Frontend**: http://127.0.0.1:3001  
**Backend API**: http://localhost:5001  
**AI Chat Endpoint**: `POST http://localhost:5001/api/ai/ask`  

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

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
   - Navigate to AI Mentor page
   - Start chatting with your AI study assistant!

## �🏗️ Project Structure

The project is divided into two main parts: the backend and the frontend. Below is an overview of the directory structure:

```
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── services/          # 🔥 AI service with Gemini integration
│   │   │   └── geminiService.js  # Core AI logic with model fallbacks
│   │   ├── routes/            # API endpoints
│   │   │   └── aiRoutes.js      # 🎯 /api/ai/* routes
│   │   ├── config/            # Database and app configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Authentication, logging, etc.
│   │   └── models/            # Data models (currently in-memory)
│   ├── server.js              # 🚀 Main server entry point
│   ├── test-gemini.js         # 🧪 AI integration test script
│   ├── test-all-models.js     # 🔍 Model availability checker
│   └── .env                   # Environment variables
│
└── frontend/                   # React + TypeScript SPA
    ├── src/
    │   ├── pages/             # Application pages
    │   │   └── AIMentorPage.tsx  # 💬 Main chat interface
    │   ├── services/          # API communication
    │   │   ├── aiMentorService.ts  # 🔌 AI service client
    │   │   └── api.ts           # Base API utilities
    │   ├── components/        # Reusable UI components
    │   ├── contexts/          # React state management
    │   ├── assets/            # Images, fonts, etc.
    │   └── types/             # TypeScript interfaces
    ├── package.json
    └── vite.config.ts         # Vite configuration
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Model**: Gemini 2.0 Flash Experimental (`gemini-2.0-flash-exp`)
- **Environment**: dotenv for configuration
- **CORS**: Enabled for frontend communication

### Frontend  
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API with custom service layer
- **State Management**: React hooks (useState, useEffect)

### AI Features
- **Primary Model**: `gemini-2.0-flash-exp` (confirmed working)
- **Fallback Models**: `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`, `gemini-1.5-flash`
- **Context-Aware**: Study buddy persona with topic-specific responses
- **Error Handling**: Graceful degradation with educational fallback content

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

### Legacy Endpoints
```http
POST /api/ai-chat
# Backward compatible endpoint
```

## ⚙️ Environment Setup

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

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
- **[User Guide](docs/USER_GUIDE.md)**: How to use the AI Study Assistant
- **[Database Schema](docs/DATABASE_SCHEMA.md)**: Current data structure (in-memory)

## 🎯 Current Implementation Status

### ✅ Completed Features (Day 2)
- [x] Real AI integration with Google Gemini 2.0
- [x] Modern chat interface with React + TypeScript
- [x] Topic-based learning assistance
- [x] Suggested questions and conversation starters
- [x] Real-time message history with timestamps
- [x] Error handling and service health monitoring
- [x] Mobile-responsive design
- [x] Dark/light mode support
- [x] API endpoints with comprehensive error handling

### 🚧 Future Enhancements (Days 3-7)
- [ ] User authentication and profiles
- [ ] Conversation persistence
- [ ] Resume analysis and feedback
- [ ] Learning path recommendations
- [ ] Progress tracking and analytics
- [ ] Advanced study tools and resources

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For providing the AI capabilities
- **React Team**: For the excellent frontend framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast build tool and development experience

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in the `/docs` folder
2. **Run the test scripts** to verify your setup:
   ```bash
   cd backend
   node test-gemini.js
   node test-all-models.js
   ```
3. **Open an issue** on GitHub with detailed information

---

**Built with ❤️ for learners everywhere** 

**Status**: 🟢 Fully Functional | **Last Updated**: September 28, 2025

- [API Documentation](./docs/API_DOCS.md): Detailed information about the available API endpoints.
- [Authentication System](./docs/AUTH_SYSTEM.md): Explanation of the authentication flow and security measures.
- [User Guide](./docs/USER_GUIDE.md): Instructions for end-users on how to use the platform.
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md): Guidelines for developers contributing to the project.
- [Database Schema](./docs/DATABASE_SCHEMA.md): Overview of the database structure and relationships.

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your commit message here"
   ```
4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request to the main repository.

Please read our [contributing guidelines](./CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
