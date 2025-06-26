// components/views/BillsView.tsx
import React from 'react';
import { Expense, User, SupportedCurrency } from '../../types';
import ExpenseItem from '../ExpenseItem';
import ExpenseTableRow from '../ExpenseTableRow'; // Import the new component
import { PlusIcon, CalendarDaysIcon, Squares2X2Icon, TableCellsIcon, ListBulletIcon } from '../icons';
import { commonButtonClass } from '../../constants';
import { BillsViewMode } from '../../App'; 

interface BillsViewProps {
  expenses: Expense[];
  groupMembers: User[];
  currentUserId: string;
  groupCreatorId: string;
  onDeleteExpense: (expenseId: string, groupId: string) => void;
  onEditExpense: (expense: Expense) => void;
  newlyAddedExpenseId: string | null;
  selectedCurrency: SupportedCurrency;
  onOpenAddExpenseModal: () => void;
  onOpenAddMultipleBillsModal: () => void; // New prop
  billsViewMode: BillsViewMode;
  setBillsViewMode: (mode: BillsViewMode) => void;
}

const BillsView: React.FC<BillsViewProps> = ({
  expenses,
  groupMembers,
  currentUserId,
  groupCreatorId,
  onDeleteExpense,
  onEditExpense,
  newlyAddedExpenseId,
  selectedCurrency,
  onOpenAddExpenseModal,
  onOpenAddMultipleBillsModal, // New prop
  billsViewMode,
  setBillsViewMode,
}) => {
  const getUserName = (userId: string) => groupMembers.find(m => m.id === userId)?.name || 'Unknown User';

  const renderTable = () => (
    <div className="overflow-x-auto bg-white dark:bg-darkSurface shadow-lg rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Date</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Description</th>
            <th scope="col" className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Category</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Total</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Paid By</th>
            <th scope="col" className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Split</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-darkMuted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-darkSurface divide-y divide-gray-200 dark:divide-gray-600">
          {expenses.map((expense, index) => (
            <ExpenseTableRow
              key={expense.id}
              expense={expense}
              isNew={expense.id === newlyAddedExpenseId}
              canModify={expense.addedById === currentUserId || currentUserId === groupCreatorId}
              selectedCurrency={selectedCurrency}
              getUserName={getUserName}
              onEditExpense={onEditExpense}
              onDeleteExpense={onDeleteExpense}
              index={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-darkText">
            All Bills ({expenses.length})
            </h2>
            <div className="flex items-center space-x-1.5 p-0.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                    onClick={() => setBillsViewMode('card')}
                    className={`p-1.5 rounded-md ${billsViewMode === 'card' ? 'bg-white dark:bg-darkSurface shadow-sm text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'}`}
                    aria-pressed={billsViewMode === 'card'}
                    title="Card View"
                >
                    <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setBillsViewMode('table')}
                    className={`p-1.5 rounded-md ${billsViewMode === 'table' ? 'bg-white dark:bg-darkSurface shadow-sm text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'}`}
                    aria-pressed={billsViewMode === 'table'}
                    title="Table View"
                >
                    <TableCellsIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={onOpenAddExpenseModal}
            className={`${commonButtonClass} flex items-center w-full sm:w-auto justify-center`}
            aria-label="Add single new bill"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add Single Bill
          </button>
          <button
            onClick={onOpenAddMultipleBillsModal}
            className={`${commonButtonClass.replace('bg-primary-500', 'bg-secondary-500').replace('hover:bg-primary-600', 'hover:bg-secondary-600').replace('focus:ring-primary-500', 'focus:ring-secondary-500')} flex items-center w-full sm:w-auto justify-center`}
            aria-label="Add multiple bills"
          >
            <ListBulletIcon className="w-5 h-5 mr-2" /> Add Multiple Bills
          </button>
        </div>
      </div>

      {expenses.length > 0 ? (
        billsViewMode === 'card' ? (
          <div className="space-y-6" role="list">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                groupMembers={groupMembers}
                onDelete={onDeleteExpense}
                onEdit={onEditExpense}
                currentUserId={currentUserId}
                creatorId={groupCreatorId}
                isNew={expense.id === newlyAddedExpenseId}
                selectedCurrency={selectedCurrency}
              />
            ))}
          </div>
        ) : (
          renderTable()
        )
      ) : (
        <div className="bg-white dark:bg-darkSurface shadow-lg rounded-xl p-10 text-center">
          <CalendarDaysIcon className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-darkText mb-2">No Bills Yet</h3>
          <p className="text-gray-500 dark:text-darkMuted mb-6">
            Get started by adding the first bill for this group.
          </p>
          <button
            onClick={onOpenAddExpenseModal} // Default to single bill add for this prominent button
            className={`${commonButtonClass} flex items-center mx-auto`}
          >
            <PlusIcon className="w-5 h-5 mr-2 align-text-bottom" /> Add First Bill
          </button>
        </div>
      )}
    </div>
  );
};

export default BillsView;