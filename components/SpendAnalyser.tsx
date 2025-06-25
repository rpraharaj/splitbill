// components/SpendAnalyser.tsx
import React, { useMemo } from 'react';
import { Expense, User, SupportedCurrency, AppTab } from '../types';
import { formatCurrency, formatDate, dateToISODateString } from '../utils/formatting';
import { ChartPieIcon, ListBulletIcon, BanknotesIcon } from './icons'; // Removed XMarkIcon

interface SpendAnalyserProps {
  expenses: Expense[]; // Non-settlement expenses
  members: User[];
  users: User[]; // All users list to get names
  darkMode: boolean;
  selectedCurrency: SupportedCurrency;
  onSetCurrentTab: (tab: AppTab) => void; 
}

const SpendAnalyser: React.FC<SpendAnalyserProps> = ({ expenses, members, users, darkMode, selectedCurrency, onSetCurrentTab }) => {
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

  // --- Data Preparation for Lists ---
  const spendTrendList = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    const dailySpend: { [date: string]: number } = {};
    expenses.forEach(exp => {
      const dateStr = dateToISODateString(new Date(exp.date));
      dailySpend[dateStr] = (dailySpend[dateStr] || 0) + exp.totalAmount;
    });
    return Object.entries(dailySpend)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  const totalAllExpensesForCategory = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  }, [expenses]);

  const spendByCategoryList = useMemo(() => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const categoryName = exp.category || 'Uncategorized';
      categories[categoryName] = (categories[categoryName] || 0) + exp.totalAmount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const spendByPersonList = useMemo(() => {
    const personPayments: { [userId: string]: number } = {};
    members.forEach(m => personPayments[m.id] = 0); 
    expenses.forEach(exp => {
      exp.payers.forEach(p => {
        personPayments[p.userId] = (personPayments[p.userId] || 0) + p.amountPaid;
      });
    });
    return Object.entries(personPayments)
      .filter(([, amount]) => amount > 0) 
      .map(([userId, amount]) => ({ userId, name: getUserName(userId), value: parseFloat(amount.toFixed(2)) }))
      .sort((a,b) => b.value - a.value);
  }, [expenses, members, users]);

  const totalPaidAllPersons = useMemo(() => {
    return spendByPersonList.reduce((sum, person) => sum + person.value, 0);
  }, [spendByPersonList]);
  
  const listContainerHeight = "max-h-60"; // Consistent height for scrollable lists

  return (
    <div className="bg-white dark:bg-darkSurface shadow-xl rounded-xl p-6 space-y-8 animate-fade-in-item">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-darkText">Spend Analyser</h2>
        {/* "Close Analyser" button removed */}
      </div>

      {/* Spend Trend Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-darkText mb-3 flex items-center">
            <ListBulletIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Spend Trend (Daily)
        </h3>
        {spendTrendList.length > 0 ? (
          <div className={`${listContainerHeight} overflow-y-auto custom-scrollbar pr-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg`}>
            <ul className="space-y-1.5 text-sm">
                {spendTrendList.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 rounded bg-white dark:bg-darkSurface shadow-sm">
                        <span>{formatDate(item.date)}</span>
                        <strong className="text-primary-600 dark:text-primary-400">{formatCurrency(item.amount, selectedCurrency)}</strong>
                    </li>
                ))}
            </ul>
          </div>
        ) : <p className="text-gray-500 dark:text-darkMuted text-center py-4">No spending data available for trend analysis.</p>}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t dark:border-gray-700">
        {/* Spend by Category Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-darkText mb-3 flex items-center">
            <ChartPieIcon className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"/>Spend by Category
          </h3>
          {spendByCategoryList.length > 0 ? (
            <div className={`${listContainerHeight} overflow-y-auto custom-scrollbar pr-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg`}>
              <ul className="space-y-1.5 text-sm">
                {spendByCategoryList.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 rounded bg-white dark:bg-darkSurface shadow-sm">
                        <span>{item.name}</span>
                        <strong className="text-green-600 dark:text-green-400">
                            {formatCurrency(item.value, selectedCurrency)}
                            {totalAllExpensesForCategory > 0 && 
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({((item.value / totalAllExpensesForCategory) * 100).toFixed(1)}%)</span>
                            }
                        </strong>
                    </li>
                ))}
              </ul>
            </div>
          ) : <p className="text-gray-500 dark:text-darkMuted text-center py-4">No categories to display.</p>}
        </section>

        {/* Spend by Person Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-darkText mb-3 flex items-center">
            <BanknotesIcon className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400"/>Amount Paid by Person
          </h3>
          {spendByPersonList.length > 0 ? (
             <div className={`${listContainerHeight} overflow-y-auto custom-scrollbar pr-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg`}>
              <ul className="space-y-1.5 text-sm">
                 {spendByPersonList.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 rounded bg-white dark:bg-darkSurface shadow-sm">
                        <span>{item.name}</span>
                        <strong className="text-purple-600 dark:text-purple-400">
                            {formatCurrency(item.value, selectedCurrency)}
                            {totalPaidAllPersons > 0 && 
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({((item.value / totalPaidAllPersons) * 100).toFixed(1)}%)</span>
                            }
                        </strong>
                    </li>
                  ))}
              </ul>
            </div>
          ) : <p className="text-gray-500 dark:text-darkMuted text-center py-4">No one has paid for expenses yet.</p>}
        </section>
      </div>
    </div>
  );
};

export default SpendAnalyser;