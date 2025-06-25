// components/NoGroupsView.tsx
import React from 'react';
import { BuildingOfficeIcon, PlusIcon } from './icons'; 
import { commonButtonClass } from '../constants';
import { AppMode } from '../types'; 
import { appConfig } from '../app.config';

interface NoGroupsViewProps {
    onInitiateCreateGroup: () => void; 
    appMode: AppMode; // Will be 'offline' internally
}

const NoGroupsView: React.FC<NoGroupsViewProps> = ({ onInitiateCreateGroup, appMode }) => {
    // The `appMode` prop is 'offline' if appConfig.enableOfflineMode is true.
    // Error state (if appConfig.enableOfflineMode is false) is handled in App.tsx.
    // This component now assumes it's shown because there are no groups.
    return (
        <div className="min-h-[calc(100vh-10rem)] bg-gray-100 dark:bg-darkBg text-gray-900 dark:text-darkText transition-colors duration-300 flex flex-col items-center justify-center p-4 text-center">
            {appConfig.enableOfflineMode ? ( // This check ensures the primary functionality is enabled
                <>
                    <BuildingOfficeIcon className="w-24 h-24 text-primary-500 dark:text-primary-400 mb-6"/>
                    <h1 className="text-3xl font-bold mb-3 dark:text-white">
                        No Groups Yet!
                    </h1>
                    <p className="text-gray-600 dark:text-darkMuted mb-8 max-w-md">
                        You haven't created or joined any groups. Create one to get started.
                    </p>
                    <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                        <button 
                            onClick={onInitiateCreateGroup}
                            className={`${commonButtonClass} flex items-center justify-center w-full sm:w-auto`}
                        >
                            <PlusIcon className="w-5 h-5 mr-2"/> Create First Group
                        </button>
                    </div>
                </>
            ) : ( 
                 // This part should ideally not be reached if App.tsx handles the error state correctly.
                 // It's a defensive message.
                 <>
                    <BuildingOfficeIcon className="w-24 h-24 text-gray-400 dark:text-gray-500 mb-6"/>
                    <h1 className="text-3xl font-bold mb-3 dark:text-white">
                        Application Not Available
                    </h1>
                    <p className="text-gray-600 dark:text-darkMuted mb-8 max-w-md">
                        The application is not configured correctly. Please contact support.
                    </p>
                 </>
            )}
        </div>
    );
};

export default NoGroupsView;