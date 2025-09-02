export interface User {
  id: string;
  username: string;
  email: string;
  dateOfBirth?: string;
  education?: 'student' | 'graduate';
  profilePhoto?: string;
  skills: string[];
  interests: string[];
  resumeUrl?: string;
  role?: string;
  token?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  dateOfBirth?: string;
  education?: 'student' | 'graduate' | 'professional' | 'other';
  location?: {
    city?: string;
    country?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
  };
}

export interface ContentItem {
  id: string;
  userId: string;
  contentType: string;
  title: string;
  description?: string;
  content: unknown;
  tags?: string[];
  isPublic: boolean;
  sharedWith?: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ResumeData {
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    github?: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    description: string;
    technologies: string;
    link?: string;
  }[];
  experience?: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  customization?: {
    template: 'modern' | 'professional' | 'minimalist' | 'creative';
    primaryColor: [number, number, number];
    fontFamily: string;
    lineSpacing: number;
    columnLayout: boolean;
  };
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Frontend Development' | 'Backend Development' | 'Fullstack Development' | 'Data Science' | 'Cybersecurity';
}

export interface Recommendation {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'course';
  description: string;
  skills: string[];
  location?: string;
  salary?: string;
  url: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface TestResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  completedAt: Date;
}