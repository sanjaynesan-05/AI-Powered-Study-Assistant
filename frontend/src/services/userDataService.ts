import api from './api';
import { UserProfile, ContentItem } from '../types';

// Define API responses
interface UserProfileResponse {
  _id: string;
  userId: string;
  bio?: string;
  dateOfBirth?: string;
  education?: string;
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
    theme?: string;
    emailNotifications?: boolean;
  };
}

interface ContentResponse {
  _id: string;
  userId: string;
  contentType: string;
  title: string;
  description?: string;
  content: any;
  tags?: string[];
  isPublic: boolean;
  sharedWith?: string[];
  version: number;
  previousVersions?: Array<{ content: any; updatedAt: string; version: number }>;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedContentResponse {
  content: ContentResponse[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// User profile services
export const userProfileService = {
  // Get user profile details
  getProfileDetails: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfileResponse>('/users/profile/details');
      
      // Map backend response to frontend type
      const userProfile: UserProfile = {
        id: response.data._id,
        userId: response.data.userId,
        bio: response.data.bio || '',
        dateOfBirth: response.data.dateOfBirth,
        education: response.data.education || 'student',
        location: response.data.location || { city: '', country: '' },
        socialLinks: response.data.socialLinks || {},
        preferences: response.data.preferences || { 
          theme: 'system', 
          emailNotifications: true 
        }
      };
      
      return userProfile;
    } catch (error) {
      console.error('Error fetching profile details:', error);
      throw error;
    }
  },

  // Update user profile details
  updateProfileDetails: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put<UserProfileResponse>('/users/profile/details', profileData);
      
      // Map backend response to frontend type
      const updatedProfile: UserProfile = {
        id: response.data._id,
        userId: response.data.userId,
        bio: response.data.bio || '',
        dateOfBirth: response.data.dateOfBirth,
        education: response.data.education || 'student',
        location: response.data.location || { city: '', country: '' },
        socialLinks: response.data.socialLinks || {},
        preferences: response.data.preferences || { 
          theme: 'system', 
          emailNotifications: true 
        }
      };
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile details:', error);
      throw error;
    }
  },

  // Delete user account and profile
  deleteUserAccount: async (): Promise<void> => {
    try {
      await api.delete('/users/profile');
      
      // Clear local storage on successful deletion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }
};

// User content services
export const userContentService = {
  // Create new content
  createContent: async (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> => {
    try {
      const response = await api.post<ContentResponse>('/content', contentData);
      
      // Map backend response to frontend type
      const newContent: ContentItem = {
        id: response.data._id,
        userId: response.data.userId,
        contentType: response.data.contentType,
        title: response.data.title,
        description: response.data.description || '',
        content: response.data.content,
        tags: response.data.tags || [],
        isPublic: response.data.isPublic,
        sharedWith: response.data.sharedWith || [],
        version: response.data.version,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
      
      return newContent;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  // Get content by type
  getContentByType: async (contentType: string, page = 1, limit = 10): Promise<{
    content: ContentItem[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  }> => {
    try {
      const response = await api.get<PaginatedContentResponse>(`/content/${contentType}`, {
        params: { page, limit }
      });
      
      // Map backend response to frontend type
      const contentItems: ContentItem[] = response.data.content.map(item => ({
        id: item._id,
        userId: item.userId,
        contentType: item.contentType,
        title: item.title,
        description: item.description || '',
        content: item.content,
        tags: item.tags || [],
        isPublic: item.isPublic,
        sharedWith: item.sharedWith || [],
        version: item.version,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      
      return {
        content: contentItems,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error(`Error fetching ${contentType} content:`, error);
      throw error;
    }
  },

  // Get content by ID
  getContentById: async (id: string): Promise<ContentItem> => {
    try {
      const response = await api.get<ContentResponse>(`/content/item/${id}`);
      
      // Map backend response to frontend type
      const contentItem: ContentItem = {
        id: response.data._id,
        userId: response.data.userId,
        contentType: response.data.contentType,
        title: response.data.title,
        description: response.data.description || '',
        content: response.data.content,
        tags: response.data.tags || [],
        isPublic: response.data.isPublic,
        sharedWith: response.data.sharedWith || [],
        version: response.data.version,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
      
      return contentItem;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      throw error;
    }
  },

  // Update content
  updateContent: async (id: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
    try {
      const response = await api.put<ContentResponse>(`/content/item/${id}`, updates);
      
      // Map backend response to frontend type
      const updatedContent: ContentItem = {
        id: response.data._id,
        userId: response.data.userId,
        contentType: response.data.contentType,
        title: response.data.title,
        description: response.data.description || '',
        content: response.data.content,
        tags: response.data.tags || [],
        isPublic: response.data.isPublic,
        sharedWith: response.data.sharedWith || [],
        version: response.data.version,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
      
      return updatedContent;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  // Delete content
  deleteContent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/content/item/${id}`);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  // Share content with other users
  shareContent: async (id: string, userIds: string[]): Promise<ContentItem> => {
    try {
      const response = await api.put<{message: string; content: ContentResponse}>(`/content/item/${id}/share`, { userIds });
      
      // Map backend response to frontend type
      const sharedContent: ContentItem = {
        id: response.data.content._id,
        userId: response.data.content.userId,
        contentType: response.data.content.contentType,
        title: response.data.content.title,
        description: response.data.content.description || '',
        content: response.data.content.content,
        tags: response.data.content.tags || [],
        isPublic: response.data.content.isPublic,
        sharedWith: response.data.content.sharedWith || [],
        version: response.data.content.version,
        createdAt: new Date(response.data.content.createdAt),
        updatedAt: new Date(response.data.content.updatedAt)
      };
      
      return sharedContent;
    } catch (error) {
      console.error('Error sharing content:', error);
      throw error;
    }
  },

  // Get shared content
  getSharedContent: async (page = 1, limit = 10): Promise<{
    content: ContentItem[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  }> => {
    try {
      const response = await api.get<PaginatedContentResponse>('/content/shared', {
        params: { page, limit }
      });
      
      // Map backend response to frontend type
      const sharedContent: ContentItem[] = response.data.content.map(item => ({
        id: item._id,
        userId: item.userId,
        contentType: item.contentType,
        title: item.title,
        description: item.description || '',
        content: item.content,
        tags: item.tags || [],
        isPublic: item.isPublic,
        sharedWith: item.sharedWith || [],
        version: item.version,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      
      return {
        content: sharedContent,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching shared content:', error);
      throw error;
    }
  }
};
