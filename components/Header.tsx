// components/Header.tsx
import React from 'react';
import { Group, User, AppMode } from '../types'; 
import { 
    SunIcon, MoonIcon, ChevronUpDownIcon, 
    BuildingOfficeIcon, Cog6ToothIcon, UserIcon as DefaultUserIcon // Changed Cog8ToothIcon to Cog6ToothIcon
} from './icons';
import { DEFAULT_USER_NAME, LOCAL_USER_ID } from '../constants'; // Use new constants
import { appConfig } from '../app.config'; 

interface HeaderProps {
    currentGroupId: string;
    allGroups: Group[];
    darkMode: boolean;
    onSetCurrentGroupId: (groupId: string) => void;
    onInitiateCreateGroup: () => void; 
    onSetDarkMode: (isDark: boolean) => void;
    onShowGlobalSettingsModal: () => void;
    appMode: AppMode; // Internally 'offline', not a displayed mode
    setAppMode: (mode: AppMode) => void; 
    onShowSetUserNameModal: () => void; // Renamed prop
    currentUser: User; 
}

export const Header: React.FC<HeaderProps> = ({
    currentGroupId, allGroups, darkMode,
    onSetCurrentGroupId, onInitiateCreateGroup,
    onSetDarkMode, onShowGlobalSettingsModal,
    appMode, 
    setAppMode, 
    onShowSetUserNameModal, // Renamed prop
    currentUser
}) => {
    
    const renderUserDisplay = () => ( // Renamed from renderOfflineUserDisplay
         <button 
            onClick={onShowSetUserNameModal} // Use renamed prop
            className="ml-2 flex items-center p-1.5 pr-3 bg-primary-700 dark:bg-gray-700 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            title={`User: ${currentUser.name}. Click to change name.`} // Updated title
            disabled={!appConfig.enableOfflineMode} // Keep disabled check based on core config
         >
            {currentUser.profileImageUrl ? 
              <img src={currentUser.profileImageUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover mr-2"/>
              : <DefaultUserIcon className="w-5 h-5 text-white mr-2" />
            }
            <span className="text-sm font-medium truncate max-w-[100px]">{currentUser.name}</span>
         </button>
    );

    // Mode display text is removed.
    // let modeDisplay = 'Local Data'; // Example if some indication was desired
    // if (!appConfig.enableOfflineMode) modeDisplay += ' (Config Disabled)';

    return (
        <header className="bg-primary-600 dark:bg-gray-800 text-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SettleUp</h1>
                    {/* Mode display text removed from here */}
                    {/* <span className="ml-2 text-xs sm:text-sm opacity-80">
                        ({modeDisplay}) 
                    </span> */}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    { appConfig.enableOfflineMode ? (  // This checks if the core local functionality is enabled
                        <>
                            {allGroups.length > 0 && (
                                <div className="relative">
                                    <select 
                                        value={currentGroupId} 
                                        onChange={(e) => onSetCurrentGroupId(e.target.value)}
                                        className="appearance-none bg-primary-500 dark:bg-gray-700 text-white text-xs sm:text-sm font-medium py-2.5 pl-3 pr-8 rounded-lg shadow hover:bg-primary-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-500 transition-colors max-w-[100px] sm:max-w-[150px] truncate"
                                        aria-label="Switch group"
                                    >
                                        {allGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                    </select>
                                    <ChevronUpDownIcon className="w-4 h-4 text-white absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                                </div>
                            )}
                            <button
                                onClick={onInitiateCreateGroup} 
                                className="p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Create new group" title="Create New Group"
                            >
                                <BuildingOfficeIcon className="w-5 h-5" />
                            </button>
                        </>
                    ): null }
                     
                    <button
                        onClick={() => onSetDarkMode(!darkMode)}
                        className="p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        title={darkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {darkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-blue-300" />}
                    </button>
                    <button
                        onClick={onShowGlobalSettingsModal}
                        className="p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
                        aria-label="App Settings" title="App Settings"
                    >
                        <Cog6ToothIcon className="w-5 h-5" /> 
                    </button>
                    
                    {appConfig.enableOfflineMode ? ( // Render user display if local functionality is enabled
                        renderUserDisplay()
                     ) : (
                        <div className="w-8 h-8"/> // Placeholder if local mode is also disabled (error state)
                     )
                    }
                </div>
            </div>
        </header>
    );
};

export default Header;