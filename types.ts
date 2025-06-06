
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  order: number;
  isPublished: boolean;
  iconName?: keyof typeof IconMap; // For dynamic icons
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML content
  categoryPath: string[]; // e.g., ['grammar', 'tense', 'present-simple']
  mainCategoryId: string;
  subCategoryId?: string;
  type: 'text' | 'video' | 'pdf';
  mediaUrl?: string; // URL for video or PDF
  order: number;
  isPublished: boolean;
  views?: number;
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: Date;
  lastViewedAt?: Date;
}

// Simplified map for icon components
export const IconMap = {
  AcademicCap: 'AcademicCapIcon',
  BookOpen: 'BookOpenIcon',
  ChartBar: 'ChartBarIcon',
  Cog: 'CogIcon',
  Collection: 'CollectionIcon',
  DocumentText: 'DocumentTextIcon',
  Home: 'HomeIcon',
  Identification: 'IdentificationIcon',
  PencilAlt: 'PencilAltIcon',
  PresentationChartLine: 'PresentationChartLineIcon',
  UserGroup: 'UserGroupIcon',
  Users: 'UsersIcon',
  VideoCamera: 'VideoCameraIcon',
  ViewList: 'ViewListIcon',
  Sparkles: 'SparklesIcon',
  ChevronDown: 'ChevronDownIcon', 
  Menu: 'MenuIcon', // Added for hamburger
  X: 'XIcon', // Added for close
};

export type IconName = keyof typeof IconMap;
