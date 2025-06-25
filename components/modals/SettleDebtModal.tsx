// components/modals/SettleDebtModal.tsx
import React, { useState } from 'react';
import Modal from '../Modal';
import { User, Debt, SupportedCurrency } from '../../types';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';
import { formatCurrency } from '../../utils/formatting';

interface SettleDebtFormProps {
    debt: Debt;
    payer: User;
    receiver: User;
    onConfirmSettlement: (debt: Debt, amount: number) => void;
    onClose: () => void;
    selectedCurrency: SupportedCurrency;
}
const SettleDebtForm: React.FC<SettleDebtFormProps> = ({ debt, payer, receiver, onConfirmSettlement, onClose, selectedCurrency }) => {
    const [settlementAmount, setSettlementAmount] = useState<number | ''>(debt.amount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (settlementAmount === '' || Number(settlementAmount) <=0 || Number(settlementAmount) > debt.amount) {
            alert(`Please enter a valid amount between ${formatCurrency(0.01, selectedCurrency)} and ${formatCurrency(debt.amount, selectedCurrency)}.`);
            return;
        }
        onConfirmSettlement(debt, Number(settlementAmount));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="dark:text-gray-300">
                You are about to record a settlement from <strong className="text-primary-500 dark:text-primary-400">{payer.name} (You)</strong> to <strong className="text-primary-500 dark:text-primary-400">{receiver.name}</strong>.
            </p>
            <div>
                <label htmlFor="settlementAmount" className={commonLabelClass}>
                    Settlement Amount (Max: {formatCurrency(debt.amount, selectedCurrency)})
                </label>
                <input 
                    type="number" 
                    id="settlementAmount" 
                    value={settlementAmount} 
                    onChange={e => setSettlementAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                    max={debt.amount}
                    min="0.01"
                    step="0.01"
                    className={commonInputClass} 
                    required 
                />
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400">
                This will create a new "Settlement" transaction and update the balances.
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <button type="button" onClick={onClose} className={cancelButtonClass}>Cancel</button>
                <button type="submit" className={commonButtonClass}>Confirm Settlement</button>
            </div>
        </form>
    );
};


interface SettleDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
    payer?: User; // Made optional to handle null debt
    receiver?: User; // Made optional to handle null debt
    onConfirmSettlement: (debt: Debt, amount: number) => void;
    selectedCurrency: SupportedCurrency;
}

const SettleDebtModal: React.FC<SettleDebtModalProps> = ({ isOpen, onClose, debt, payer, receiver, onConfirmSettlement, selectedCurrency }) => {
    if (!isOpen || !debt || !payer || !receiver) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settle Debt" size="md">
            <SettleDebtForm 
                debt={debt}
                payer={payer}
                receiver={receiver}
                onConfirmSettlement={onConfirmSettlement}
                onClose={onClose}
                selectedCurrency={selectedCurrency}
            />
        </Modal>
    );
};

export default SettleDebtModal;