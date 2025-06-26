// components/ExpenseItem.tsx
import React, { useRef, useEffect } from 'react';
import { Expense, User, SplitType, SupportedCurrency } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';
import { TrashIcon, PencilIcon, BanknotesIcon, ShareIcon, TagIcon } from './icons'; // Removed CameraIcon

interface ExpenseItemProps {
  expense: Expense;
  groupMembers: User[];
  onDelete: (expenseId: string, groupId: string) => void;
  onEdit: (expense: Expense) => void;
  // onViewImage: (imageUrl: string, description: string) => void; // Removed prop
  currentUserId: string;
  creatorId: string; // Group creator ID
  isNew?: boolean; // For animation
  selectedCurrency: SupportedCurrency;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, groupMembers, onDelete, onEdit, /*onViewImage,*/ currentUserId, creatorId, isNew, selectedCurrency }) => {
  const payersDisplay = expense.payers.map(p => {
    const payerUser = groupMembers.find(m => m.id === p.userId);
    return `${payerUser ? (p.userId === currentUserId ? 'You' : payerUser.name) : 'Unknown User'} (${formatCurrency(p.amountPaid, selectedCurrency)})`;
  }).join(', ');
  
  const addedBy = groupMembers.find(m => m.id === expense.addedById);
  const isSettlement = expense.isSettlement;
  // User can modify if they added the expense OR if they are the group creator
  const canModify = expense.addedById === currentUserId || currentUserId === creatorId;

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew && itemRef.current) {
      itemRef.current.classList.add('animate-fade-in-item');
    }
  }, [isNew]);


  return (
    <div 
      ref={itemRef}
      className={`bg-white dark:bg-darkSurface shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300 ${isSettlement ? 'border-l-4 border-green-500 dark:border-green-400 opacity-80' : 'border-l-4 border-primary-500 dark:border-primary-400'} ${isNew ? 'opacity-0' : 'opacity-100'}`}
      role="listitem"
      aria-labelledby={`expense-desc-${expense.id}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 id={`expense-desc-${expense.id}`} className="text-lg font-semibold text-gray-800 dark:text-darkText break-words">{expense.description}</h3>
          <div className="text-xs text-gray-500 dark:text-darkMuted flex items-center flex-wrap">
            <span>{formatDate(expense.date)}</span>
            {addedBy && <span className="mx-1">· by {addedBy.id === currentUserId ? 'you' : addedBy.name}</span>}
            {expense.category && (
              <span className="flex items-center ml-1 sm:ml-2 mt-0.5 sm:mt-0 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                <TagIcon className="w-3 h-3 mr-1 text-secondary-500 dark:text-secondary-400" />
                {expense.category}
              </span>
            )}
             {/* Removed receipt image view button */}
             {/* {expense.receiptImageUrl && (
                <button 
                    onClick={() => onViewImage(expense.receiptImageUrl!, expense.description)} 
                    className="ml-1 sm:ml-2 mt-0.5 sm:mt-0 text-primary-500 dark:text-primary-400 hover:underline flex items-center"
                    aria-label="View receipt image"
                >
                    <CameraIcon className="w-3.5 h-3.5 mr-0.5" /> Receipt
                </button>
            )} */}
          </div>
        </div>
        <p className={`text-2xl font-bold ${isSettlement ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'}`}>{formatCurrency(expense.totalAmount, selectedCurrency)}</p>
      </div>
      
      {!isSettlement && (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <div className="flex items-center mb-1">
                <BanknotesIcon className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                Paid by: <strong className="ml-1">{payersDisplay}</strong>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-darkMuted mb-1.5 flex items-center">
                <ShareIcon className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-300" />
                Split {expense.splitType.toLowerCase().replace('_', ' ')} among:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {expense.splitDetails.map(detail => {
                const participantUser = groupMembers.find(m => m.id === detail.userId);
                let detailText = ` (${formatCurrency(detail.owes, selectedCurrency)})`;
                if (expense.splitType === SplitType.PERCENTAGE && detail.percentage !== undefined) detailText = ` (${detail.percentage}%)`;
                else if (expense.splitType === SplitType.SHARES && detail.shares !== undefined) detailText = ` (${detail.shares} share${detail.shares !== 1 ? 's':''})`;

                return (
                  <span key={detail.userId} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full flex items-center">
                    {participantUser?.profileImageUrl && <img src={participantUser.profileImageUrl} alt={participantUser.name} className="w-4 h-4 rounded-full mr-1.5 object-cover" />}
                    {participantUser?.name || 'Unknown User'}{detailText}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
      {isSettlement && (
         <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-700/30 p-2 rounded-md">
            This is a settlement payment.
        </p>
      )}
      
      {canModify && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-end space-x-2">
            <button onClick={() => onEdit(expense)}
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-1.5 rounded-md transition-colors text-xs font-medium flex items-center"
              aria-label="Edit expense">
              <PencilIcon className="w-4 h-4 mr-1" /> Edit
            </button>
            <button onClick={() => onDelete(expense.id, expense.groupId)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-md transition-colors text-xs font-medium flex items-center"
              aria-label="Delete expense">
              <TrashIcon className="w-4 h-4 mr-1" /> Delete
            </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseItem;