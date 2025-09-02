# Development Guide

This document provides guidelines and information for developers working on the AI Mentor Platform.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Git Workflow](#git-workflow)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Deployment](#deployment)

## Development Environment Setup

### Prerequisites

- Node.js (v16+)
- MongoDB
- Git
- Code editor (VS Code recommended)

### Setting Up the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-mentor-platform.git
   cd ai-mentor-platform
   ```

2. Backend setup:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   ```

3. Frontend setup:
   ```bash
   cd ../frontend
   npm install
   ```

4. Start development servers:
   ```bash
   # In backend directory
   npm run dev

   # In frontend directory
   npm run dev
   ```

5. Access the application:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5173

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   │   └── db.js       # Database connection
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── seedData.js     # Database seeding script
│   └── index.js        # Main entry point
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
└── package.json
```

## Coding Standards

### General Guidelines

- Use consistent formatting (enforced by ESLint)
- Write self-documenting code with descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single task
- Avoid code duplication

### Backend Standards

- Follow RESTful API conventions
- Implement proper error handling with status codes
- Use async/await for asynchronous operations
- Validate all incoming requests
- Document API endpoints

### Frontend Standards

- Use functional components with hooks
- Maintain type safety with TypeScript
- Follow component composition patterns
- Implement responsive design
- Organize CSS with TailwindCSS utility classes
- Extract reusable logic into custom hooks

## Git Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/<feature-name>` - Feature branches
- `bugfix/<bug-name>` - Bug fix branches
- `release/<version>` - Release preparation branches

### Commit Guidelines

- Use conventional commit messages:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Formatting changes
  - `refactor`: Code refactoring
  - `test`: Adding or updating tests
  - `chore`: Maintenance tasks

### Pull Request Process

1. Create a feature branch from `develop`
2. Develop and test your feature
3. Push your branch and create a PR to `develop`
4. Ensure the CI pipeline passes
5. Get code review approval
6. Merge to `develop`

## Backend Development

### API Structure

- Follow RESTful principles
- Group related endpoints under a common base path
- Use JWT for authentication
- Implement rate limiting for public endpoints

### Database Guidelines

- Use Mongoose schemas with validation
- Create indexes for frequently queried fields
- Use reference relationships sparingly
- Implement pagination for list endpoints

### Error Handling

- Use a consistent error response format
- Include appropriate HTTP status codes
- Provide meaningful error messages
- Log errors with sufficient context

## Frontend Development

### Component Organization

- Create small, reusable components
- Maintain a clear component hierarchy
- Use React Router for navigation
- Implement lazy loading for better performance

### State Management

- Use React Context for global state
- Leverage local component state for UI-specific state
- Consider Redux only for complex state requirements

### Styling

- Use TailwindCSS for styling components
- Create reusable UI components
- Ensure responsive design for all screen sizes
- Support both light and dark themes

### Performance Optimization

- Memoize expensive calculations
- Use React.memo for pure components
- Implement code splitting
- Optimize images and assets

## Testing

### Backend Testing

- Unit tests for models and utilities
- Integration tests for API endpoints
- Use Jest as the test runner
- Maintain a test database for integration tests

### Frontend Testing

- Unit tests for components and utilities
- Integration tests for page flows
- Use React Testing Library and Jest
- Implement snapshot testing for UI components

## Deployment

### Environment Configuration

- Use environment variables for configuration
- Keep sensitive information out of the codebase
- Document required environment variables

### Deployment Process

1. Run the test suite
2. Build the frontend assets
3. Deploy backend to server
4. Deploy frontend to static hosting
5. Run smoke tests to verify deployment

### Production Considerations

- Set up monitoring and logging
- Configure proper CORS settings
- Implement rate limiting
- Set up database backups
