// Enhanced Learning Path Service with YouTube Timestamps and GeeksforGeeks Integration
import { youtubeService, YouTubeVideo } from './youtubeService';

export interface VideoTimestamp {
  startTime: string; // e.g., "2:30"
  endTime: string;   // e.g., "5:45"
  title: string;
  description: string;
  keyPoints: string[];
}

export interface GeeksForGeeksResource {
  id: string;
  title: string;
  url: string;
  category: string;
  difficulty: 'Basic' | 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  estimatedReadTime: string;
}

export interface EnhancedLearningStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  
  // Video Resources with Timestamps
  primaryVideo: YouTubeVideo;
  videoTimestamps: VideoTimestamp[];
  
  // GeeksforGeeks Documentation
  documentation: GeeksForGeeksResource[];
  
  // Practice Resources
  practiceExercises: PracticeExercise[];
  codeExamples: CodeExample[];
  
  // Assessment
  quickQuiz: QuizQuestion[];
  
  // Progression
  prerequisites: string[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nextSteps: string[];
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  hints: string[];
  solution: string;
  geeksForGeeksLink?: string;
}

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  output: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface EnhancedLearningPath {
  id: string;
  skill: string;
  title: string;
  description: string;
  totalDuration: string;
  difficulty: string;
  learningSteps: EnhancedLearningStep[];
  skillsYouWillLearn: string[];
  prerequisites: string[];
  careerApplications: string[];
}

