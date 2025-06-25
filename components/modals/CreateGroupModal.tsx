// components/modals/CreateGroupModal.tsx
import React, { useState } from 'react';
import Modal from '../Modal';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';

interface CreateGroupFormProps { 
    onCreateGroup: (name: string) => void; 
    onClose: () => void; 
}
const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onCreateGroup, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateGroup(groupName);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="newGroupName" className={commonLabelClass}>Group Name</label>
                <input type="text" id="newGroupName" value={groupName} onChange={e => setGroupName(e.target.value)} className={commonInputClass} required />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <button type="button" onClick={onClose} className={cancelButtonClass}>Cancel</button>
                <button type="submit" className={commonButtonClass}>Create Group</button>
            </div>
        </form>
    );
};

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGroup: (name: string) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreateGroup }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" size="md">
            <CreateGroupForm onCreateGroup={onCreateGroup} onClose={onClose} />
        </Modal>
    );
};

export default CreateGroupModal;
