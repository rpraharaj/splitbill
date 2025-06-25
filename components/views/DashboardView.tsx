// components/views/DashboardView.tsx
import React, { useRef } from 'react';
import BalanceSummary from '../BalanceSummary';
import { Debt, User, Group, Expense, SupportedCurrency, AppTab } from '../../types';
import { DocumentTextIcon } from '../icons'; // Removed CameraIcon

// html2canvas type declaration removed

interface DashboardViewProps {
  debts: Debt[];
  users: User[];
  currentGroup: Group;
  currentUserId: string;
  onSettleDebtClick: (debt: Debt) => void;
  groupTotalSpending: number;
  currentUserTotalShare: number;
  currentUserTotalPaid: number;
  expensesForCurrentGroup: Expense[];
  darkMode: boolean;
  selectedCurrency: SupportedCurrency;
  onSetCurrentTab: (tab: AppTab) => void;
  onShowSummaryModal: () => void;
  // It would be good to have addNotification here for user feedback on screenshot errors
  // addNotification?: (message: string, type: 'success' | 'info' | 'error', duration?: number) => void;
}

const DashboardView: React.FC<DashboardViewProps> = (props) => {
  const dashboardRef = useRef<HTMLDivElement>(null); // Ref can remain if other uses arise, but not for screenshot

  // handleTakeScreenshot function removed

  return (
    <div ref={dashboardRef} className="space-y-8">
      <BalanceSummary
        debts={props.debts}
        users={props.users}
        currentGroup={props.currentGroup}
        currentUserId={props.currentUserId}
        onSettleDebtClick={props.onSettleDebtClick}
        groupTotalSpending={props.groupTotalSpending}
        currentUserTotalShare={props.currentUserTotalShare}
        currentUserTotalPaid={props.currentUserTotalPaid}
        expensesForCurrentGroup={props.expensesForCurrentGroup}
        darkMode={props.darkMode}
        selectedCurrency={props.selectedCurrency}
        onSetCurrentTab={props.onSetCurrentTab}
      />
       <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
         <button 
            onClick={props.onShowSummaryModal}
            className="flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-darkText bg-gray-100 dark:bg-darkSurface hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm transition-colors"
            title="Generate Group Summary Report"
            aria-label="Generate group summary report"
          >
            <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5"/> View Group Summary
          </button>
          {/* "Take Screenshot" button removed */}
       </div>
    </div>
  );
};

export default DashboardView;