
import React, { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from './icons/HeroIcons';
import { IconName, IconMap, Category } from '../types';
import { contentService } from '../services/contentService';
import LoadingSpinner from './LoadingSpinner';

interface SidebarNavItem {
  id: string; // Category ID for managing dropdown state and keys
  name: string;
  href: string;
  icon: IconName;
  children?: SidebarNavItem[];
}

const staticTopLinks: SidebarNavItem[] = [
  { id: 'static-dashboard', name: 'Dashboard', href: '/dashboard/overview', icon: 'Home' },
];

const staticBottomLinks: SidebarNavItem[] = [
  { id: 'static-progress', name: 'My Progress', href: '/dashboard/progress', icon: 'ChartBar' },
  { id: 'static-profile', name: 'Profile', href: '/dashboard/profile', icon: 'Identification' },
];

const StudentSidebar: React.FC = () => {
  const [navLinks, setNavLinks] = useState<SidebarNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (categoryId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  useEffect(() => {
    const loadDynamicLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const allCategories = await contentService.getCategories();
        const publishedCategories = allCategories.filter(cat => cat.isPublished);

        const topLevelCats = publishedCategories
          .filter(cat => !cat.parentId)
          .sort((a, b) => a.order - b.order);

        const dynamicCategoryNavItems: SidebarNavItem[] = topLevelCats.map(topCat => {
          const children = publishedCategories
            .filter(childCat => childCat.parentId === topCat.id)
            .sort((a, b) => a.order - b.order)
            .map(childCat => ({
              id: childCat.id,
              name: childCat.name,
              href: `/dashboard/category/${childCat.slug}`, // Sub-categories might also lead to a filtered lesson page
              icon: childCat.iconName || 'BookOpen', // Or a specific icon for sub-items
            }));

          return {
            id: topCat.id,
            name: topCat.name,
            href: `/dashboard/category/${topCat.slug}`,
            icon: topCat.iconName || 'BookOpen',
            children: children.length > 0 ? children : undefined,
          };
        });
        
        setNavLinks([...staticTopLinks, ...dynamicCategoryNavItems, ...staticBottomLinks]);
      } catch (err) {
        console.error("Failed to load categories for sidebar:", err);
        setError("Could not load navigation links.");
        setNavLinks([...staticTopLinks, ...staticBottomLinks]); 
      } finally {
        setLoading(false);
      }
    };

    loadDynamicLinks();
  }, []);

  const renderNavItem = (link: SidebarNavItem, isSubItem: boolean = false) => {
    const iconKey = link.icon as IconName;
    const iconComponentName = IconMap[iconKey] as keyof typeof Icons | undefined;
    const IconComponent = iconComponentName && Icons[iconComponentName] 
                          ? Icons[iconComponentName] 
                          : Icons.BookOpenIcon; 
    
    const isOpen = !!openDropdowns[link.id];

    if (link.children && link.children.length > 0) {
      return (
        <li key={link.id}>
          <button
            onClick={() => toggleDropdown(link.id)}
            className={`flex items-center justify-between w-full space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                        hover:bg-blue-600 hover:text-white
                        ${isSubItem ? 'pl-6' : ''} 
                        ${ (window.location.hash.includes(link.href) && !isOpen) || isOpen ? 'bg-blue-800 text-white' : '' }`}
            aria-expanded={isOpen}
            aria-controls={`submenu-${link.id}`}
          >
            <div className="flex items-center space-x-3">
              <IconComponent className="h-5 w-5" />
              <span>{link.name}</span>
            </div>
            <Icons.ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <ul id={`submenu-${link.id}`} className="pl-4 mt-1 space-y-1">
              {link.children.map(childLink => renderNavItem(childLink, true))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={link.id + link.href}>
        <NavLink
          to={link.href}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
            ${isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 hover:text-white'}
            ${isSubItem ? 'pl-10' : ''}` // Increased indentation for sub-items under a dropdown
          }
        >
          <IconComponent className="h-5 w-5" />
          <span>{link.name}</span>
        </NavLink>
      </li>
    );
  };


  return (
    <aside className="w-full md:w-64 bg-blue-700 text-blue-100 p-4 space-y-2 md:fixed md:h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Student Menu</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="sm" text="Loading menu..." className="text-white" />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            <p>{error}</p>
            <p className="mt-1">Displaying default links.</p>
        </div>
      ) : null}
      <nav>
        <ul>
          {navLinks.map((link) => renderNavItem(link))}
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;