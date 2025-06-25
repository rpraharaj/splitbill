// components/modals/SetUserNameModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';

export interface SetUserNameModalProps { 
    isOpen: boolean;
    onClose: () => void;
    currentUserName: string; 
    onSaveUserName: (newName: string) => void; 
}

const SetUserNameModal: React.FC<SetUserNameModalProps> = ({ isOpen, onClose, currentUserName, onSaveUserName }) => {
    const [name, setName] = useState(currentUserName);

    useEffect(() => {
        if (isOpen) {
            setName(currentUserName); 
        }
    }, [isOpen, currentUserName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSaveUserName(name.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Your Name" size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="userNameInput" className={commonLabelClass}>
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="userNameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={commonInputClass}
                        placeholder="Enter your preferred name"
                        autoFocus
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This name will be used for your session.
                    </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={onClose} className={cancelButtonClass}>
                        Cancel
                    </button>
                    <button type="submit" className={commonButtonClass} disabled={!name.trim()}>
                        Save Name
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SetUserNameModal;