class EnhancedLearningPathService {
  // Popular skills with guaranteed YouTube tutorials and GeeksforGeeks documentation
  private readonly POPULAR_SKILLS = {
    'JavaScript': {
      videoQuery: 'JavaScript complete tutorial for beginners',
      geeksCategory: 'javascript',
      primaryVideoId: 'PkZNo7MFNFg', // Example: Learn JavaScript - Full Course for Beginners
      chapters: [
        { title: 'Variables and Data Types', startTime: '0:00', endTime: '15:30' },
        { title: 'Functions and Scope', startTime: '15:30', endTime: '45:00' },
        { title: 'Objects and Arrays', startTime: '45:00', endTime: '1:20:00' },
        { title: 'DOM Manipulation', startTime: '1:20:00', endTime: '2:10:00' },
        { title: 'Event Handling', startTime: '2:10:00', endTime: '2:45:00' },
        { title: 'Async JavaScript', startTime: '2:45:00', endTime: '3:30:00' }
      ]
    },
    'Python': {
      videoQuery: 'Python programming complete course',
      geeksCategory: 'python',
      primaryVideoId: '_uQrJ0TkZlc', // Example: Python Tutorial - Python for Beginners
      chapters: [
        { title: 'Python Basics and Syntax', startTime: '0:00', endTime: '25:00' },
        { title: 'Data Structures', startTime: '25:00', endTime: '55:00' },
        { title: 'Control Structures', startTime: '55:00', endTime: '1:30:00' },
        { title: 'Functions and Modules', startTime: '1:30:00', endTime: '2:15:00' },
        { title: 'Object-Oriented Programming', startTime: '2:15:00', endTime: '3:00:00' },
        { title: 'File Handling and Libraries', startTime: '3:00:00', endTime: '3:45:00' }
      ]
    },
    'React': {
      videoQuery: 'React.js complete tutorial course',
      geeksCategory: 'reactjs',
      primaryVideoId: 'bMknfKXIFA8', // Example: React Course - Beginner's Tutorial for React JavaScript Library
      chapters: [
        { title: 'React Fundamentals', startTime: '0:00', endTime: '30:00' },
        { title: 'Components and JSX', startTime: '30:00', endTime: '1:15:00' },
        { title: 'Props and State', startTime: '1:15:00', endTime: '2:00:00' },
        { title: 'Event Handling', startTime: '2:00:00', endTime: '2:30:00' },
        { title: 'Hooks', startTime: '2:30:00', endTime: '3:30:00' },
        { title: 'Routing and Context', startTime: '3:30:00', endTime: '4:15:00' }
      ]
    },
    'Node.js': {
      videoQuery: 'Node.js complete tutorial course',
      geeksCategory: 'nodejs',
      primaryVideoId: 'TlB_eWDSMt4', // Example: Node.js Tutorial for Beginners: Learn Node in 1 Hour
      chapters: [
        { title: 'Node.js Introduction', startTime: '0:00', endTime: '10:00' },
        { title: 'Modules and NPM', startTime: '10:00', endTime: '25:00' },
        { title: 'File System Operations', startTime: '25:00', endTime: '40:00' },
        { title: 'HTTP and Express', startTime: '40:00', endTime: '1:10:00' },
        { title: 'Database Integration', startTime: '1:10:00', endTime: '1:35:00' },
        { title: 'Authentication and APIs', startTime: '1:35:00', endTime: '2:00:00' }
      ]
    },
    'Java': {
      videoQuery: 'Java programming complete course tutorial',
      geeksCategory: 'java',
      primaryVideoId: 'grEKMHGYyns', // Example: Java Tutorial for Beginners
      chapters: [
        { title: 'Java Fundamentals', startTime: '0:00', endTime: '45:00' },
        { title: 'Object-Oriented Programming', startTime: '45:00', endTime: '1:30:00' },
        { title: 'Collections Framework', startTime: '1:30:00', endTime: '2:15:00' },
        { title: 'Exception Handling', startTime: '2:15:00', endTime: '2:45:00' },
        { title: 'Multithreading', startTime: '2:45:00', endTime: '3:30:00' },
        { title: 'JDBC and Spring', startTime: '3:30:00', endTime: '4:15:00' }
      ]
    },
    'Data Structures': {
      videoQuery: 'Data Structures and Algorithms complete course',
      geeksCategory: 'data-structures',
      primaryVideoId: 'RBSGKlAvoiM', // Example: Data Structures and Algorithms Course
      chapters: [
        { title: 'Arrays and Strings', startTime: '0:00', endTime: '30:00' },
        { title: 'Linked Lists', startTime: '30:00', endTime: '1:00:00' },
        { title: 'Stacks and Queues', startTime: '1:00:00', endTime: '1:30:00' },
        { title: 'Trees and Graphs', startTime: '1:30:00', endTime: '2:30:00' },
        { title: 'Sorting Algorithms', startTime: '2:30:00', endTime: '3:15:00' },
        { title: 'Dynamic Programming', startTime: '3:15:00', endTime: '4:00:00' }
      ]
    },
    'Machine Learning': {
      videoQuery: 'Machine Learning complete course tutorial',
      geeksCategory: 'machine-learning',
      primaryVideoId: 'i_LwzRVP7bg', // Example: Machine Learning Course - Learning How to Learn
      chapters: [
        { title: 'ML Fundamentals', startTime: '0:00', endTime: '45:00' },
        { title: 'Supervised Learning', startTime: '45:00', endTime: '1:45:00' },
        { title: 'Unsupervised Learning', startTime: '1:45:00', endTime: '2:30:00' },
        { title: 'Neural Networks', startTime: '2:30:00', endTime: '3:30:00' },
        { title: 'Deep Learning', startTime: '3:30:00', endTime: '4:30:00' },
        { title: 'Model Deployment', startTime: '4:30:00', endTime: '5:15:00' }
      ]
    },
    'SQL': {
      videoQuery: 'SQL complete tutorial course database',
      geeksCategory: 'sql',
      primaryVideoId: 'HXV3zeQKqGY', // Example: SQL Tutorial - Full Database Course for Beginners
      chapters: [
        { title: 'SQL Basics and Queries', startTime: '0:00', endTime: '30:00' },
        { title: 'Joins and Relationships', startTime: '30:00', endTime: '1:15:00' },
        { title: 'Functions and Aggregations', startTime: '1:15:00', endTime: '2:00:00' },
        { title: 'Subqueries and Views', startTime: '2:00:00', endTime: '2:45:00' },
        { title: 'Stored Procedures', startTime: '2:45:00', endTime: '3:30:00' },
        { title: 'Database Design', startTime: '3:30:00', endTime: '4:15:00' }
      ]
    }
  };

