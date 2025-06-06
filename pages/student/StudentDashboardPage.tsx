
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { contentService } from '../../services/contentService';
import { Category, Lesson, UserProgress } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as Icons from '../../components/icons/HeroIcons'; // Import all icons
import { IconName, IconMap } from '../../types'; // Import IconName and IconMap

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  bgColorClass?: string;
  textColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, bgColorClass = 'bg-blue-100', textColorClass = 'text-blue-600' }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${bgColorClass} ${textColorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const iconKey = category.iconName as IconName | undefined;
  const iconComponentName = iconKey ? IconMap[iconKey] as keyof typeof Icons | undefined : undefined;
  const IconComponent = iconComponentName && Icons[iconComponentName] ? Icons[iconComponentName] : Icons.BookOpenIcon; // Default icon

  return (
    <Link 
      to={`/dashboard/category/${category.slug}`} 
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
      aria-label={`Explore ${category.name}`}
    >
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
          <IconComponent className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
          {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
        </div>
      </div>
    </Link>
  );
};


const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState<{ completed: number; total: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await contentService.getCategories();
        setCategories(fetchedCategories.filter(cat => cat.isPublished && !cat.parentId)); // Show only top-level published categories

        if (user) {
          const progress = await contentService.getOverallProgress(user.id);
          setOverallProgress(progress);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." className="mt-10" />;
  }

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name || user?.email || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to continue your English learning journey? Let's get started.
        </p>
      </section>

      {overallProgress && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Lessons Completed" 
            value={overallProgress.completed} 
            icon={Icons.AcademicCapIcon}
            bgColorClass="bg-green-100"
            textColorClass="text-green-600"
          />
          <StatCard 
            title="Total Lessons Available" 
            value={overallProgress.total} 
            icon={Icons.BookOpenIcon}
            bgColorClass="bg-indigo-100"
            textColorClass="text-indigo-600"
          />
           <StatCard 
            title="Progress" 
            value={overallProgress.total > 0 ? `${Math.round((overallProgress.completed / overallProgress.total) * 100)}%` : '0%'}
            icon={Icons.ChartBarIcon}
            bgColorClass="bg-yellow-100"
            textColorClass="text-yellow-600"
          />
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Explore Course Categories</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 bg-white p-6 rounded-md shadow">No course categories available at the moment. Please check back later.</p>
        )}
      </section>

      {/* Placeholder for recently viewed or recommended lessons */}
      {/* <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Continue Learning</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500">Your recently viewed lessons will appear here.</p>
        </div>
      </section> */}
    </div>
  );
};

export default StudentDashboardPage;