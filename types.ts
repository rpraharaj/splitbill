// types.ts
export type AppMode = 'offline' | 'online'; // 'offline' here refers to the underlying mechanism, not a user-selectable mode anymore.

export interface User {
  id: string; // Can be Clerk User ID or a local ID for non-Clerk members or local user
  name: string;
  profileImageUrl?: string;
  email?: string; 
}

// ProfileEditData might be deprecated if Clerk's <UserProfile /> is used exclusively.
// For now, keeping it minimal if any local app profile interaction remains.
export interface ProfileEditData {
  name?: string; // Clerk typically manages name via its UI
  profileImageUrl?: string; // Clerk manages this
  email?: string; // Clerk manages this
}

export enum SplitType {
  EQUALLY = 'EQUALLY',
  EXACT_AMOUNTS = 'EXACT_AMOUNTS',
  PERCENTAGE = 'PERCENTAGE',
  SHARES = 'SHARES',
}

export interface ExpenseSplitDetail {
  userId: string;
  owes: number; 
  percentage?: number; 
  shares?: number; 
}

export interface ExpensePayer {
  userId: string;
  amountPaid: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  totalAmount: number;
  date: string; // ISO string
  addedById: string; // Will be local User ID of adder
  payers: ExpensePayer[];
  splitType: SplitType;
  splitDetails: ExpenseSplitDetail[];
  category?: string;
  isSettlement?: boolean; 
  // receiptImageUrl?: string; // Removed
}

export interface Group {
  id: string;
  name: string;
  members: User[]; // Can include locally defined members
  creatorId: string; // Will be local User ID of creator
  inviteLink?: string; // Mock invite link
}

export interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  id: string; 
}

export interface AllExpensesData {
  [groupId: string]: Expense[];
}

export interface SettledDebtInfo {
  debtId: string; 
  settledByExpenseId: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  duration?: number;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];

export interface GlobalSettings {
  currency: SupportedCurrency;
}

export interface AppGeneralSettings {
  darkMode?: boolean;
  currency?: SupportedCurrency;
  billsViewMode?: 'card' | 'table';
  appMode?: AppMode; // Internally 'offline', not user-facing if allowModeSwitching is false
  userName?: string; // Renamed from offlineUserName
}


export type AppTab = 'dashboard' | 'members' | 'bills' | 'analyser';

// For the "Add Multiple Bills" modal
export interface MultiBillEntry {
  id: string; // Unique ID for React key
  date: string; // ISO date string
  description: string;
  totalAmount: string; // Stored as string for input, converted on save
  category: string;
  paidById: string;
}