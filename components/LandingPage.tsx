// components/LandingPage.tsx
import React from 'react';
import { AppMode } from '../types';
import { CloudSlashIcon, ArrowRightCircleIcon } from './icons'; // CloudSlashIcon implies local
import { appConfig } from '../app.config'; 

interface LandingPageProps {
  onSelectMode: (mode: AppMode) => void;
  clerkKeyAvailable: boolean; // Retained for prop consistency, though always false now
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const commonCardClasses = "bg-white dark:bg-darkSurface text-gray-800 dark:text-darkText p-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center text-center animate-fade-in-item";
  const commonButtonClasses = "mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-darkSurface";
  
  // Only one card (local/offline) is shown as per appConfig.
  const showLocalCard = appConfig.enableOfflineMode;
  const numberOfCards = showLocalCard ? 1 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center items-center p-4 sm:p-6 text-white antialiased overflow-hidden">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight animate-fade-in-item" style={{ animationDelay: '0.1s' }}>
          SettleUp
        </h1>
        <p className="text-xl sm:text-2xl text-primary-100 dark:text-gray-300 mb-8 animate-fade-in-item" style={{ animationDelay: '0.3s' }}>
          Smart Bill Splitting, Simplified.
        </p>
        <p className="text-base sm:text-lg text-primary-200 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in-item" style={{ animationDelay: '0.5s' }}>
          Effortlessly manage shared expenses. All your data stays right here on your device. No account needed.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${numberOfCards > 1 ? 'md:grid-cols-2' : ''} gap-8 w-full ${numberOfCards === 1 ? 'max-w-md' : 'max-w-sm md:max-w-3xl'}`}>
        {/* Local Data Card (previously Offline Mode Card) */}
        {showLocalCard && (
            <div 
            className={`${commonCardClasses} hover:shadow-primary-400/40 dark:hover:shadow-primary-500/40`}
            style={{ animationDelay: '0.7s' }}
            onClick={() => onSelectMode('offline')} // 'offline' is the internal key for local mode
            role="button"
            tabIndex={0}
            aria-label="Use SettleUp with local data storage"
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectMode('offline'); }}
            >
            <CloudSlashIcon className="w-16 h-16 text-primary-500 dark:text-primary-400 mb-5" />
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Get Started</h2>
            <p className="text-sm text-gray-600 dark:text-darkMuted mb-2 flex-grow">
                All your data is stored locally in this browser. No account or internet connection needed. Perfect for quick, private calculations.
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 mb-3">
                Remember, data will be lost if you clear browser data or use incognito mode.
            </p>
            <button 
                className={`${commonButtonClasses} bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 focus:ring-primary-400`}
                aria-hidden="true" 
                tabIndex={-1}      
            >
                Start Session <ArrowRightCircleIcon className="w-5 h-5 ml-2" />
            </button>
            </div>
        )}
      </div>
      
      {numberOfCards === 0 && ( // This means appConfig.enableOfflineMode is false
         <p className="mt-12 sm:mt-16 text-xl text-yellow-300 dark:text-yellow-400 animate-fade-in-item" style={{ animationDelay: '1.1s' }}>
            Application is not currently available. Please check the configuration.
        </p>
      )}

    </div>
  );
};

export default LandingPage;