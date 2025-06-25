// components/Footer.tsx
import React from 'react';
import { User, AppMode } from '../types';
import { appConfig } from '../app.config'; 

interface FooterProps {
    currentUser: User; 
    appMode: AppMode; // Internally 'offline'
}

export const Footer: React.FC<FooterProps> = ({ currentUser, appMode }) => {
    let displayMessage = "";

    // appMode will be 'offline' if appConfig.enableOfflineMode is true.
    if (appMode === 'offline' && appConfig.enableOfflineMode) {
        displayMessage = `Data is stored locally on your device. Current User: ${currentUser.name}.`;
    } else { // This case implies appConfig.enableOfflineMode is false, an error state.
        displayMessage = "Application is not configured correctly.";
    }


    return (
        <footer className="text-center py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-darkMuted">&copy; {new Date().getFullYear()} SettleUp. {displayMessage}
            </p>
        </footer>
    );
};

export default Footer;