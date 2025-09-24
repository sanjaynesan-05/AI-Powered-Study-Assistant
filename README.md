# AI Mentor Platform

A comprehensive AI-powered mentoring platform designed to provide personalized guidance, career advice, learning path suggestions, resume analysis, and interview preparation assistance. This platform combines the power of AI with a user-friendly interface to deliver a seamless mentoring experience.

![AI Mentor Platform](frontend/src/assets/kmentor-logo.jpg)

## 📚 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Technology Stack](#technology-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Features

- **AI Mentor Conversations**: Engage with an AI mentor for personalized guidance on various topics, including career advice, learning paths, and interview preparation.
- **Career Guidance**: Receive tailored career advice based on your skills, interests, and goals.
- **Secure Authentication**: Robust authentication system using JWT tokens, ensuring secure access to protected routes and user data.
- **Learning Path Suggestions**: Get customized learning paths designed to help you achieve your career objectives.
- **Resume Analysis**: Upload your resume to receive professional feedback and suggestions for improvement.
- **Resume Builder**: Create professional resumes with guided assistance and customizable templates.
- **Interactive User Interface**: A modern, responsive UI with light/dark mode support for an enhanced user experience.
- **Personalized Recommendations**: Receive content and suggestions tailored to your profile and preferences.
- **User Authentication**: Secure login and registration system with email/password authentication.

## 🏗️ Project Structure

The project is divided into two main parts: the backend and the frontend. Below is an overview of the directory structure:

```
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── config/        # Database and app configuration files
│   │   ├── controllers/   # Request handlers for various features
│   │   ├── middleware/    # Custom middleware for authentication, error handling, etc.
│   │   ├── models/        # MongoDB models for data storage
│   │   └── routes/        # API routes for different functionalities
└── frontend/              # React (TypeScript) frontend
    ├── src/
    │   ├── assets/        # Static assets like images and icons
    │   ├── components/    # Reusable UI components
    │   ├── contexts/      # React contexts for global state management
    │   ├── pages/         # Application pages
    │   ├── services/      # API service layer for backend communication
    │   ├── types/         # TypeScript types for type safety
    │   └── utils/         # Utility functions for common tasks
```

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v16 or higher): [Download Node.js](https://nodejs.org/)
- **MongoDB**: A running instance of MongoDB for database operations. [Download MongoDB](https://www.mongodb.com/try/download/community)
- **npm** or **yarn**: Package managers for Node.js.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ai-mentor-platform.git
   cd ai-mentor-platform
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   ```

5. **Start the application**:
   - On Windows: Run the `start_services.bat` file.
   - On Unix/Mac: Run the `./start_services.sh` file.
   - Alternatively, start the backend and frontend manually:
     ```bash
     # Terminal 1: Start the backend
     cd backend
     npm run dev

     # Terminal 2: Start the frontend
     cd frontend
     npm run dev
     ```

6. **Access the application**:
   Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

## 💻 Technology Stack

### Backend

The backend is built using the following technologies:

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for creating RESTful APIs.
- **MongoDB**: NoSQL database for storing user data and application content.
- **Mongoose**: ODM library for MongoDB.
- **JWT Authentication**: Secure token-based authentication.
- **RESTful API**: Standardized API design for communication between frontend and backend.

### Frontend

The frontend is built using the following technologies:

- **React 18**: JavaScript library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety and better developer experience.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Framer Motion**: Library for animations and transitions.
- **Vite**: Fast build tool for modern web applications.
- **React Router**: Library for handling navigation and routing.

## 📖 Documentation

Comprehensive documentation is available in the `docs` directory. Key documents include:

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
