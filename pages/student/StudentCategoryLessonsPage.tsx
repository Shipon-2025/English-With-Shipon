
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Category, Lesson } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BookOpenIcon, ChevronRightIcon } from '../../components/icons/HeroIcons';

const StudentCategoryLessonsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) {
        setError('Category slug is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedCategory = await contentService.getCategoryBySlug(categorySlug);
        if (fetchedCategory) {
          setCategory(fetchedCategory);
          const fetchedLessons = await contentService.getLessonsByCategoryId(fetchedCategory.id);
          setLessons(fetchedLessons.filter(lesson => lesson.isPublished));
        } else {
          setError(`Category "${categorySlug}" not found.`);
          setCategory(null);
          setLessons([]);
        }
      } catch (err) {
        console.error(`Failed to fetch data for category ${categorySlug}:`, err);
        setError('Failed to load lessons. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  if (loading) {
    return <LoadingSpinner text={`Loading lessons for ${categorySlug}...`} className="mt-10" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!category) {
    return <div className="text-center py-10 text-gray-600">Category not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link to="/dashboard/overview" className="hover:text-blue-600">
          Dashboard
        </Link>
        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
        <span className="font-medium text-gray-700">{category.name}</span>
      </nav>

      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-3 text-blue-600" />
          {category.name}
        </h1>
        {category.description && <p className="mt-2 text-sm text-gray-600">{category.description}</p>}
      </header>

      {lessons.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No lessons available yet.</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back soon for new content in the "{category.name}" category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.sort((a,b) => a.order - b.order).map((lesson) => (
            <Link
              key={lesson.id}
              to={`/dashboard/category/${categorySlug}/lesson/${lesson.slug}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
            >
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </h2>
              <p className="text-xs text-gray-400 mt-1 capitalize">Type: {lesson.type}</p>
              {/* Optional: Add a snippet of lesson content or other indicators */}
              {/* <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {lesson.content ? lesson.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : 'No description.'}
              </p> */}
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                  View Lesson <ChevronRightIcon className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCategoryLessonsPage;
