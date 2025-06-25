// app.config.ts
export interface AppConfiguration {
  enableOfflineMode: boolean;
  enableOnlineMode: boolean;
  /** The default mode to attempt if no user preference is stored or if stored preference is not enabled. */
  defaultInitialMode: 'offline' | 'online';
  /** Allow users to switch modes via UI if multiple modes are enabled. */
  allowModeSwitching: boolean;
  /** Optional Clerk Publishable Key. If set, this will be used if REACT_APP_CLERK_PUBLISHABLE_KEY env var is not found. */
  clerkPublishableKey?: string | null;
}

export const appConfig: AppConfiguration = {
  enableOfflineMode: true,
  enableOnlineMode: false,
  defaultInitialMode: 'offline', // Can be 'offline' or 'online'
  allowModeSwitching: false,
  clerkPublishableKey: null, 
};