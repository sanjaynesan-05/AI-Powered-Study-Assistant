export interface User {
  id: string;
  username: string;
  email: string;
  dateOfBirth?: string;
  education: 'student' | 'graduate';
  profilePhoto?: string;
  skills: string[];
  interests: string[];
  resumeUrl?: string;
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
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
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