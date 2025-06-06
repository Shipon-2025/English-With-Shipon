
import { Category, Lesson, UserProgress } from '../types';

// Mock data store
let mockCategories: Category[] = [
  { id: 'cat-grammar', name: 'Grammar', slug: 'grammar', description: 'Learn English grammar rules.', order: 1, isPublished: true, iconName: 'BookOpen' },
  { id: 'cat-vocab', name: 'Vocabulary', slug: 'vocabulary', description: 'Expand your English vocabulary.', order: 2, isPublished: true, iconName: 'Sparkles' },
  { id: 'cat-ielts', name: 'IELTS', slug: 'ielts', description: 'Prepare for the IELTS exam.', order: 3, isPublished: true, iconName: 'AcademicCap' },
  { id: 'cat-ssc', name: 'SSC', slug: 'ssc', description: 'Content for SSC exams.', order: 4, isPublished: true, iconName: 'DocumentText'},
  { id: 'cat-hsc', name: 'HSC', slug: 'hsc', description: 'Content for HSC exams.', order: 5, isPublished: true, iconName: 'DocumentText'},
  { id: 'cat-tenses', name: 'Tenses', slug: 'tenses', parentId: 'cat-grammar', order: 1, isPublished: true, iconName: 'BookOpen' },
];

let mockLessons: Lesson[] = [
  { id: 'lesson-nouns', title: 'Introduction to Nouns', slug: 'intro-nouns', content: '<p>Nouns are naming words that refer to a person, place, thing, or idea. They are fundamental building blocks of sentences.</p><h3>Examples:</h3><ul><li>Person: <strong>teacher</strong>, <strong>John</strong></li><li>Place: <strong>city</strong>, <strong>London</strong></li><li>Thing: <strong>book</strong>, <strong>computer</strong></li><li>Idea: <strong>happiness</strong>, <strong>freedom</strong></li></ul>', categoryPath: ['grammar'], mainCategoryId: 'cat-grammar', type: 'text', order: 1, isPublished: true, views: 100 },
  { id: 'lesson-present-simple', title: 'Present Simple Tense', slug: 'present-simple', content: '<p>The present simple tense is used for habits, general truths, and scheduled events.</p><p>Structure: Subject + Base Verb (add -s/-es for he/she/it)</p>', categoryPath: ['grammar', 'tenses'], mainCategoryId: 'cat-grammar', subCategoryId: 'cat-tenses', type: 'text', order: 1, isPublished: true, views: 150 },
  { id: 'lesson-vocab-beginner', title: 'Vocabulary for Beginners', slug: 'vocab-beginner', content: '<p>Common words for daily use: hello, goodbye, thank you, please, yes, no.</p>', categoryPath: ['vocabulary'], mainCategoryId: 'cat-vocab', type: 'text', order: 1, isPublished: true, views: 80 },
  { id: 'lesson-ielts-speaking-p1', title: 'IELTS Speaking Part 1', slug: 'ielts-speaking-p1', content: '<p>Tips for IELTS Speaking Part 1. This part involves answering questions about familiar topics such as home, family, work, studies, and interests.</p>', categoryPath: ['ielts'], mainCategoryId: 'cat-ielts', type: 'video', mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isPublished: false, views: 20 },
  { id: 'lesson-ssc-grammar-overview', title: 'SSC Grammar Overview', slug: 'ssc-grammar-overview', content: '<p>An overview of important grammar topics for the SSC examination.</p>', categoryPath: ['ssc'], mainCategoryId: 'cat-ssc', type: 'pdf', mediaUrl: '/sample.pdf', order: 1, isPublished: true, views: 50 },
];

