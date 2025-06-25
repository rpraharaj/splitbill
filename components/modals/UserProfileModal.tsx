// components/modals/UserProfileModal.tsx
import React, { useState } from 'react';
import Modal from '../Modal';
import { User, ProfileEditData } from '../../types';
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';

interface UserProfileFormProps { 
    user: User; 
    onSave: (data: ProfileEditData) => void; 
    onClose: () => void; 
}
const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || '');
    const [email, setEmail] = useState(user.email || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, profileImageUrl, email });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="profileName" className={commonLabelClass}>Full Name</label>
                <input type="text" id="profileName" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} />
            </div>
            <div>
                <label htmlFor="profileEmail" className={commonLabelClass}>Email</label>
                <input type="email" id="profileEmail" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClass} />
            </div>
            <div>
                <label htmlFor="profileImageUrl" className={commonLabelClass}>Profile Image URL</label>
                <input type="text" id="profileImageUrl" value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} className={commonInputClass} />
                {profileImageUrl && <img src={profileImageUrl} alt="Preview" className="w-20 h-20 rounded-full mt-2 object-cover"/>}
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <button type="button" onClick={onClose} className={cancelButtonClass}>Cancel</button>
                <button type="submit" className={commonButtonClass}>Save Changes</button>
            </div>
        </form>
    );
};

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null; // Can be null
    onSave: (data: ProfileEditData) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    if (!isOpen || !user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Your Profile" size="md">
            <UserProfileForm user={user} onSave={onSave} onClose={onClose} />
        </Modal>
    );
};

export default UserProfileModal;
