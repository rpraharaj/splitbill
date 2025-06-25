
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ClerkProvider is removed
import { AppMode, AppGeneralSettings } from './types';
import { APP_GENERAL_SETTINGS_KEY } from './constants'; // APP_DATA_KEY is used in App.tsx
import { appConfig } from './app.config'; // Import appConfig

console.log("[Index.tsx] App Config:", appConfig);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Since enableOnlineMode is false and allowModeSwitching is false,
// the app will always try to start in 'offline' (local) mode if enableOfflineMode is true.
let determinedInitialAppMode: AppMode = 'offline'; 
let modeSource = "defaulted to local ('offline')";

// 1. Try to load general settings from localStorage to respect any previously saved appMode,
//    but only if it's 'offline' and 'offline' (local) mode is enabled by config.
try {
  const savedGeneralSettingsRaw = localStorage.getItem(APP_GENERAL_SETTINGS_KEY);
  if (savedGeneralSettingsRaw) {
    const savedGeneralSettings: AppGeneralSettings = JSON.parse(savedGeneralSettingsRaw);
    if (savedGeneralSettings.appMode) {
      if (savedGeneralSettings.appMode === 'offline' && appConfig.enableOfflineMode) {
        determinedInitialAppMode = 'offline';
        modeSource = "localStorage (local/'offline')";
      } else {
        console.log(`[Index.tsx] Stored appMode '${savedGeneralSettings.appMode}' is invalid or local mode (via 'offline' key) is disabled in appConfig.`);
      }
    }
  }
} catch (e) {
  console.error("[Index.tsx] Failed to parse general app settings from localStorage:", e);
}

// 2. If mode from localStorage is not valid or not found, use appConfig.defaultInitialMode
//    This should be 'offline' if app is configured for local-only.
if (modeSource === "defaulted to local ('offline')" || (determinedInitialAppMode === 'offline' && !appConfig.enableOfflineMode) ) {
  if (appConfig.defaultInitialMode === 'offline' && appConfig.enableOfflineMode) {
    determinedInitialAppMode = 'offline';
    modeSource = "appConfig.defaultInitialMode (local/'offline')";
  } else {
      console.warn(`[Index.tsx] appConfig.defaultInitialMode ('${appConfig.defaultInitialMode}') is not 'offline' or local mode (via 'offline' key) is disabled. App might not function.`);
  }
}

// 3. Fallback if somehow still not set (e.g., config error)
if (modeSource === "defaulted to local ('offline')" && determinedInitialAppMode !== 'offline' ) { // If default wasn't set, try again
  if (appConfig.enableOfflineMode) {
    determinedInitialAppMode = 'offline';
    modeSource = "fallback to enabled local mode ('offline')";
  }
}

// 4. Critical check: If enableOfflineMode (local mode) is false, the app cannot run.
if (!appConfig.enableOfflineMode) {
  console.error("[Index.tsx] CRITICAL: Local data mode (enableOfflineMode) is disabled in app.config.ts. The application will not function correctly.");
  // determinedInitialAppMode remains 'offline', but App.tsx will show an error message.
  modeSource = "critical (local mode disabled)";
}


console.log(`[Index.tsx] Determined Initial App Operation: '${determinedInitialAppMode}' (local data via 'offline' key) (Source: ${modeSource})`);


if (determinedInitialAppMode === 'offline' && appConfig.enableOfflineMode) {
  console.info("[Index.tsx] App running with local data storage.");
} else if (determinedInitialAppMode === 'offline' && !appConfig.enableOfflineMode) {
   // This indicates a configuration problem handled by App.tsx.
   console.warn(`[Index.tsx] App attempted to start with local data storage (via 'offline' key from ${modeSource}), but it is disabled in app.config.ts.`);
}

console.log("[Index.tsx] Initializing application for local data operation.");
root.render(
  <React.StrictMode>
    <App initialAppMode={determinedInitialAppMode} clerkKeyAvailable={false} isClerkProviderActive={false} />
  </React.StrictMode>
);