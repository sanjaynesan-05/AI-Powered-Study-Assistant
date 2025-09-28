# Development Guide

This document provides guidelines and information for developers working on the AI-Powered Study Assistant.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Responsive Design System](#responsive-design-system)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Backend Development](#backend-development)
7. [Frontend Development](#frontend-development)
8. [Testing](#testing)
9. [Deployment](#deployment)

## Development Environment Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (local or cloud instance)
- Git
- Code editor (VS Code recommended with React/TypeScript extensions)
- Browser developer tools for responsive testing

### Setting Up the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-powered-study-assistant.git
   cd ai-powered-study-assistant
   ```

2. Backend setup:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string, JWT secret, and Gemini API key
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

   # In frontend directory (separate terminal)
   npm run dev
   ```

5. Access the application:
   - Backend API: http://localhost:5001
   - Frontend: http://localhost:5173
   - Test responsive design using browser dev tools

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   │   └── db.js       # Database connection
│   ├── controllers/    # Route controllers
│   │   ├── userController.js         # User management
│   │   ├── learningPathController.js # Learning paths
│   │   ├── mentorController.js       # AI mentor logic
│   │   └── resumeController.js       # Resume features
│   ├── middleware/     # Custom middleware
│   │   ├── authMiddleware.js         # JWT authentication
│   │   ├── errorMiddleware.js        # Error handling
│   │   └── requestLogger.js          # Request logging
│   ├── models/         # Mongoose models
│   │   ├── userModel.js              # User data schema
│   │   ├── learningPathModel.js      # Learning path schema
│   │   └── resumeModel.js            # Resume data schema
│   ├── routes/         # API routes
│   │   ├── aiRoutes.js               # AI mentor endpoints
│   │   ├── userRoutes.js             # User management
│   │   ├── learningPathRoutes.js     # Learning path APIs
│   │   └── resumeRoutes.js           # Resume APIs
│   ├── services/       # Business logic services
│   │   └── geminiService.js          # AI integration service
│   ├── seedData.js     # Database seeding script
│   └── index.js        # Main entry point
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets
│   │   └── kmentor-logo.jpg
│   ├── components/     # Reusable UI components
│   │   ├── Layout.tsx              # Responsive layout wrapper
│   │   ├── Sidebar.tsx             # Desktop sidebar navigation
│   │   ├── MobileNavbar.tsx        # Mobile hamburger menu
│   │   ├── LoadingSpinner.tsx      # Enhanced animated spinner
│   │   ├── AnimatedButton.tsx      # Interactive button component
│   │   ├── AnimatedCard.tsx        # Responsive card component
│   │   └── ProtectedRoute.tsx      # Auth-protected routes
│   ├── contexts/       # React contexts
│   │   ├── AuthContext.tsx         # User authentication
│   │   └── ThemeContext.tsx        # Dark/light mode
│   ├── pages/          # Page components (All fully responsive)
│   │   ├── LandingPage.tsx         # Marketing page
│   │   ├── AIMentorPage.tsx        # Chat interface
│   │   ├── ProfilePage.tsx         # LinkedIn-style profile
│   │   ├── LearningPathPage.tsx    # Learning management
│   │   ├── ResumeAnalysisPage.tsx  # Resume feedback
│   │   └── ResumeBuilderPage.tsx   # Resume creation
│   ├── services/       # API services
│   │   ├── api.ts                  # Base API configuration
│   │   ├── aiMentorService.ts      # AI chat service
│   │   └── userDataService.ts      # User data management
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/          # Utility functions
│   │   └── enhancedPdfGenerator.ts # PDF generation
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── tailwind.config.js  # Responsive design configuration
├── postcss.config.js   # CSS processing
└── package.json
```

## Responsive Design System

### Mobile-First Philosophy
All components are designed mobile-first, then enhanced for larger screens:

```typescript
// Example: Mobile-first button component
const ResponsiveButton = () => (
  <button className="
    px-3 py-2 text-sm          // Mobile default
    sm:px-4 sm:py-2 sm:text-base  // Small screens+
    md:px-6 md:py-3 md:text-lg    // Medium screens+
    lg:px-8 lg:py-4 lg:text-xl    // Large screens+
  ">
    Click Me
  </button>
);
```

### Breakpoint System
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Small tablets
      'md': '768px',   // Tablets
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Large laptops/desktops
      '2xl': '1536px', // Large desktops
    }
  }
}
```

### Touch Target Guidelines
- **Minimum size**: 44px × 44px for all interactive elements
- **Spacing**: Minimum 8px between touch targets
- **Hover states**: Desktop only (using `@media (hover: hover)`)

### Typography Scale
```css
/* Mobile-first typography scaling */
.heading {
  @apply text-xl;           /* Mobile: 20px */
  @apply sm:text-2xl;       /* Small: 24px */
  @apply md:text-3xl;       /* Medium: 30px */
  @apply lg:text-4xl;       /* Large: 36px */
}
```

## Coding Standards

### General Guidelines

- Use consistent formatting (enforced by ESLint and Prettier)
- Write self-documenting code with descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single task
- Avoid code duplication
- Follow responsive design principles in all components

### Backend Standards

- Follow RESTful API conventions
- Implement proper error handling with status codes
- Use async/await for asynchronous operations
- Validate all incoming requests
- Document API endpoints with examples
- Include proper CORS configuration for frontend integration

### Frontend Standards

- Use functional components with hooks
- Maintain type safety with TypeScript
- Follow component composition patterns
- **Implement responsive design** using mobile-first approach
- Organize CSS with TailwindCSS utility classes
- Extract reusable logic into custom hooks
- Follow accessibility guidelines (WCAG 2.1)

### Responsive Design Standards

#### Component Design Rules:
1. **Mobile-first approach**: Design for mobile, enhance for desktop
2. **Touch targets**: Minimum 44px × 44px for interactive elements
3. **Flexible layouts**: Use CSS Grid and Flexbox for responsive layouts
4. **Breakpoint consistency**: Use standard Tailwind breakpoints
5. **Content hierarchy**: Prioritize important content for smaller screens

#### Example Component Pattern:
```tsx
const ResponsiveCard: React.FC = ({ children }) => (
  <div className="
    p-3 mx-2 mb-3          // Mobile: tight spacing
    sm:p-4 sm:mx-4 sm:mb-4 // Tablet: moderate spacing  
    lg:p-6 lg:mx-6 lg:mb-6 // Desktop: generous spacing
    bg-white rounded-lg shadow-md
    transition-all duration-200
  ">
    {children}
  </div>
);
```

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
2. Develop and test your feature (including responsive design testing)
3. Test across multiple screen sizes and devices
4. Push your branch and create a PR to `develop`
5. Ensure the CI pipeline passes
6. Get code review approval (including responsive design review)
7. Merge to `develop`

## Backend Development

### API Structure

- Follow RESTful principles
- Group related endpoints under a common base path
- Use JWT for authentication
- Implement rate limiting for public endpoints
- Support CORS for frontend integration

### Database Guidelines

- Use Mongoose schemas with validation
- Create indexes for frequently queried fields
- Use reference relationships appropriately
- Implement pagination for list endpoints
- Design for scalability and performance

### Error Handling

- Use a consistent error response format
- Include appropriate HTTP status codes
- Provide meaningful error messages
- Log errors with sufficient context for debugging

## Frontend Development

### Component Organization

- Create small, reusable components
- Maintain a clear component hierarchy
- Use React Router for navigation
- Implement lazy loading for better performance
- **Design all components mobile-first**

### Responsive Design Implementation

#### Layout Patterns:
```tsx
// Grid layout that adapts to screen size
<div className="
  grid grid-cols-1     // Mobile: single column
  sm:grid-cols-2       // Tablet: two columns
  lg:grid-cols-3       // Desktop: three columns
  gap-4 p-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### Navigation Patterns:
```tsx
// Adaptive navigation
const Navigation = () => (
  <>
    {/* Desktop Sidebar */}
    <div className="hidden lg:block fixed left-0 top-0 w-64 h-full">
      <DesktopSidebar />
    </div>
    
    {/* Mobile Header with Hamburger */}
    <div className="lg:hidden fixed top-0 w-full z-50">
      <MobileHeader />
    </div>
  </>
);
```

### State Management

- Use React Context for global state
- Leverage local component state for UI-specific state
- Consider Redux only for complex state requirements
- Implement proper loading states for responsive UX

### Styling Guidelines

#### Mobile-First CSS:
```css
/* Base mobile styles */
.component {
  padding: 0.75rem;
  font-size: 0.875rem;
}

/* Enhanced for tablets */
@screen sm {
  .component {
    padding: 1rem;
    font-size: 1rem;
  }
}

/* Enhanced for desktop */
@screen lg {
  .component {
    padding: 1.5rem;
    font-size: 1.125rem;
  }
}
```

### Performance Optimization

- Memoize expensive calculations
- Use React.memo for pure components
- Implement code splitting
- Optimize images for different screen densities
- Use responsive images with appropriate srcset attributes

## Testing

### Backend Testing

- Unit tests for models and utilities
- Integration tests for API endpoints
- Use Jest as the test runner
- Maintain a test database for integration tests
- Test error handling and edge cases

### Frontend Testing

- Unit tests for components and utilities
- Integration tests for page flows
- Use React Testing Library and Jest
- Implement snapshot testing for UI components
- **Test responsive behavior across breakpoints**

### Responsive Design Testing

#### Manual Testing Checklist:
- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Verify touch targets meet 44px minimum
- [ ] Check text readability across screen sizes
- [ ] Test form usability on mobile keyboards
- [ ] Verify navigation works on all devices
- [ ] Test loading states and animations

#### Automated Testing:
```javascript
// Example responsive test
describe('ResponsiveCard', () => {
  it('adapts layout for mobile screens', () => {
    render(<ResponsiveCard />, { 
      viewport: { width: 375, height: 667 } 
    });
    
    expect(screen.getByTestId('card')).toHaveClass('p-3');
  });
  
  it('adapts layout for desktop screens', () => {
    render(<ResponsiveCard />, { 
      viewport: { width: 1280, height: 720 } 
    });
    
    expect(screen.getByTestId('card')).toHaveClass('lg:p-6');
  });
});
```

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
