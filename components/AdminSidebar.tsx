
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS_ADMIN } from '../constants';
import * as Icons from './icons/HeroIcons';
import { IconName, IconMap } from '../types';

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-full md:w-64 bg-gray-800 text-gray-100 p-4 space-y-2 md:fixed md:h-full md:overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Admin Panel</h2>
      <nav>
        <ul>
          {NAV_LINKS_ADMIN.map((link) => {
            const iconKey = link.icon as IconName;
            const iconComponentName = IconMap[iconKey] as keyof typeof Icons | undefined;
            const IconComponent = iconComponentName && Icons[iconComponentName] ? Icons[iconComponentName] : Icons['CogIcon'];
            return (
              <li key={link.name}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 hover:text-white'}`
                  }
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;