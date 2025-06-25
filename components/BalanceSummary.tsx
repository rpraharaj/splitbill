
// components/BalanceSummary.tsx
import React, { useMemo } from 'react';
import { Debt, User, Group, Expense, SupportedCurrency, AppTab } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';
import { 
    BanknotesIcon, ReceiptPercentIcon, UsersIcon, ChartPieIcon, CurrencyDollarIcon, PresentationChartLineIcon, ListBulletIcon, ChartBarIcon
} from './icons';

interface BalanceSummaryProps {
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
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ 
    debts, users, currentGroup, currentUserId, onSettleDebtClick, 
    groupTotalSpending, currentUserTotalShare, currentUserTotalPaid, 
    expensesForCurrentGroup, darkMode, selectedCurrency,
    onSetCurrentTab
}) => {
  
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const currentUserDebtsOwedByMe = debts.filter(d => d.fromUserId === currentUserId);
  const currentUserDebtsOwedToMe = debts.filter(d => d.toUserId === currentUserId);
  const otherDebts = debts.filter(d => d.fromUserId !== currentUserId && d.toUserId !== currentUserId);

  const spendingByCategoryList = useMemo(() => {
    const categories: { [key: string]: number } = {};
    expensesForCurrentGroup.filter(exp => !exp.isSettlement && exp.category).forEach(exp => {
        categories[exp.category!] = (categories[exp.category!] || 0) + exp.totalAmount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a,b) => b.value - a.value);
  }, [expensesForCurrentGroup]);

  const memberPaymentsList = useMemo(() => {
    const memberPayments: { [userId: string]: number } = {};
    currentGroup.members.forEach(m => memberPayments[m.id] = 0); // Initialize for all members
    expensesForCurrentGroup.filter(exp => !exp.isSettlement).forEach(exp => {
        exp.payers.forEach(p => {
            memberPayments[p.userId] = (memberPayments[p.userId] || 0) + p.amountPaid;
        });
    });
    return Object.entries(memberPayments)
        .map(([userId, amount]) => ({ userId, name: getUserName(userId), amount: parseFloat(amount.toFixed(2)) }))
        .sort((a,b) => b.amount - a.amount); // Sort descending for "most"
  }, [expensesForCurrentGroup, currentGroup.members, users]);

  const averageSpendPerHead = useMemo(() => {
    return currentGroup.members.length > 0 ? groupTotalSpending / currentGroup.members.length : 0;
  }, [groupTotalSpending, currentGroup.members.length]);

  const topPayer = useMemo(() => {
    if (memberPaymentsList.length === 0 || memberPaymentsList[0].amount === 0) return null;
    return memberPaymentsList[0]; // Already sorted descending
  }, [memberPaymentsList]);

  const lowestPayerAmongPayers = useMemo(() => {
    const payersWithAmount = memberPaymentsList.filter(p => p.amount > 0);
    if (payersWithAmount.length === 0) return null;
    return payersWithAmount.reduce((min, p) => p.amount < min.amount ? p : min, payersWithAmount[0]);
  }, [memberPaymentsList]);

  return (
    <div className="bg-white dark:bg-darkSurface shadow-xl rounded-xl p-6 space-y-6">
        {/* Outstanding Debts Section - Moved to top */}
        <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-darkText mb-4 flex items-center">
                <BanknotesIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400"/>
                Outstanding Debts
            </h2>
            {debts.length === 0 ? (
                <div className="text-center py-4">
                <ReceiptPercentIcon className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-darkText mb-1">All Settled Up!</h3>
                <p className="text-gray-600 dark:text-darkMuted">There are no outstanding debts in this group.</p>
                </div>
            ) : (
                <div className="space-y-4">
                {currentUserDebtsOwedByMe.length > 0 && (
                    <div>
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">YOU OWE:</h3>
                    {currentUserDebtsOwedByMe.map((debt) => (
                        <div key={`owe-${debt.id}`} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg mb-2 shadow-sm ring-1 ring-red-200 dark:ring-red-700">
                           <div>
                                <span className="text-red-700 dark:text-red-300">
                                    {getUserById(debt.fromUserId)?.profileImageUrl && <img src={getUserById(debt.fromUserId)?.profileImageUrl} alt={getUserName(debt.fromUserId)} className="w-5 h-5 rounded-full inline mr-1.5 object-cover" />}
                                    <strong>{getUserName(debt.fromUserId)}</strong> owes {getUserById(debt.toUserId)?.profileImageUrl && <img src={getUserById(debt.toUserId)?.profileImageUrl} alt={getUserName(debt.toUserId)} className="w-5 h-5 rounded-full inline ml-1.5 mr-1.5 object-cover" />} <strong>{getUserName(debt.toUserId)}</strong>
                                </span>
                           </div>
                        <div className="flex items-center">
                            <strong className="text-red-700 dark:text-red-300 mr-3">{formatCurrency(debt.amount, selectedCurrency)}</strong>
                            <button 
                                onClick={() => onSettleDebtClick(debt)}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-md transition-colors flex items-center shadow-sm"
                                aria-label={`Settle debt with ${getUserName(debt.toUserId)}`}
                            >
                                <BanknotesIcon className="w-3.5 h-3.5 mr-1"/> Settle
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                
                {currentUserDebtsOwedToMe.length > 0 && (
                    <div>
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">YOU ARE OWED:</h3>
                    {currentUserDebtsOwedToMe.map((debt) => (
                        <div key={`owed-${debt.id}`} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg mb-2 shadow-sm ring-1 ring-green-200 dark:ring-green-700">
                        <span className="text-green-700 dark:text-green-300">
                            {getUserById(debt.fromUserId)?.profileImageUrl && <img src={getUserById(debt.fromUserId)?.profileImageUrl} alt={getUserName(debt.fromUserId)} className="w-5 h-5 rounded-full inline mr-1.5 object-cover" />}
                            <strong>{getUserName(debt.fromUserId)}</strong> owes {getUserById(debt.toUserId)?.profileImageUrl && <img src={getUserById(debt.toUserId)?.profileImageUrl} alt={getUserName(debt.toUserId)} className="w-5 h-5 rounded-full inline ml-1.5 mr-1.5 object-cover" />} <strong>{getUserName(debt.toUserId)}</strong>
                        </span>
                        <strong className="text-green-700 dark:text-green-300">{formatCurrency(debt.amount, selectedCurrency)}</strong>
                        </div>
                    ))}
                    </div>
                )}

                {(currentUserDebtsOwedByMe.length > 0 || currentUserDebtsOwedToMe.length > 0) && otherDebts.length > 0 && (
                    <hr className="my-4 border-gray-200 dark:border-gray-600"/>
                )}
                
                {otherDebts.length > 0 && (
                    <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">OTHER BALANCES:</h3>
                    {otherDebts.map((debt) => (
                        <div key={`other-${debt.id}`} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-2 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600">
                        <span className="text-gray-700 dark:text-gray-300">
                             {getUserById(debt.fromUserId)?.profileImageUrl && <img src={getUserById(debt.fromUserId)?.profileImageUrl} alt={getUserName(debt.fromUserId)} className="w-5 h-5 rounded-full inline mr-1.5 object-cover" />}
                            <strong>{getUserName(debt.fromUserId)}</strong> owes {getUserById(debt.toUserId)?.profileImageUrl && <img src={getUserById(debt.toUserId)?.profileImageUrl} alt={getUserName(debt.toUserId)} className="w-5 h-5 rounded-full inline mx-1.5 object-cover" />} <strong>{getUserName(debt.toUserId)}</strong>
                        </span>
                        <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(debt.amount, selectedCurrency)}</strong>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            )}
        </div>

        {/* Group Overview Section - Previously Settlement Summary stats */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-darkText flex items-center">
                    <PresentationChartLineIcon className="w-6 h-6 mr-2 text-primary-500 dark:text-primary-400"/>
                    Group Overview
                </h2>
                <button
                    onClick={() => onSetCurrentTab('analyser')}
                    className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-700/30 hover:bg-primary-200 dark:hover:bg-primary-600/50"
                    aria-label="Show Spend Analyser"
                    title="Show Spend Analyser"
                >
                    <ChartBarIcon className="w-4 h-4 mr-1.5"/> Analyser
                </button>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex items-center text-gray-700 dark:text-darkText">
                        <UsersIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" /> Number of Members:
                    </span>
                    <strong className="text-gray-800 dark:text-white">{currentGroup.members.length}</strong>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex items-center text-gray-700 dark:text-darkText">
                        <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" /> Total Group Spending:
                    </span>
                    <strong className="text-gray-800 dark:text-white">{formatCurrency(groupTotalSpending, selectedCurrency)}</strong>
                </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex items-center text-gray-700 dark:text-darkText">
                        <ReceiptPercentIcon className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" /> Average Spend Per Head:
                    </span>
                    <strong className="text-gray-800 dark:text-white">{formatCurrency(averageSpendPerHead, selectedCurrency)}</strong>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex items-center text-gray-700 dark:text-darkText">
                        <BanknotesIcon className="w-5 h-5 mr-2 text-lime-500 dark:text-lime-400" /> You Paid:
                    </span>
                    <strong className="text-gray-800 dark:text-white">{formatCurrency(currentUserTotalPaid, selectedCurrency)}</strong>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <span className="flex items-center text-gray-700 dark:text-darkText">
                        <ChartPieIcon className="w-5 h-5 mr-2 text-secondary-500 dark:text-secondary-400" /> Your Total Share:
                    </span>
                    <strong className="text-gray-800 dark:text-white">{formatCurrency(currentUserTotalShare, selectedCurrency)}</strong>
                </div>
                {topPayer && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="flex items-center text-gray-700 dark:text-darkText">
                          <BanknotesIcon className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" /> Top Payer:
                      </span>
                      <strong className="text-gray-800 dark:text-white">{topPayer.name.split(' ')[0]} ({formatCurrency(topPayer.amount, selectedCurrency)})</strong>
                  </div>
                )}
                {lowestPayerAmongPayers && topPayer?.userId !== lowestPayerAmongPayers.userId && ( 
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="flex items-center text-gray-700 dark:text-darkText">
                           <BanknotesIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 opacity-70" /> Lowest Payer (Among Payers):
                        </span>
                        <strong className="text-gray-800 dark:text-white">{lowestPayerAmongPayers.name.split(' ')[0]} ({formatCurrency(lowestPayerAmongPayers.amount, selectedCurrency)})</strong>
                    </div>
                )}

                {spendingByCategoryList.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-darkText mb-2 flex items-center">
                            <ListBulletIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400"/>Spending by Category:
                        </h4>
                        <ul className="space-y-1 text-xs max-h-32 overflow-y-auto custom-scrollbar pr-2">
                            {spendingByCategoryList.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-1.5 rounded bg-white/50 dark:bg-gray-800/30">
                                    <span>{item.name}</span>
                                    <span className="font-semibold">
                                        {formatCurrency(item.value, selectedCurrency)}
                                        {groupTotalSpending > 0 && 
                                            <span className="text-gray-500 dark:text-gray-400 ml-1">({((item.value / groupTotalSpending) * 100).toFixed(1)}%)</span>
                                        }
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {memberPaymentsList.filter(item => item.amount > 0).length > 0 && (
                     <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-darkText mb-2 flex items-center">
                            <ListBulletIcon className="w-5 h-5 mr-2 text-teal-500 dark:text-teal-400"/>Who's Paid How Much:
                        </h4>
                        <ul className="space-y-1 text-xs max-h-32 overflow-y-auto custom-scrollbar pr-2">
                            {memberPaymentsList.filter(item => item.amount > 0).map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-1.5 rounded bg-white/50 dark:bg-gray-800/30">
                                    <span>{item.name}</span>
                                    <span className="font-semibold">{formatCurrency(item.amount, selectedCurrency)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default BalanceSummary;