let mockUserProgress: UserProgress[] = [];

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const contentService = {
  getCategories: async (): Promise<Category[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(mockCategories));
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    await simulateDelay(200);
    const category = mockCategories.find(cat => cat.id === id);
    return category ? JSON.parse(JSON.stringify(category)) : undefined;
  },

  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    await simulateDelay(200);
    const category = mockCategories.find(cat => cat.slug === slug);
    return category ? JSON.parse(JSON.stringify(category)) : undefined;
  },
  
  createCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    await simulateDelay(400);
    const newCategory: Category = { ...categoryData, id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
    mockCategories.push(newCategory);
    return JSON.parse(JSON.stringify(newCategory));
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
    await simulateDelay(400);
    const index = mockCategories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...updates };
      return JSON.parse(JSON.stringify(mockCategories[index]));
    }
    return undefined;
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    await simulateDelay(400);
    const initialLength = mockCategories.length;
    mockCategories = mockCategories.filter(cat => cat.id !== id);
    // Consider implications: delete subcategories and lessons?
    // For now, keeps it simple.
    return mockCategories.length < initialLength;
  },

  getAllLessons: async (): Promise<Lesson[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(mockLessons));
  },

  getLessonsByCategoryId: async (categoryId: string): Promise<Lesson[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(mockLessons.filter(lesson => lesson.mainCategoryId === categoryId || lesson.subCategoryId === categoryId)));
  },
  
  getLessonsByCategorySlug: async (categorySlug: string): Promise<Lesson[]> => {
    await simulateDelay(300);
    const category = mockCategories.find(cat => cat.slug === categorySlug);
    if (!category) return [];
    return JSON.parse(JSON.stringify(mockLessons.filter(lesson => lesson.mainCategoryId === category.id || lesson.subCategoryId === category.id)));
  },

  getLessonById: async (id: string): Promise<Lesson | undefined> => {
    await simulateDelay(200);
    const lesson = mockLessons.find(l => l.id === id);
    return lesson ? JSON.parse(JSON.stringify(lesson)) : undefined;
  },

  getLessonBySlug: async (categorySlug: string, lessonSlug: string): Promise<Lesson | undefined> => {
    await simulateDelay(200);
    const category = await contentService.getCategoryBySlug(categorySlug);
    if (!category) return undefined;
    const lesson = mockLessons.find(l => (l.mainCategoryId === category.id || l.subCategoryId === category.id) && l.slug === lessonSlug);
    return lesson ? JSON.parse(JSON.stringify(lesson)) : undefined;
},

  createLesson: async (lessonData: Omit<Lesson, 'id' | 'views'>): Promise<Lesson> => {
    await simulateDelay(500);
    if (!lessonData.title || !lessonData.slug || !lessonData.mainCategoryId) {
      throw new Error("Title, slug, and mainCategoryId are required for a new lesson.");
    }
    const newLesson: Lesson = { ...lessonData, id: `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, views: 0 };
    mockLessons.push(newLesson);
    return JSON.parse(JSON.stringify(newLesson));
  },

  updateLesson: async (id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> => {
    await simulateDelay(500);
    const index = mockLessons.findIndex(lesson => lesson.id === id);
    if (index !== -1) {
      mockLessons[index] = { ...mockLessons[index], ...updates };
      return JSON.parse(JSON.stringify(mockLessons[index]));
    }
    return undefined;
  },

  deleteLesson: async (id: string): Promise<boolean> => {
    await simulateDelay(400);
    const initialLength = mockLessons.length;
    mockLessons = mockLessons.filter(lesson => lesson.id !== id);
    return mockLessons.length < initialLength;
  },

  // User Progress
  getUserProgress: async (userId: string, lessonId: string): Promise<UserProgress | undefined> => {
    await simulateDelay(100);
    const progress = mockUserProgress.find(p => p.userId === userId && p.lessonId === lessonId);
    return progress ? JSON.parse(JSON.stringify(progress)) : undefined;
  },

  updateUserProgress: async (userId: string, lessonId: string, isCompleted: boolean): Promise<UserProgress> => {
    await simulateDelay(200);
    let progress = mockUserProgress.find(p => p.userId === userId && p.lessonId === lessonId);
    const now = new Date();
    if (progress) {
      progress.isCompleted = isCompleted;
      progress.completedAt = isCompleted ? now : undefined;
      progress.lastViewedAt = now;
    } else {
      progress = { userId, lessonId, isCompleted, completedAt: isCompleted ? now : undefined, lastViewedAt: now };
      mockUserProgress.push(progress);
    }
    return JSON.parse(JSON.stringify(progress));
  },

  getOverallProgress: async (userId: string, categoryId?: string): Promise<{ completed: number, total: number }> => {
    await simulateDelay(300);
    const relevantLessons = categoryId 
      ? mockLessons.filter(l => l.mainCategoryId === categoryId || l.subCategoryId === categoryId) 
      : mockLessons;
    
    const publishedRelevantLessons = relevantLessons.filter(l => l.isPublished);

    const userCompletedLessons = mockUserProgress.filter(p => 
        p.userId === userId && 
        p.isCompleted && 
        publishedRelevantLessons.some(l => l.id === p.lessonId)
    );
    return { completed: userCompletedLessons.length, total: publishedRelevantLessons.length };
  }
};
