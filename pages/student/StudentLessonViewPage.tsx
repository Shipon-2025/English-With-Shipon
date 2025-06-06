
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Category, Lesson, UserProgress } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { ChevronRightIcon, CheckCircleIcon, BookOpenIcon, VideoCameraIcon, DocumentTextIcon } from '../../components/icons/HeroIcons';

const StudentLessonViewPage: React.FC = () => {
  const { categorySlug, lessonSlug } = useParams<{ categorySlug: string; lessonSlug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  const fetchData = useCallback(async () => {
    if (!categorySlug || !lessonSlug || !user) {
      setError('Required information (category, lesson, or user) is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedCategory = await contentService.getCategoryBySlug(categorySlug);
      const fetchedLesson = await contentService.getLessonBySlug(categorySlug, lessonSlug);
      
      if (!fetchedCategory) {
        setError(`Category "${categorySlug}" not found.`);
        setLoading(false);
        return;
      }
      if (!fetchedLesson) {
        setError(`Lesson "${lessonSlug}" in category "${categorySlug}" not found.`);
        setLoading(false);
        return;
      }
      if (!fetchedLesson.isPublished && user.role !== 'admin') {
        setError(`This lesson is not currently available.`);
        setLoading(false);
        return;
      }

      setCategory(fetchedCategory);
      setLesson(fetchedLesson);
      document.title = `${fetchedLesson.title} | ${fetchedCategory.name}`;

      const progress = await contentService.getUserProgress(user.id, fetchedLesson.id);
      setUserProgress(progress || null);

    } catch (err) {
      console.error(`Failed to fetch data for lesson ${lessonSlug}:`, err);
      setError('Failed to load lesson content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, lessonSlug, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;
    setMarkingComplete(true);
    try {
      const updatedProgress = await contentService.updateUserProgress(user.id, lesson.id, true);
      setUserProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      // Potentially show a small error message to the user
    } finally {
      setMarkingComplete(false);
    }
  };
  
  const handleMarkIncomplete = async () => {
    if (!user || !lesson) return;
    setMarkingComplete(true);
    try {
      const updatedProgress = await contentService.updateUserProgress(user.id, lesson.id, false);
      setUserProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to mark lesson incomplete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={`Loading lesson...`} className="mt-10" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <div className="mt-4">
          <Button onClick={() => navigate(`/dashboard/category/${categorySlug}`)} variant="secondary" size="sm">
            Back to Category
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson || !category) {
    return <div className="text-center py-10 text-gray-600">Lesson or category data could not be loaded.</div>;
  }
  
  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'pdf': return DocumentTextIcon;
      default: return BookOpenIcon;
    }
  };
  const LessonIcon = getLessonIcon(lesson.type);


  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link to="/dashboard/overview" className="hover:text-blue-600">Dashboard</Link>
        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
        <Link to={`/dashboard/category/${category.slug}`} className="hover:text-blue-600">{category.name}</Link>
        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
        <span className="font-medium text-gray-700 truncate" title={lesson.title}>{lesson.title}</span>
      </nav>

      <article className="bg-white shadow-xl rounded-lg overflow-hidden">
        <header className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <LessonIcon className="h-7 w-7 mr-3 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{lesson.title}</h1>
          </div>
          <p className="text-xs text-gray-500">Category: {category.name} &bull; Type: <span className="capitalize">{lesson.type}</span></p>
        </header>

        <div className="p-6 md:p-8 prose max-w-none lg:prose-lg">
          {lesson.type === 'video' && lesson.mediaUrl && (
            <div className="aspect-video mb-6 rounded-md overflow-hidden shadow-inner">
              <video controls src={lesson.mediaUrl} className="w-full h-full bg-black" title={`Video: ${lesson.title}`}>
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {lesson.type === 'pdf' && lesson.mediaUrl && (
            <div className="mb-6">
              <iframe 
                src={lesson.mediaUrl} 
                className="w-full h-[600px] md:h-[800px] border rounded-md shadow-inner" 
                title={`PDF: ${lesson.title}`}
                loading="lazy"
              >
                PDF viewer not available. You can <a href={lesson.mediaUrl} download target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">download the PDF</a>.
              </iframe>
            </div>
          )}
          
          {/* Lesson Content */}
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>

        <footer className="p-6 md:p-8 border-t border-gray-200 bg-gray-50">
          {userProgress?.isCompleted ? (
            <div className="flex items-center justify-between">
                <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    <span className="font-semibold">Lesson Completed!</span>
                </div>
                <Button onClick={handleMarkIncomplete} variant="ghost" size="sm" isLoading={markingComplete}>
                    Mark as Incomplete
                </Button>
            </div>
          ) : (
            <Button 
              onClick={handleMarkComplete} 
              variant="primary" 
              size="md" 
              isLoading={markingComplete}
              className="w-full sm:w-auto"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Mark as Complete
            </Button>
          )}
        </footer>
      </article>

      {/* Navigation (Next/Previous lesson - Placeholder) */}
      {/* <nav className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" disabled>
          &larr; Previous Lesson
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/dashboard/category/${categorySlug}`)}>
          Back to {category.name}
        </Button>
        <Button variant="secondary" disabled>
          Next Lesson &rarr;
        </Button>
      </nav> */}
    </div>
  );
};

export default StudentLessonViewPage;
