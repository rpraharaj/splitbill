// constants.ts

export const commonInputClass = "w-full px-3 py-2.5 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400";
export const commonLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
export const commonButtonClass = "px-6 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md hover:shadow-lg dark:focus:ring-offset-darkSurface";
export const cancelButtonClass = "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors";

export const APP_GENERAL_SETTINGS_KEY = 'settleUpAppGeneralSettings_v4_mode'; // Kept generic as it might still store 'appMode' if other modes were ever re-enabled.
export const APP_DATA_KEY = 'settleUpAppData_v1_local'; // Renamed from OFFLINE_APP_DATA_KEY
export const DEFAULT_USER_NAME = 'User'; // Renamed from OFFLINE_USER_DEFAULT_NAME
export const LOCAL_USER_ID = 'local-user-main'; // Renamed from OFFLINE_USER_ID