  async generateEnhancedLearningPath(skill: string, level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'): Promise<EnhancedLearningPath> {
    const skillConfig = this.POPULAR_SKILLS[skill as keyof typeof this.POPULAR_SKILLS];
    
    if (!skillConfig) {
      throw new Error(`Skill "${skill}" is not supported yet. Supported skills: ${Object.keys(this.POPULAR_SKILLS).join(', ')}`);
    }

    try {
      // Get the main tutorial video
      const videos = await youtubeService.searchEducationalVideos({
        query: skillConfig.videoQuery,
        maxResults: 1
      });

      const primaryVideo = videos[0] || await this.createFallbackVideo(skill, skillConfig.primaryVideoId);

      // Generate learning steps with timestamps
      const learningSteps = await this.generateDetailedSteps(skill, skillConfig, primaryVideo, level);

      return {
        id: `enhanced_${skill.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        skill,
        title: `Complete ${skill} Learning Path - ${level} Level`,
        description: `Master ${skill} from ${level.toLowerCase()} to advanced level with step-by-step video tutorials, hands-on practice, and comprehensive documentation.`,
        totalDuration: this.calculateTotalDuration(learningSteps),
        difficulty: level,
        learningSteps,
        skillsYouWillLearn: this.getSkillsToLearn(skill),
        prerequisites: this.getPrerequisites(skill, level),
        careerApplications: this.getCareerApplications(skill)
      };

    } catch (error) {
      console.error('Error generating enhanced learning path:', error);
      return this.generateFallbackPath(skill, level);
    }
  }

  private async generateDetailedSteps(
    skill: string, 
    config: any, 
    primaryVideo: YouTubeVideo, 
    level: string
  ): Promise<EnhancedLearningStep[]> {
    const steps: EnhancedLearningStep[] = [];
    
    for (let i = 0; i < config.chapters.length; i++) {
      const chapter = config.chapters[i];
      const stepNumber = i + 1;
      
      // Create video timestamps for this chapter
      const videoTimestamps: VideoTimestamp[] = [{
        startTime: chapter.startTime,
        endTime: chapter.endTime,
        title: chapter.title,
        description: `Learn ${chapter.title} in ${skill} with practical examples and hands-on coding`,
        keyPoints: this.generateKeyPoints(skill, chapter.title)
      }];

      // Get GeeksforGeeks documentation
      const documentation = this.getGeeksForGeeksResources(skill, chapter.title);
      
      // Generate practice exercises
      const practiceExercises = this.generatePracticeExercises(skill, chapter.title);
      
      // Generate code examples
      const codeExamples = this.generateCodeExamples(skill, chapter.title);
      
      // Generate quiz questions
      const quickQuiz = this.generateQuizQuestions(skill, chapter.title);

      const step: EnhancedLearningStep = {
        id: `step_${stepNumber}_${skill.toLowerCase().replace(/\s+/g, '_')}`,
        stepNumber,
        title: `Step ${stepNumber}: ${chapter.title}`,
        description: `Master ${chapter.title} concepts and implement them in real projects`,
        learningObjectives: this.generateLearningObjectives(skill, chapter.title),
        primaryVideo,
        videoTimestamps,
        documentation,
        practiceExercises,
        codeExamples,
        quickQuiz,
        prerequisites: stepNumber > 1 ? [`Step ${stepNumber - 1}`] : [],
        estimatedTime: this.calculateStepDuration(chapter.startTime, chapter.endTime),
        difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
        nextSteps: stepNumber < config.chapters.length ? [`Step ${stepNumber + 1}`] : []
      };

      steps.push(step);
    }

    return steps;
  }

  private generateKeyPoints(skill: string, chapterTitle: string): string[] {
    const keyPointsMap: Record<string, Record<string, string[]>> = {
      'JavaScript': {
        'Variables and Data Types': [
          'Understand var, let, and const declarations',
          'Master primitive data types (string, number, boolean)',
          'Learn about null, undefined, and symbol types',
          'Practice type conversion and coercion'
        ],
        'Functions and Scope': [
          'Function declarations vs expressions',
          'Arrow functions and this binding',
          'Closures and lexical scoping',
          'Higher-order functions and callbacks'
        ],
        'Objects and Arrays': [
          'Object creation and property access',
          'Array methods (map, filter, reduce)',
          'Destructuring assignments',
          'Spread and rest operators'
        ]
      },
      'Python': {
        'Python Basics and Syntax': [
          'Python syntax and indentation rules',
          'Variables and basic data types',
          'Input/output operations',
          'Comments and documentation'
        ],
        'Data Structures': [
          'Lists, tuples, and dictionaries',
          'Sets and their operations',
          'List comprehensions',
          'Slicing and indexing'
        ]
      }
      // Add more skills and chapters as needed
    };

    return keyPointsMap[skill]?.[chapterTitle] || [
      `Understand core concepts of ${chapterTitle}`,
      `Apply ${chapterTitle} in practical scenarios`,
      `Solve problems using ${chapterTitle}`,
      `Build projects incorporating ${chapterTitle}`
    ];
  }

  private getGeeksForGeeksResources(skill: string, topic: string): GeeksForGeeksResource[] {
    const baseUrl = 'https://www.geeksforgeeks.org';
    const skillToUrlMap: Record<string, string> = {
      'JavaScript': 'javascript',
      'Python': 'python-programming-language',
      'Java': 'java',
      'React': 'reactjs',
      'Node.js': 'nodejs',
      'Data Structures': 'data-structures',
      'Machine Learning': 'machine-learning',
      'SQL': 'sql'
    };

    const urlPath = skillToUrlMap[skill] || skill.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        id: `gfg_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}`,
        title: `${topic} - ${skill} | GeeksforGeeks`,
        url: `${baseUrl}/${urlPath}-${topic.toLowerCase().replace(/\s+/g, '-')}/`,
        category: skill,
        difficulty: 'Easy',
        topics: [topic, skill],
        estimatedReadTime: '10-15 minutes'
      },
      {
        id: `gfg_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}_examples`,
        title: `${topic} Examples and Practice | GeeksforGeeks`,
        url: `${baseUrl}/${urlPath}-${topic.toLowerCase().replace(/\s+/g, '-')}-examples/`,
        category: skill,
        difficulty: 'Medium',
        topics: [topic, skill, 'examples'],
        estimatedReadTime: '15-20 minutes'
      }
    ];
  }

  private generatePracticeExercises(skill: string, topic: string): PracticeExercise[] {
    return [
      {
        id: `exercise_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}_1`,
        title: `${topic} - Basic Practice`,
        description: `Solve fundamental problems related to ${topic} in ${skill}`,
        difficulty: 'Easy',
        hints: [
          `Start with the basic syntax of ${topic}`,
          `Test your code with simple examples first`,
          `Review the documentation if needed`
        ],
        solution: `// Solution will be provided after attempting the exercise`,
        geeksForGeeksLink: `https://www.geeksforgeeks.org/${skill.toLowerCase()}-practice-questions/`
      },
      {
        id: `exercise_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}_2`,
        title: `${topic} - Intermediate Challenge`,
        description: `Build a small project incorporating ${topic} concepts`,
        difficulty: 'Medium',
        hints: [
          `Break down the problem into smaller parts`,
          `Apply multiple concepts together`,
          `Focus on code quality and best practices`
        ],
        solution: `// Detailed solution with explanations`,
        geeksForGeeksLink: `https://www.geeksforgeeks.org/${skill.toLowerCase()}-projects/`
      }
    ];
  }

  private generateCodeExamples(skill: string, topic: string): CodeExample[] {
    const language = this.getLanguageForSkill(skill);
    
    return [
      {
        id: `code_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}`,
        title: `${topic} Implementation Example`,
        language,
        code: this.getCodeSample(skill, topic),
        explanation: `This example demonstrates how to implement ${topic} in ${skill}`,
        output: `// Expected output for the code example`
      }
    ];
  }

  private getCodeSample(skill: string, topic: string): string {
    const samples: Record<string, Record<string, string>> = {
      'JavaScript': {
        'Variables and Data Types': `// JavaScript Variables and Data Types
let name = "John Doe";           // String
let age = 25;                    // Number
let isStudent = true;            // Boolean
let scores = [85, 90, 78];       // Array
let person = { name, age };      // Object

console.log(typeof name);        // "string"
console.log(typeof age);         // "number"
console.log(typeof isStudent);   // "boolean"`,
        
        'Functions and Scope': `// JavaScript Functions and Scope
function greet(name) {
    return \`Hello, \${name}!\`;
}

const multiply = (a, b) => a * b;

// Closure example
function counter() {
    let count = 0;
    return function() {
        return ++count;
    };
}

const myCounter = counter();
console.log(myCounter()); // 1
console.log(myCounter()); // 2`
      },
      'Python': {
        'Python Basics and Syntax': `# Python Basics and Syntax
name = "Alice"                  # String
age = 30                        # Integer  
height = 5.6                    # Float
is_programmer = True            # Boolean

# Print with f-strings
print(f"Name: {name}, Age: {age}")

# Multiple assignment
x, y, z = 1, 2, 3

# Lists and basic operations
numbers = [1, 2, 3, 4, 5]
print(f"First number: {numbers[0]}")`
      }
    };

    return samples[skill]?.[topic] || `// ${topic} example code for ${skill}`;
  }

  private generateQuizQuestions(skill: string, topic: string): QuizQuestion[] {
    return [
      {
        id: `quiz_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}_1`,
        question: `What is the main purpose of ${topic} in ${skill}?`,
        options: [
          `${topic} is used for basic operations`,
          `${topic} provides advanced functionality`,
          `${topic} is optional in ${skill}`,
          `${topic} is deprecated`
        ],
        correctAnswer: 1,
        explanation: `${topic} provides essential functionality in ${skill} development`
      },
      {
        id: `quiz_${skill.toLowerCase()}_${topic.toLowerCase().replace(/\s+/g, '_')}_2`,
        question: `Which best practice should you follow when using ${topic}?`,
        options: [
          `Ignore error handling`,
          `Use clear and descriptive names`,
          `Write as little code as possible`,
          `Avoid documentation`
        ],
        correctAnswer: 1,
        explanation: `Using clear and descriptive names makes code more readable and maintainable`
      }
    ];
  }

  // Utility methods
  private calculateTotalDuration(steps: EnhancedLearningStep[]): string {
    const totalMinutes = steps.reduce((total, step) => {
      const minutes = this.timeStringToMinutes(step.estimatedTime);
      return total + minutes;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  }

  private timeStringToMinutes(timeString: string): number {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 30; // Default 30 minutes
  }

  private calculateStepDuration(startTime: string, endTime: string): string {
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);
    const duration = endMinutes - startMinutes;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  private getLanguageForSkill(skill: string): string {
    const languageMap: Record<string, string> = {
      'JavaScript': 'javascript',
      'Python': 'python',
      'Java': 'java',
      'React': 'jsx',
      'Node.js': 'javascript',
      'SQL': 'sql'
    };
    
    return languageMap[skill] || 'text';
  }

  // Additional utility methods
  private generateLearningObjectives(skill: string, topic: string): string[] {
    return [
      `Understand the fundamentals of ${topic}`,
      `Apply ${topic} concepts in ${skill} projects`,
      `Debug common issues related to ${topic}`,
      `Implement best practices for ${topic}`
    ];
  }

  private getSkillsToLearn(skill: string): string[] {
    const skillsMap: Record<string, string[]> = {
      'JavaScript': ['ES6+ Features', 'DOM Manipulation', 'Async Programming', 'Error Handling', 'Testing'],
      'Python': ['Data Structures', 'File Handling', 'Web Development', 'Data Analysis', 'API Integration'],
      'React': ['Component Architecture', 'State Management', 'Hooks', 'Routing', 'Testing'],
      'Java': ['OOP Principles', 'Collections', 'Exception Handling', 'Multithreading', 'Spring Framework']
    };
    
    return skillsMap[skill] || [`Core ${skill} concepts`, `Advanced ${skill} features`, `${skill} best practices`];
  }

  private getPrerequisites(skill: string, level: string): string[] {
    if (level === 'Beginner') return ['Basic computer skills', 'Text editor or IDE'];
    
    const prerequisitesMap: Record<string, string[]> = {
      'JavaScript': ['HTML', 'CSS', 'Basic programming concepts'],
      'React': ['JavaScript ES6+', 'HTML', 'CSS'],
      'Node.js': ['JavaScript fundamentals', 'Command line basics'],
      'Python': ['Basic programming concepts', 'Mathematics fundamentals']
    };
    
    return prerequisitesMap[skill] || ['Basic programming knowledge'];
  }

  private getCareerApplications(skill: string): string[] {
    const applicationsMap: Record<string, string[]> = {
      'JavaScript': ['Frontend Developer', 'Full-Stack Developer', 'Node.js Developer', 'React Developer'],
      'Python': ['Data Scientist', 'Backend Developer', 'Machine Learning Engineer', 'DevOps Engineer'],
      'React': ['Frontend Developer', 'React Developer', 'UI/UX Developer', 'Mobile App Developer'],
      'Java': ['Backend Developer', 'Android Developer', 'Enterprise Developer', 'Software Architect']
    };
    
    return applicationsMap[skill] || [`${skill} Developer`, 'Software Engineer', 'Technical Consultant'];
  }

  private async createFallbackVideo(skill: string, videoId: string): Promise<YouTubeVideo> {
    return {
      id: videoId,
      title: `Complete ${skill} Tutorial - Learn ${skill} from Scratch`,
      channelTitle: 'Programming with Mosh',
      description: `Master ${skill} with this comprehensive tutorial`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      publishedAt: new Date().toISOString(),
      duration: '4:30:00',
      viewCount: '1000000',
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  private generateFallbackPath(skill: string, level: string): EnhancedLearningPath {
    return {
      id: `fallback_${skill.toLowerCase()}_${Date.now()}`,
      skill,
      title: `${skill} Learning Path - ${level}`,
      description: `Learn ${skill} step by step with comprehensive resources`,
      totalDuration: '20h 0m',
      difficulty: level,
      learningSteps: [],
      skillsYouWillLearn: this.getSkillsToLearn(skill),
      prerequisites: this.getPrerequisites(skill, level),
      careerApplications: this.getCareerApplications(skill)
    };
  }

  // Public method to get all supported skills
  getSupportedSkills(): string[] {
    return Object.keys(this.POPULAR_SKILLS);
  }

  // Public method to check if a skill is supported
  isSkillSupported(skill: string): boolean {
    return skill in this.POPULAR_SKILLS;
  }
}

export const enhancedLearningPathService = new EnhancedLearningPathService();