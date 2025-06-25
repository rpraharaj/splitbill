// components/modals/GroupSettingsModal.tsx
import React, { useState } from 'react';
import Modal from '../Modal';
import { Group, User, Notification, AppMode } from '../../types'; 
import { commonInputClass, commonLabelClass, commonButtonClass, cancelButtonClass } from '../../constants';
import { TrashIcon, UserPlusIcon, LinkIcon, ClipboardIcon, ArrowLeftOnRectangleIcon } from '../icons';
import { LOCAL_USER_ID } from '../../constants'; // Use new constant

interface GroupSettingsFormProps {
    group: Group;
    allUsers: User[]; 
    currentUserId: string; // Will be LOCAL_USER_ID
    onRenameGroup: (groupId: string, newName: string) => void;
    onAddMember: (groupId: string, memberName: string) => void; 
    onRemoveMember: (groupId: string, userId: string) => void;
    onLeaveGroup: (groupId: string) => void;
    onAddNotification: (message: string, type?: Notification['type']) => void;
    onClose: () => void;
    appMode: AppMode; // Will be 'offline' internally
}
const GroupSettingsForm: React.FC<GroupSettingsFormProps> = (props) => {
    const { group, currentUserId, onRenameGroup, onAddMember, onRemoveMember, onLeaveGroup, onAddNotification, onClose, appMode } = props;
    const [editingName, setEditingName] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [newMemberName, setNewMemberName] = useState('');
    const [generatedInviteLink, setGeneratedInviteLink] = useState('');
    
    const isCreator = group.creatorId === currentUserId;

    const handleRename = () => {
        onRenameGroup(group.id, groupName);
        setEditingName(false);
    };
    const handleAddUserByName = () => {
        if (newMemberName.trim()) {
            onAddMember(group.id, newMemberName.trim());
            setNewMemberName(''); 
        } else {
            onAddNotification("Member name cannot be empty.", "error");
        }
    };

    const generateInviteLink = () => {
        // Mock link generation remains the same, messaging simplified for local-only app
        const mockToken = Math.random().toString(36).substr(2, 10);
        const link = `${window.location.origin}${window.location.pathname}?group=${group.id}&token=${mockToken}#join`;
        setGeneratedInviteLink(link);
        onAddNotification("Mock invite link generated (for local sharing concept). This is a placeholder.", "info");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            onAddNotification("Invite link copied to clipboard!", "success");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            onAddNotification("Failed to copy link.", "error");
        });
    };

    return (
        <div className="space-y-6">
            {isCreator && (
                <div>
                    <label className={commonLabelClass}>Group Name</label>
                    {editingName ? (
                        <div className="flex space-x-2">
                            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} className={commonInputClass} />
                            <button onClick={handleRename} className={`${commonButtonClass.replace('px-6','px-3')}`}>Save</button>
                            <button onClick={() => {setEditingName(false); setGroupName(group.name);}} className={`${cancelButtonClass} px-3`}>Cancel</button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="dark:text-white">{group.name}</p>
                            <button onClick={() => setEditingName(true)} className="text-sm text-blue-500 hover:underline">Edit Name</button>
                        </div>
                    )}
                </div>
            )}
            <div>
                <h4 className={`${commonLabelClass} mb-2`}>Members ({group.members.length})</h4>
                <ul className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                    {group.members.map(member => (
                        <li key={member.id} className="flex justify-between items-center p-2 bg-white dark:bg-darkSurface rounded shadow-sm">
                           <div className="flex items-center">
                             {member.profileImageUrl && <img src={member.profileImageUrl} alt={member.name} className="w-7 h-7 rounded-full mr-2 object-cover"/>}
                             <span className="dark:text-gray-200">{member.name} 
                                {member.id === LOCAL_USER_ID && " (You)"}
                                {member.id === group.creatorId && member.id !== LOCAL_USER_ID && <span className="text-xs text-yellow-500 ml-1">(Creator)</span>}
                                {member.id === group.creatorId && member.id === LOCAL_USER_ID && <span className="text-xs text-yellow-500 ml-1">(Creator, You)</span>}
                             </span>
                           </div>
                            {isCreator && member.id !== currentUserId && ( 
                                <button onClick={() => onRemoveMember(group.id, member.id)} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300" aria-label={`Remove ${member.name}`}>
                                   <TrashIcon className="w-4 h-4"/>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            
            {isCreator && (
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Member to Group</h5>
                    <label htmlFor="newMemberNameInput" className={commonLabelClass}>Enter Name of New Member</label>
                    <div className="flex space-x-2 mt-1">
                        <input 
                            type="text"
                            id="newMemberNameInput"
                            value={newMemberName}
                            onChange={e => setNewMemberName(e.target.value)}
                            className={commonInputClass}
                            placeholder="e.g., John Doe"
                        />
                        <button 
                            onClick={handleAddUserByName} 
                            className={`${commonButtonClass.replace('px-6', 'px-4')} flex items-center`} 
                            disabled={!newMemberName.trim()}
                        >
                           <UserPlusIcon className="w-4 h-4 mr-1"/> Add
                        </button>
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Adding a new member to this group.
                    </p>
                </div>
            )}

            {isCreator && (
                <div>
                    <label className={commonLabelClass}>Invite Link (Mock for local sharing concept)</label>
                    {generatedInviteLink ? (
                        <div className="flex items-center space-x-2">
                            <input type="text" readOnly value={generatedInviteLink} className={`${commonInputClass} bg-gray-100 dark:bg-gray-800`} />
                            <button onClick={() => copyToClipboard(generatedInviteLink)} className={`${cancelButtonClass} px-3 flex items-center`} title="Copy link">
                                <ClipboardIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ) : (
                        <button onClick={generateInviteLink} className={`${commonButtonClass} px-3 py-1.5 text-xs flex items-center`}>
                           <LinkIcon className="w-4 h-4 mr-1"/> Generate Invite Link (Mock)
                        </button>
                    )}
                </div>
            )}
            <div className="pt-6 border-t dark:border-gray-600 flex justify-between items-center">
                 <button onClick={() => onLeaveGroup(group.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-1.5"/> Leave Group
                </button>
                <button type="button" onClick={onClose} className={cancelButtonClass}>Close</button>
            </div>
        </div>
    );
};

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null; 
    allUsers: User[]; 
    currentUserId: string; 
    onRenameGroup: (groupId: string, newName: string) => void;
    onAddMember: (groupId: string, memberName: string) => void; 
    onRemoveMember: (groupId: string, userId: string) => void;
    onLeaveGroup: (groupId: string) => void;
    onAddNotification: (message: string, type?: Notification['type']) => void;
    appMode: AppMode; 
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = (props) => {
    if (!props.isOpen || !props.group) return null;

    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose} title={`Settings: ${props.group.name}`} size="lg">
            <GroupSettingsForm {...props} currentUserId={props.currentUserId!} appMode={props.appMode} />
        </Modal>
    );
};
export default GroupSettingsModal;