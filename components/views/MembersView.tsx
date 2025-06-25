// components/views/MembersView.tsx
import React from 'react';
import { Group, User, AppMode } from '../../types'; 
import { Cog6ToothIcon, UserIcon as DefaultUserIcon } from '../icons'; 
import { LOCAL_USER_ID } from '../../constants'; // Use new constant

interface MembersViewProps {
  group: Group;
  onShowGroupSettingsModal: () => void;
  allUsers: User[]; 
  appMode: AppMode; // Internally 'offline'
}

const MembersView: React.FC<MembersViewProps> = ({ group, onShowGroupSettingsModal, allUsers, appMode }) => {
  
  const getMemberDetails = (memberId: string): User | undefined => {
    const memberInGroup = group.members.find(m => m.id === memberId);
    if (memberInGroup) return memberInGroup;
    return allUsers.find(u => u.id === memberId);
  }

  // User can manage members if they are the group creator (based on LOCAL_USER_ID).
  const canManageMembers = group.creatorId === LOCAL_USER_ID;


  return (
    <div className="bg-white dark:bg-darkSurface shadow-xl rounded-xl p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-darkText">
          Group Members ({group.members.length})
        </h2>
        {canManageMembers && ( 
            <button
            onClick={onShowGroupSettingsModal}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md"
            aria-label="Manage group members and settings"
            >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Manage Members
            </button>
        )}
      </div>

      {group.members.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.members.map((memberStub) => {
            const member = getMemberDetails(memberStub.id) || memberStub; 
            const isCurrentUser = member.id === LOCAL_USER_ID;
            const isCreator = member.id === group.creatorId;

            let displayName = member.name;
            if (isCreator && isCurrentUser) {
                displayName += " (Creator, You)";
            } else if (isCreator) {
                displayName += " (Creator)";
            } else if (isCurrentUser) {
                displayName += " (You)";
            }

            return (
                <li
                key={member.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm"
                >
                {member.profileImageUrl ? (
                    <img
                    src={member.profileImageUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200 dark:border-gray-600"
                    />
                ) : (
                    <DefaultUserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3 p-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
                )}
                <div>
                    <p className="font-medium text-gray-800 dark:text-darkText">
                        {member.name}
                        {isCreator && isCurrentUser && <span className="text-xs text-yellow-500 ml-1">(Creator, You)</span>}
                        {isCreator && !isCurrentUser && <span className="text-xs text-yellow-500 ml-1">(Creator)</span>}
                        {!isCreator && isCurrentUser && <span className="text-xs text-blue-500 dark:text-blue-400 ml-1">(You)</span>}
                    </p>
                    {member.email && <p className="text-xs text-gray-500 dark:text-darkMuted truncate">{member.email}</p>}
                </div>
                </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-darkMuted text-center py-4">
          No members in this group. The creator can add members in settings.
        </p>
      )}
    </div>
  );
};

export default MembersView;