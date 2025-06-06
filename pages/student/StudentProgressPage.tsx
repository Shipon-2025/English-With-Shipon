
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { contentService } from '../../services/contentService';
import { Category, Lesson } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronRightIcon, ChartBarIcon, CheckCircleIcon, BookOpenIcon } from '../../components/icons/HeroIcons';
import * as Icons from '../../components/icons/HeroIcons';
import { IconName, IconMap } from '../../types';


interface ProgressData {
  completed: number;
  total: number;
}

interface CategoryProgress extends Category {
  progress: ProgressData;
}

const ProgressBar: React.FC<{ progress: number; bgColor?: string; progressColor?: string }> = ({
  progress,
  bgColor = 'bg-gray-200',
  progressColor = 'bg-blue-600',
}) => {
  const percentage = Math.min(100, Math.max(0, progress));
  return (
    <div className={`w-full ${bgColor} rounded-full h-2.5 dark:bg-gray-700 overflow-hidden`}>
      <div
        className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};

const StudentProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [overallProgress, setOverallProgress] = useState<ProgressData | null>(null);
  const [categoriesProgress, setCategoriesProgress] = useState<CategoryProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const overall = await contentService.getOverallProgress(user.id);
        setOverallProgress(overall);

        const allCategories = await contentService.getCategories();
        const topLevelPublishedCategories = allCategories.filter(c => c.isPublished && !c.parentId);
        
        const categoryProgressPromises = topLevelPublishedCategories.map(async (category) => {
          const progress = await contentService.getOverallProgress(user.id, category.id);
          return { ...category, progress };
        });

        const resolvedCategoryProgress = await Promise.all(categoryProgressPromises);
        setCategoriesProgress(resolvedCategoryProgress);

      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    document.title = "My Progress | English with Shipon";
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Loading your progress..." className="mt-10" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  const overallPercentage = overallProgress && overallProgress.total > 0 
    ? Math.round((overallProgress.completed / overallProgress.total) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link to="/dashboard/overview" className="hover:text-blue-600">
          Dashboard
        </Link>
        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
        <span className="font-medium text-gray-700">My Progress</span>
      </nav>

      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
          Your Learning Progress
        </h1>
      </header>

      {/* Overall Progress Summary */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Overall Summary</h2>
        {overallProgress ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-800">Total Progress</span>
              <span className="font-bold text-blue-600">{overallPercentage}%</span>
            </div>
            <ProgressBar progress={overallPercentage} />
            <p className="text-sm text-gray-600">
              You have completed <strong>{overallProgress.completed}</strong> out of <strong>{overallProgress.total}</strong> available lessons. Keep up the great work!
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No overall progress data available yet.</p>
        )}
      </section>

      {/* Progress by Category */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Progress by Category</h2>
        {categoriesProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesProgress.map(catProgress => {
              const categoryPercentage = catProgress.progress.total > 0 
                ? Math.round((catProgress.progress.completed / catProgress.progress.total) * 100) 
                : 0;
              const iconKey = catProgress.iconName as IconName | undefined;
              const iconComponentName = iconKey ? IconMap[iconKey] as keyof typeof Icons | undefined : undefined;
              const IconComponent = iconComponentName && Icons[iconComponentName] ? Icons[iconComponentName] : Icons.BookOpenIcon;

              return (
                <div key={catProgress.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-3">
                    <IconComponent className="h-6 w-6 mr-3 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">{catProgress.name}</h3>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-blue-500">{categoryPercentage}%</span>
                  </div>
                  <ProgressBar progress={categoryPercentage} progressColor="bg-blue-500" />
                  <p className="text-xs text-gray-500 mt-2">
                    {catProgress.progress.completed} / {catProgress.progress.total} lessons completed
                  </p>
                  <Link to={`/dashboard/category/${catProgress.slug}`} className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Go to {catProgress.name} <ChevronRightIcon className="inline h-4 w-4"/>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No category-specific progress to show yet. Start learning to see your progress!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentProgressPage;
