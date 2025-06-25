// components/modals/AddMultipleBillsModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Group, SupportedCurrency, MultiBillEntry } from '../../types';
import { commonButtonClass, cancelButtonClass } from '../../constants';
import { dateToISODateString } from '../../utils/formatting';
import { PlusIcon, TrashIcon } from '../icons';

interface AddMultipleBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUserId: string;
  onSaveMultipleExpenses: (billEntries: MultiBillEntry[]) => void;
  selectedCurrency: SupportedCurrency;
}

// A more compact version of commonInputClass, without w-full and with smaller padding/text
const multiBillFormInputClass = "block px-2 py-1 text-xs sm:text-sm bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400";


const AddMultipleBillsModal: React.FC<AddMultipleBillsModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  onSaveMultipleExpenses,
  selectedCurrency,
}) => {
  const createNewBillEntry = (): MultiBillEntry => ({
    id: `multi-bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: dateToISODateString(new Date()),
    description: '',
    totalAmount: '',
    category: '',
    paidById: currentUserId,
  });

  const [billEntries, setBillEntries] = useState<MultiBillEntry[]>([createNewBillEntry()]);

  useEffect(() => {
    if (isOpen) {
        setBillEntries([createNewBillEntry()]);
    }
  }, [isOpen, group, currentUserId]);


  const handleAddBillRow = () => {
    setBillEntries(prev => [...prev, createNewBillEntry()]);
  };

  const handleRemoveBillRow = (id: string) => {
    setBillEntries(prev => {
      if (prev.length === 1) return prev; 
      return prev.filter(entry => entry.id !== id);
    });
  };

  const handleInputChange = (id: string, field: keyof Omit<MultiBillEntry, 'id'>, value: string) => {
    setBillEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = billEntries.filter(
      entry => entry.description.trim() && entry.totalAmount.trim() && !isNaN(parseFloat(entry.totalAmount)) && parseFloat(entry.totalAmount) > 0
    );
    if (validEntries.length === 0 && billEntries.length > 0 && billEntries.some(b => b.description.trim() || b.totalAmount.trim())) {
        alert("Please fill in at least one bill with a valid description and amount.");
        return;
    }
    if (validEntries.length < billEntries.length && billEntries.some(b => b.description.trim() || b.totalAmount.trim())) {
        if (!window.confirm("Some bill entries are incomplete or invalid and will be ignored. Continue?")) {
            return;
        }
    }
    onSaveMultipleExpenses(validEntries);
  };
  
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Multiple Bills to ${group.name}`} size="4xl"> {/* Increased size */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Quickly add multiple bills. All bills added here will be split equally among all group members ({group.members.length} members). You can edit individual split details later.
        </p>

        <div className="space-y-2 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto overflow-x-auto custom-scrollbar pr-2 -mr-2"> {/* Added overflow-x-auto */}
          {billEntries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="flex flex-nowrap items-center gap-1 sm:gap-1.5 p-2 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700/30 min-w-[700px] sm:min-w-0" // min-w for horizontal scroll content
            >
              <span className="flex-shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500 w-7 sm:w-8 text-center">#{index + 1}</span>
              <input
                type="date"
                value={entry.date} // Value is YYYY-MM-DD
                onChange={(e) => handleInputChange(entry.id, 'date', e.target.value)}
                className={`${multiBillFormInputClass} w-[115px] sm:w-[125px] flex-shrink-0`}
                required
                aria-label="Bill date"
              />
              <input
                type="number"
                value={entry.totalAmount}
                onChange={(e) => handleInputChange(entry.id, 'totalAmount', e.target.value)}
                className={`${multiBillFormInputClass} w-[75px] sm:w-[90px] flex-shrink-0`}
                placeholder={`Amt* (${selectedCurrency})`}
                min="0.01"
                step="0.01"
                required
                aria-label="Bill amount"
              />
              <select
                value={entry.paidById}
                onChange={(e) => handleInputChange(entry.id, 'paidById', e.target.value)}
                className={`${multiBillFormInputClass} w-[90px] sm:w-[100px] md:w-[120px] flex-shrink-0`}
                required
                aria-label="Paid by"
              >
                {group.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={entry.category}
                onChange={(e) => handleInputChange(entry.id, 'category', e.target.value)}
                className={`${multiBillFormInputClass} w-[80px] sm:w-[100px] md:w-[110px] flex-shrink-0`}
                placeholder="Category"
                aria-label="Bill category"
              />
              <input
                type="text"
                value={entry.description}
                onChange={(e) => handleInputChange(entry.id, 'description', e.target.value)}
                className={`${multiBillFormInputClass} flex-grow min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[150px]`}
                placeholder="Description*"
                required
              />
              {billEntries.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleRemoveBillRow(entry.id)}
                  className="flex-shrink-0 p-1 sm:p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20"
                  aria-label="Remove this bill entry"
                >
                  <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              ) : (
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7"></div> // Placeholder for alignment
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddBillRow}
          className="mt-1 text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-1" /> Add Another Bill
        </button>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button type="button" onClick={onClose} className={`${cancelButtonClass} w-full sm:w-auto`}>
            Cancel
          </button>
          <button 
            type="submit" 
            className={`${commonButtonClass} w-full sm:w-auto`} 
            disabled={billEntries.length === 0 || billEntries.every(b => !b.description.trim() && !b.totalAmount.trim())}
          >
            Save All Bills
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMultipleBillsModal;