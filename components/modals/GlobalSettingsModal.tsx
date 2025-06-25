// components/modals/GlobalSettingsModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { SupportedCurrency, SUPPORTED_CURRENCIES } from '../../types';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';

interface GlobalSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCurrency: SupportedCurrency;
    onSaveSettings: (newCurrency: SupportedCurrency) => void;
}

const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    currentCurrency, 
    onSaveSettings 
}) => {
    const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(currentCurrency);

    // Effect to sync internal state if the prop changes while modal is potentially open
    useEffect(() => {
        if (isOpen) { // Or simply rely on currentCurrency prop, depending on desired behavior for re-opening
            setSelectedCurrency(currentCurrency);
        }
    }, [currentCurrency, isOpen]);

    const handleSave = () => {
        onSaveSettings(selectedCurrency);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Global Settings" size="md">
            <div className="space-y-6">
                <div>
                    <label htmlFor="currencySelect" className={commonLabelClass}>
                        Display Currency
                    </label>
                    <select
                        id="currencySelect"
                        value={selectedCurrency} // Use internal state for controlled component
                        onChange={(e) => setSelectedCurrency(e.target.value as SupportedCurrency)}
                        className={commonInputClass}
                    >
                        {SUPPORTED_CURRENCIES.map(currencyCode => (
                            <option key={currencyCode} value={currencyCode}>
                                {currencyCode}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This changes the currency symbol and formatting for displayed amounts.
                    </p>
                </div>

                {/* Future settings can be added here */}

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={onClose} className={cancelButtonClass}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className={commonButtonClass}>
                        Save Settings
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GlobalSettingsModal;