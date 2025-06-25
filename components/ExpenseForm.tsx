// components/ExpenseForm.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Group, User, Expense, SplitType, ExpensePayer, ExpenseSplitDetail, SupportedCurrency } from '../types';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../constants';
import { formatCurrency, dateToISODateString } from '../utils/formatting';
import { PlusIcon, TrashIcon } from './icons'; // Removed SparklesIcon

interface ExpenseFormProps {
  group: Group;
  currentUserId: string;
  onSaveExpense: (expense: Expense) => void;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  selectedCurrency: SupportedCurrency;
  // onSuggestCategory prop removed
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ group, currentUserId, onSaveExpense, onClose, expenseToEdit, selectedCurrency }) => {
  const [description, setDescription] = useState(expenseToEdit?.description || '');
  const [totalAmount, setTotalAmount] = useState<number | ''>(expenseToEdit?.totalAmount || '');
  const [date, setDate] = useState<string>(expenseToEdit ? dateToISODateString(new Date(expenseToEdit.date)) : dateToISODateString(new Date()));
  const [category, setCategory] = useState(expenseToEdit?.category || '');
  const [splitType, setSplitType] = useState<SplitType>(expenseToEdit?.splitType || SplitType.EQUALLY);
  
  const [payers, setPayers] = useState<ExpensePayer[]>(expenseToEdit?.payers || [{ userId: currentUserId, amountPaid: expenseToEdit?.totalAmount || 0 }]);
  
  const [selectedParticipantsEqually, setSelectedParticipantsEqually] = useState<string[]>(
    expenseToEdit && expenseToEdit.splitType === SplitType.EQUALLY 
    ? expenseToEdit.splitDetails.map(sd => sd.userId) 
    : group.members.map(m => m.id)
  );
  
  const [exactAmounts, setExactAmounts] = useState<{[userId: string]: number | ''}>(
    expenseToEdit && expenseToEdit.splitType === SplitType.EXACT_AMOUNTS
    ? expenseToEdit.splitDetails.reduce((acc, curr) => ({ ...acc, [curr.userId]: curr.owes }), {})
    : group.members.reduce((acc, member) => ({ ...acc, [member.id]: '' }), {})
  );
  const [selectedParticipantsExact, setSelectedParticipantsExact] = useState<string[]>(
    expenseToEdit && expenseToEdit.splitType === SplitType.EXACT_AMOUNTS
    ? expenseToEdit.splitDetails.map(sd => sd.userId)
    : group.members.map(m => m.id)
  );

  const [percentages, setPercentages] = useState<{[userId: string]: number | ''}>(
     expenseToEdit && expenseToEdit.splitType === SplitType.PERCENTAGE
    ? expenseToEdit.splitDetails.reduce((acc, curr) => ({ ...acc, [curr.userId]: curr.percentage }), {})
    : group.members.reduce((acc, member) => ({ ...acc, [member.id]: '' }), {})
  );
  const [selectedParticipantsPercentage, setSelectedParticipantsPercentage] = useState<string[]>(
    expenseToEdit && expenseToEdit.splitType === SplitType.PERCENTAGE
    ? expenseToEdit.splitDetails.map(sd => sd.userId)
    : group.members.map(m => m.id)
  );

  const [shares, setShares] = useState<{[userId: string]: number | ''}>(
    expenseToEdit && expenseToEdit.splitType === SplitType.SHARES
    ? expenseToEdit.splitDetails.reduce((acc, curr) => ({ ...acc, [curr.userId]: curr.shares }), {})
    : group.members.reduce((acc, member) => ({ ...acc, [member.id]: '' }), {})
  );
  const [selectedParticipantsShares, setSelectedParticipantsShares] = useState<string[]>(
    expenseToEdit && expenseToEdit.splitType === SplitType.SHARES
    ? expenseToEdit.splitDetails.map(sd => sd.userId)
    : group.members.map(m => m.id)
  );

  // isSuggestingCategory and suggestedCategories state removed

  useEffect(() => {
    // If only one payer, their amount should match the total expense amount
    if (payers.length === 1 && totalAmount !== '') {
      setPayers([{ userId: payers[0].userId, amountPaid: Number(totalAmount) }]);
    }
  }, [totalAmount, payers.length]);


  const handlePayerChange = (index: number, field: 'userId' | 'amountPaid', value: string) => {
    const newPayers = [...payers];
    if (field === 'userId') {
      newPayers[index].userId = value;
    } else {
      newPayers[index].amountPaid = value === '' ? 0 : parseFloat(value);
    }
    setPayers(newPayers);
  };

  const addPayer = () => {
    // Find a member not already in payers list, or default to first group member
    const newPayerId = group.members.find(m => !payers.find(p => p.userId === m.id))?.id || group.members[0].id;
    setPayers([...payers, { userId: newPayerId, amountPaid: 0 }]);
  };

  const removePayer = (index: number) => {
    if (payers.length > 1) { // Ensure at least one payer remains
      setPayers(payers.filter((_, i) => i !== index));
    }
  };

  const totalPaidByPayers = useMemo(() => payers.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0), [payers]);

  // Generic participant selection toggle handler
  const createParticipantToggleHandler = (
    currentSelection: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    // Optional: for split types that have associated value maps (exact, %, shares)
    valueMapToClear?: any, // The current map of values (e.g., exactAmounts)
    valueMapSetter?: React.Dispatch<React.SetStateAction<any>> // Setter for that map
  ) => (userId: string) => {
    const newSelection = currentSelection.includes(userId) 
      ? currentSelection.filter(id => id !== userId) 
      : [...currentSelection, userId];
    setter(newSelection);

    // If a value map and its setter are provided, manage the values
    if (valueMapToClear && valueMapSetter) {
        if (!newSelection.includes(userId)) { // User deselected
            // Remove their entry from the value map
            valueMapSetter((currentValues: any) => {
                const updated = {...currentValues};
                delete updated[userId];
                return updated;
            });
        } else if (valueMapToClear[userId] === undefined){ // User selected, and no prior value
             // Initialize their value in the map (e.g., to empty string)
             valueMapSetter((currentValues: any) => ({...currentValues, [userId]: ''}));
        }
    }
  };

  const handleParticipantChangeEqually = createParticipantToggleHandler(selectedParticipantsEqually, setSelectedParticipantsEqually);
  const handleParticipantChangeExact = createParticipantToggleHandler(selectedParticipantsExact, setSelectedParticipantsExact, exactAmounts, setExactAmounts);
  const handleParticipantChangePercentage = createParticipantToggleHandler(selectedParticipantsPercentage, setSelectedParticipantsPercentage, percentages, setPercentages);
  const handleParticipantChangeShares = createParticipantToggleHandler(selectedParticipantsShares, setSelectedParticipantsShares, shares, setShares);

  // Generic value change handler for exact amounts, percentages, shares
  const createValueChangeHandler = (
    setter: React.Dispatch<React.SetStateAction<{[userId: string]: number | ''}>>
  ) => (userId: string, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value); // Keep as empty string if input is cleared
    setter(prev => ({ ...prev, [userId]: numValue }));
  };

  const handleExactAmountChange = createValueChangeHandler(setExactAmounts);
  const handlePercentageChange = createValueChangeHandler(setPercentages);
  const handleShareChange = createValueChangeHandler(setShares);

  const totalExactAmountEntered = useMemo(() => Object.values(exactAmounts).reduce<number>((sum, val) => sum + (Number(val) || 0), 0), [exactAmounts]);
  const totalPercentageEntered = useMemo(() => Object.values(percentages).reduce<number>((sum, val) => sum + (Number(val) || 0), 0), [percentages]);
  const totalSharesEntered = useMemo(() => Object.values(shares).reduce<number>((sum, val) => sum + (Number(val) || 0), 0), [shares]);

  // handleFetchCategorySuggestions and handleSelectSuggestedCategory removed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || totalAmount === '' || Number(totalAmount) <= 0) {
      alert('Please fill in description and a valid total amount.');
      return;
    }
    const numericTotalAmount = Number(totalAmount);

    // Validate payers sum
    if (Math.abs(totalPaidByPayers - numericTotalAmount) > 0.005) { // Use a small epsilon for float comparison
      alert(`Sum of amounts paid by payers (${formatCurrency(totalPaidByPayers, selectedCurrency)}) does not match total expense amount (${formatCurrency(numericTotalAmount, selectedCurrency)}). Please adjust.`);
      return;
    }
    if (payers.some(p => p.amountPaid < 0)) {
        alert("Payer amounts cannot be negative.");
        return;
    }

    let splitDetails: ExpenseSplitDetail[] = [];

    if (splitType === SplitType.EQUALLY) {
      if (selectedParticipantsEqually.length === 0) { alert('Select participants for equal split.'); return; }
      const amountPerParticipant = numericTotalAmount / selectedParticipantsEqually.length;
      splitDetails = selectedParticipantsEqually.map(userId => ({
        userId, owes: parseFloat(amountPerParticipant.toFixed(2)) // Round to 2 decimal places
      }));
    } else if (splitType === SplitType.EXACT_AMOUNTS) {
      if (selectedParticipantsExact.length === 0) { alert('Select participants for exact split.'); return; }
      if (Math.abs(totalExactAmountEntered - numericTotalAmount) > 0.005) { alert(`Sum of exact amounts (${formatCurrency(totalExactAmountEntered, selectedCurrency)}) must match total expense (${formatCurrency(numericTotalAmount, selectedCurrency)}).`); return; }
      splitDetails = selectedParticipantsExact
        .filter(userId => exactAmounts[userId] !== undefined && Number(exactAmounts[userId]) > 0) // Only include those with amounts
        .map(userId => ({ userId, owes: parseFloat(Number(exactAmounts[userId]).toFixed(2)) }));
      if (splitDetails.length === 0 && numericTotalAmount > 0) { alert('Enter valid amounts for selected participants (Exact).'); return; }
    } else if (splitType === SplitType.PERCENTAGE) {
      if (selectedParticipantsPercentage.length === 0) { alert('Select participants for percentage split.'); return; }
      if (Math.abs(totalPercentageEntered - 100) > 0.005 && numericTotalAmount > 0) { alert(`Sum of percentages (${totalPercentageEntered}%) must be 100%.`); return; }
      splitDetails = selectedParticipantsPercentage
         .filter(userId => percentages[userId] !== undefined && Number(percentages[userId]) > 0)
        .map(userId => ({
          userId,
          owes: parseFloat(((Number(percentages[userId]) / 100) * numericTotalAmount).toFixed(2)),
          percentage: Number(percentages[userId])
        }));
      if (splitDetails.length === 0 && numericTotalAmount > 0) { alert('Enter valid percentages for selected participants.'); return; }
    } else if (splitType === SplitType.SHARES) {
      if (selectedParticipantsShares.length === 0) { alert('Select participants for shares split.'); return; }
      if (totalSharesEntered <= 0 && numericTotalAmount > 0) { alert('Total shares must be greater than 0.'); return; }
      splitDetails = selectedParticipantsShares
        .filter(userId => shares[userId] !== undefined && Number(shares[userId]) > 0)
        .map(userId => ({
          userId,
          owes: totalSharesEntered > 0 ? parseFloat(((Number(shares[userId]) / totalSharesEntered) * numericTotalAmount).toFixed(2)) : 0,
          shares: Number(shares[userId])
        }));
      if (splitDetails.length === 0 && numericTotalAmount > 0) { alert('Enter valid shares for selected participants.'); return; }
    }
    
    // Distribute rounding differences for non-zero amounts
    if (numericTotalAmount > 0) {
        const totalOwedCalculated = splitDetails.reduce((sum, p) => sum + p.owes, 0);
        if (Math.abs(totalOwedCalculated - numericTotalAmount) > 0.005 && splitDetails.length > 0) {
            // Distribute the difference to the first participant with a non-zero share or the first participant
            const difference = numericTotalAmount - totalOwedCalculated;
            const targetIndex = splitDetails.findIndex(sd => sd.owes > 0) ?? 0; // Prefer someone already owing
            if (splitDetails[targetIndex]) {
                splitDetails[targetIndex].owes = parseFloat((splitDetails[targetIndex].owes + difference).toFixed(2));
            }
        }
    }


    const finalExpense: Expense = {
      id: expenseToEdit?.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      groupId: group.id,
      description: description.trim(),
      totalAmount: numericTotalAmount,
      date: new Date(date === '' ? Date.now() : date).toISOString(), // Handle empty date string
      addedById: expenseToEdit?.addedById || currentUserId,
      payers,
      splitType,
      splitDetails,
      category: category.trim() || undefined,
      isSettlement: expenseToEdit?.isSettlement || false,
    };
    onSaveExpense(finalExpense);
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className={commonLabelClass}>Description</label>
        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={commonInputClass} placeholder="e.g., Dinner, Groceries" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalAmount" className={commonLabelClass}>Total Amount ({selectedCurrency})</label>
          <input type="number" id="totalAmount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0.01" step="0.01" className={commonInputClass} placeholder="0.00" required />
        </div>
        <div>
          <label htmlFor="date" className={commonLabelClass}>Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={commonInputClass} required />
        </div>
      </div>
       <div>
        <label className={commonLabelClass}>Paid by</label>
        {payers.map((payer, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <select value={payer.userId} onChange={(e) => handlePayerChange(index, 'userId', e.target.value)} className={`${commonInputClass} flex-grow`}>
              {group.members.map(member => (<option key={member.id} value={member.id}>{member.name}</option>))}
            </select>
            <input type="number" value={payer.amountPaid || ''} onChange={(e) => handlePayerChange(index, 'amountPaid', e.target.value)} min="0" step="0.01" className={`${commonInputClass} w-1/3`} placeholder="0.00" />
            {payers.length > 1 && (
              <button type="button" onClick={() => removePayer(index)} className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200" aria-label="Remove payer">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPayer} className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mt-1">
          <PlusIcon className="w-4 h-4 mr-1"/> Add Payer
        </button>
        {Math.abs(totalPaidByPayers - Number(totalAmount)) > 0.005 && Number(totalAmount) > 0 && (
            <p className="text-xs text-red-500 mt-1">Sum of payer amounts ({formatCurrency(totalPaidByPayers, selectedCurrency)}) must match total ({formatCurrency(Number(totalAmount) || 0, selectedCurrency)}).</p>
        )}
      </div>
      <div>
        <label htmlFor="category" className={commonLabelClass}>Category (Optional)</label>
        <div className="flex items-center space-x-2">
            <input 
                type="text" 
                id="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className={`${commonInputClass} flex-grow`} 
                placeholder="e.g., Food, Travel" 
            />
            {/* Suggest Category button and UI removed */}
        </div>
        {/* Suggested categories display removed */}
      </div>

      <div>
        <label htmlFor="splitType" className={commonLabelClass}>Split method</label>
        <select id="splitType" value={splitType} onChange={(e) => setSplitType(e.target.value as SplitType)} className={commonInputClass}>
          <option value={SplitType.EQUALLY}>Split Equally</option>
          <option value={SplitType.EXACT_AMOUNTS}>Split by Exact Amounts</option>
          <option value={SplitType.PERCENTAGE}>Split by Percentage</option>
          <option value={SplitType.SHARES}>Split by Shares</option>
        </select>
      </div>
      
      { splitType === SplitType.EQUALLY && (
          <div>
            <label className={`${commonLabelClass} mb-2`}>Split among (Equally)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {group.members.map(member => (
                <div key={`equal-${member.id}`} className="flex items-center">
                  <input type="checkbox" id={`participant-equal-${member.id}`} checked={selectedParticipantsEqually.includes(member.id)} onChange={() => handleParticipantChangeEqually(member.id)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-2 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-primary-400" />
                  <label htmlFor={`participant-equal-${member.id}`} className="text-sm text-gray-700 dark:text-gray-300 truncate" title={member.name}>{member.name}</label>
                </div>
              ))}
            </div>
          </div>
      )}
      { splitType === SplitType.EXACT_AMOUNTS && (
         <div>
          <label className={`${commonLabelClass} mb-2`}>Split among (Exact Amounts)</label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select participants and enter how much each person owes. Sum must match total amount.</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {group.members.map(member => (
              <div key={`exact-${member.id}`} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <input type="checkbox" id={`participant-exact-${member.id}`} checked={selectedParticipantsExact.includes(member.id)} onChange={() => handleParticipantChangeExact(member.id)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor={`participant-exact-${member.id}`} className="text-sm text-gray-700 dark:text-gray-300 flex-grow truncate w-1/3" title={member.name}>{member.name}</label>
                {selectedParticipantsExact.includes(member.id) && (
                  <input type="number" value={exactAmounts[member.id] ?? ''} onChange={(e) => handleExactAmountChange(member.id, e.target.value)} min="0.00" step="0.01" className={`${commonInputClass} text-sm py-1.5 w-1/3`} placeholder="0.00" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Entered: <span className={`font-bold ${Math.abs(totalExactAmountEntered - Number(totalAmount)) > 0.005 && Number(totalAmount)>0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(totalExactAmountEntered, selectedCurrency)}</span> / {formatCurrency(Number(totalAmount) || 0, selectedCurrency)}
          </div>
        </div>
      )}
      { splitType === SplitType.PERCENTAGE && (
         <div>
          <label className={`${commonLabelClass} mb-2`}>Split by Percentage</label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assign percentages. Total must be 100%.</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {group.members.map(member => (
              <div key={`percentage-${member.id}`} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <input type="checkbox" id={`participant-percentage-${member.id}`} checked={selectedParticipantsPercentage.includes(member.id)} onChange={() => handleParticipantChangePercentage(member.id)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor={`participant-percentage-${member.id}`} className="text-sm text-gray-700 dark:text-gray-300 flex-grow truncate w-1/3" title={member.name}>{member.name}</label>
                {selectedParticipantsPercentage.includes(member.id) && (
                  <div className="flex items-center w-1/3">
                    <input type="number" value={percentages[member.id] ?? ''} onChange={(e) => handlePercentageChange(member.id, e.target.value)} min="0" step="0.01" className={`${commonInputClass} text-sm py-1.5`} placeholder="0" />
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Percentage: <span className={`font-bold ${Math.abs(totalPercentageEntered - 100) > 0.005 && totalPercentageEntered > 0 ? 'text-red-500' : 'text-green-500'}`}>{totalPercentageEntered.toFixed(2)}%</span> / 100%
          </div>
        </div>
      )}
      { splitType === SplitType.SHARES && (
         <div>
          <label className={`${commonLabelClass} mb-2`}>Split by Shares</label>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assign shares (e.g., 1, 2, 0.5). Amounts will be proportional.</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {group.members.map(member => (
              <div key={`shares-${member.id}`} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <input type="checkbox" id={`participant-shares-${member.id}`} checked={selectedParticipantsShares.includes(member.id)} onChange={() => handleParticipantChangeShares(member.id)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor={`participant-shares-${member.id}`} className="text-sm text-gray-700 dark:text-gray-300 flex-grow truncate w-1/3" title={member.name}>{member.name}</label>
                {selectedParticipantsShares.includes(member.id) && (
                  <input type="number" value={shares[member.id] ?? ''} onChange={(e) => handleShareChange(member.id, e.target.value)} min="0" step="0.1" className={`${commonInputClass} text-sm py-1.5 w-1/3`} placeholder="1" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Shares: <span className={`font-bold ${totalSharesEntered <=0 ? 'text-red-500':'text-green-500'}`}>{totalSharesEntered.toFixed(1)}</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button type="button" onClick={onClose} className={cancelButtonClass}>Cancel</button>
        <button type="submit" className={commonButtonClass}>{expenseToEdit ? 'Save Changes' : 'Add Expense'}</button>
      </div>
    </form>
  );
};

export default ExpenseForm;