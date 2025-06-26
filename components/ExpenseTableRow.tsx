// components/ExpenseTableRow.tsx
import React, { useRef, useEffect } from 'react';
import { Expense, User, SupportedCurrency } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';
import { PencilIcon, TrashIcon } from './icons'; // Removed CameraIcon

interface ExpenseTableRowProps {
  expense: Expense;
  isNew: boolean;
  canModify: boolean;
  selectedCurrency: SupportedCurrency;
  getUserName: (userId: string) => string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string, groupId: string) => void;
  // onViewImage: (imageUrl: string, description: string) => void; // Removed prop
  index: number; // For alternating row styles
}

const ExpenseTableRow: React.FC<ExpenseTableRowProps> = ({
  expense, isNew, canModify, selectedCurrency, getUserName,
  onEditExpense, onDeleteExpense, /*onViewImage,*/ index
}) => {
  const itemRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isNew && itemRef.current) {
      // Ensure initial opacity is 0 for the animation to be visible
      itemRef.current.style.opacity = '0';
      itemRef.current.classList.add('animate-fade-in-item');
      // After animation, ensure opacity is set to 1
      const animationDuration = 500; // Must match CSS animation duration
      setTimeout(() => {
        if (itemRef.current) {
          itemRef.current.style.opacity = '1';
          itemRef.current.classList.remove('animate-fade-in-item'); // Optionally remove class if animation is 'forwards'
        }
      }, animationDuration);
    } else if (itemRef.current) {
      itemRef.current.style.opacity = '1'; // Ensure non-new items are visible
    }
  }, [isNew]);

  return (
    <tr
      ref={itemRef}
      className={`
        ${index % 2 === 0 ? 'bg-white dark:bg-darkSurface' : 'bg-gray-50 dark:bg-gray-700/30'}
        ${expense.isSettlement ? 'opacity-80 border-l-2 border-green-500 dark:border-green-400' : 'border-l-2 border-transparent'}
        hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-150
        ${isNew ? '' : 'opacity-100'}
      `}
      style={isNew ? {opacity: 0} : {opacity: 1}} // Set initial opacity for new items for animation
      role="row"
    >
      <td className="px-3 py-3.5 text-sm text-gray-700 dark:text-darkText whitespace-nowrap">{formatDate(expense.date)}</td>
      <td className="px-3 py-3.5 text-sm text-gray-700 dark:text-darkText max-w-[150px] sm:max-w-[200px] truncate" title={expense.description}>
        <div className="flex items-center">
          {expense.description}
          {/* Removed receipt image button */}
          {/* {expense.receiptImageUrl && (
            <button
              onClick={() => onViewImage(expense.receiptImageUrl!, expense.description)}
              className="ml-1.5 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300"
              aria-label="View receipt"
            >
              <CameraIcon className="w-3.5 h-3.5" />
            </button>
          )} */}
        </div>
      </td>
      <td className="hidden sm:table-cell px-3 py-3.5 text-sm text-gray-500 dark:text-darkMuted whitespace-nowrap">{expense.category || '-'}</td>
      <td className={`px-3 py-3.5 text-sm font-medium whitespace-nowrap ${expense.isSettlement ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'}`}>
        {formatCurrency(expense.totalAmount, selectedCurrency)}
      </td>
      <td className="px-3 py-3.5 text-sm text-gray-500 dark:text-darkMuted max-w-[120px] truncate" title={expense.payers.map(p => `${getUserName(p.userId)}: ${formatCurrency(p.amountPaid, selectedCurrency)}`).join(', ')}>
        {expense.payers.map(p => `${getUserName(p.userId).split(' ')[0]}: ${formatCurrency(p.amountPaid, selectedCurrency)}`).join(', ')}
      </td>
      <td className="hidden md:table-cell px-3 py-3.5 text-sm text-gray-500 dark:text-darkMuted whitespace-nowrap">
        {expense.isSettlement ? 'Settlement' : expense.splitType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
      </td>
      <td className="px-3 py-3.5 text-sm whitespace-nowrap">
        {canModify ? (
          <div className="flex items-center space-x-1.5">
            <button onClick={() => onEditExpense(expense)} className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-700/30" aria-label="Edit expense">
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onDeleteExpense(expense.id, expense.groupId)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-700/30" aria-label="Delete expense">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ) : <span className="text-xs text-gray-400 dark:text-gray-400">N/A</span>}
      </td>
    </tr>
  );
};

export default ExpenseTableRow;