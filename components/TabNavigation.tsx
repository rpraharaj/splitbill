// components/TabNavigation.tsx
import React from 'react';
import { AppTab } from '../types';
import { PresentationChartLineIcon, UsersIcon, ListBulletIcon, ChartBarIcon } from './icons';

interface TabNavigationProps {
  activeTab: AppTab;
  onSetTab: (tab: AppTab) => void;
  isMobile: boolean;
}

const tabConfig: { id: AppTab; label: string; icon: React.FC<{className?: string}> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
  { id: 'members', label: 'Members', icon: UsersIcon },
  { id: 'bills', label: 'Bills', icon: ListBulletIcon },
  { id: 'analyser', label: 'Analyser', icon: ChartBarIcon },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onSetTab, isMobile }) => {
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-darkSurface border-t border-gray-200 dark:border-gray-700 shadow-top z-30">
        <div className="flex justify-around items-center h-12">
          {tabConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onSetTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-grow p-2 transition-colors duration-200 ease-in-out
                            ${isActive 
                                ? 'text-primary-500 dark:text-primary-400' 
                                : 'text-gray-500 dark:text-darkMuted hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <IconComponent className="w-6 h-6 mb-0.5" />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop Navigation
  return (
    <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
      {tabConfig.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSetTab(tab.id)}
            className={`flex items-center px-4 py-3 -mb-px border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
                        ${isActive 
                            ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-300' 
                            : 'border-transparent text-gray-500 dark:text-darkMuted hover:text-gray-700 dark:hover:text-darkText hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className={`w-5 h-5 mr-2 ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;