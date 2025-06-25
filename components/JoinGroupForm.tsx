// components/JoinGroupForm.tsx
import React, { useState } from 'react';

interface JoinGroupFormProps {
  onJoinGroup: (link: string) => void;
}
export const JoinGroupForm: React.FC<JoinGroupFormProps> = ({ onJoinGroup }) => {
  const [inviteLink, setInviteLink] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(inviteLink.trim()){
        onJoinGroup(inviteLink.trim());
        setInviteLink(''); // Clear after attempting
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-2 border-t dark:border-gray-600">
      <label htmlFor="inviteLink" className="block text-xs text-gray-500 dark:text-darkMuted mb-1">Join Group via Link (Mock):</label>
      <div className="flex space-x-2">
        <input 
          type="text" 
          id="inviteLink" 
          value={inviteLink} 
          onChange={(e) => setInviteLink(e.target.value)} 
          className="w-full px-2 py-1 text-xs bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          placeholder="Paste invite link..."
        />
        <button type="submit" className="px-2.5 py-1 text-xs text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors" aria-label="Join group">
          Join
        </button>
      </div>
    </form>
  );
};

export default JoinGroupForm;