
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService }
  from '../../services/contentService';
import { Category, Lesson } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusCircleIcon, BookOpenIcon, SparklesIcon, AcademicCapIcon, DocumentTextIcon } from '../../components/icons/HeroIcons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  linkTo?: string;
  linkText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, linkTo, linkText }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <Icon className="h-6 w-6" />
      </div>
    </div>
    {linkTo && linkText && (
      <div className="mt-4">
        <Link to={linkTo} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          {linkText} &rarr;
        </Link>
      </div>
    )}
  </div>
);


const AdminDashboardPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedCategories, fetchedLessons] = await Promise.all([
          contentService.getCategories(),
          contentService.getAllLessons(),
        ]);
        setCategories(fetchedCategories);
        setLessons(fetchedLessons);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." className="mt-10" />;
  }
  
  const topLevelCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Categories" value={categories.length} icon={BookOpenIcon} linkTo="/admin/manage/categories" linkText="Manage Categories" />
        <StatCard title="Total Lessons" value={lessons.length} icon={DocumentTextIcon} linkTo="/admin/manage/lessons" linkText="Manage Lessons" />
        <StatCard title="Published Lessons" value={lessons.filter(l => l.isPublished).length} icon={AcademicCapIcon} />
        <StatCard title="Draft Lessons" value={lessons.filter(l => !l.isPublished).length} icon={SparklesIcon} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/admin/manage/lessons/new" className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
                <div className="flex items-center">
                    <PlusCircleIcon className="h-6 w-6 mr-2"/> Add New Lesson
                </div>
            </Link>
            <Link to="/admin/manage/categories" className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
                <div className="flex items-center">
                    <BookOpenIcon className="h-6 w-6 mr-2"/> Manage Categories
                </div>
            </Link>
             {/* Add more quick actions as needed */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Content Overview</h2>
        <ul className="space-y-3">
          {topLevelCategories.map(category => (
            <li key={category.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{category.name}</span>
                <Link to={`/admin/manage/${category.slug}`} className="text-sm text-blue-600 hover:underline">
                  Manage {category.name}
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {lessons.filter(l => l.mainCategoryId === category.id).length} lessons
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
