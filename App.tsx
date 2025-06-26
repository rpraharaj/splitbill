// App.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Group, Expense, Debt, AllExpensesData, Notification, SplitType, SupportedCurrency, SUPPORTED_CURRENCIES, AppTab, AppMode, AppGeneralSettings, MultiBillEntry, ExpensePayer, ExpenseSplitDetail } from './types';
import ModalComponent from './components/Modal';
import {
    PlusIcon, UsersIcon,
    BuildingOfficeIcon, ExclamationTriangleIcon
} from './components/icons';
import { calculateSimplifiedDebts } from './utils/balanceCalculator';
import { commonButtonClass, APP_GENERAL_SETTINGS_KEY, APP_DATA_KEY, DEFAULT_USER_NAME, LOCAL_USER_ID } from './constants';
import { formatCurrency, dateToISODateString } from './utils/formatting';
// useAuth and useUser from Clerk are removed
import { appConfig } from './app.config';
// GoogleGenAI, GenerateContentResponse import removed

// Component Imports
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExpenseForm } from './components/ExpenseForm';
import { NotificationContainer } from './components/NotificationSystem';
import NoGroupsView from './components/NoGroupsView';
import CreateGroupModal from './components/modals/CreateGroupModal';
import GroupSettingsModal from './components/modals/GroupSettingsModal';
import SettleDebtModal from './components/modals/SettleDebtModal';
import SummaryModal from './components/modals/SummaryModal';
import GlobalSettingsModal from './components/modals/GlobalSettingsModal';
import SetUserNameModal from './components/modals/SetUserNameModal'; 
import AddMultipleBillsModal from './components/modals/AddMultipleBillsModal'; // New Modal
import LandingPage from './components/LandingPage';
import TabNavigation from './components/TabNavigation';
import DashboardView from './components/views/DashboardView';
import MembersView from './components/views/MembersView';
import BillsView from './components/views/BillsView';
import AnalyserView from './components/views/AnalyserView';

export type BillsViewMode = 'card' | 'table';

interface AppLogicContainerProps {
  initialAppMode: AppMode; 
  appMode: AppMode; 
  setAppMode: React.Dispatch<React.SetStateAction<AppMode>>; 
  setShowLandingPage: React.Dispatch<React.SetStateAction<boolean>>; 
}

const AppLogicContainer: React.FC<AppLogicContainerProps> = ({
  initialAppMode, 
  appMode, 
  setAppMode, 
  setShowLandingPage 
}) => {
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME);
  const [showSetUserNameModal, setShowSetUserNameModal] = useState(false);

  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [allExpenses, setAllExpenses] = useState<AllExpensesData>({});

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [showAddMultipleBillsModal, setShowAddMultipleBillsModal] = useState(false); // New state

  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSettleDebtModal, setShowSettleDebtModal] = useState(false);
  const [debtToSettle, setDebtToSettle] = useState<Debt | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false);

  const [isPromptingForUserNameOnGroupCreate, setIsPromptingForUserNameOnGroupCreate] = useState(false);
  const [pendingGroupNameForUser, setPendingGroupNameForUser] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newlyAddedExpenseId, setNewlyAddedExpenseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [billsViewMode, setBillsViewMode] = useState<BillsViewMode>('card');

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info', duration = 5000) => {
    const id = `notif-logic-${Date.now()}`;
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const currentUserId = useMemo(() => {
      if (appConfig.enableOfflineMode) return LOCAL_USER_ID;
      return null; 
  }, [appConfig.enableOfflineMode]);

  const currentUser = useMemo(() => {
    let userObject: User;
    if (appConfig.enableOfflineMode) { 
        userObject = {
            id: LOCAL_USER_ID, name: userName,
            profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&size=128`, email: undefined,
        };
    } else { 
        userObject = { id: 'anonymous', name: 'Anonymous', profileImageUrl: undefined, email: undefined };
    }
    return userObject;
  }, [userName, appConfig.enableOfflineMode]);

  useEffect(() => {
    const savedGeneralSettingsRaw = localStorage.getItem(APP_GENERAL_SETTINGS_KEY);
    if (savedGeneralSettingsRaw) {
        try {
            const savedSettings: AppGeneralSettings = JSON.parse(savedGeneralSettingsRaw);
            if (savedSettings.darkMode !== undefined) setDarkMode(savedSettings.darkMode);
            if (savedSettings.currency && SUPPORTED_CURRENCIES.includes(savedSettings.currency)) setSelectedCurrency(savedSettings.currency);
            if (savedSettings.billsViewMode) setBillsViewMode(savedSettings.billsViewMode);
            if (savedSettings.userName) setUserName(savedSettings.userName);
        } catch (e) { console.error("[AppLogicContainer] Failed to parse general settings:", e); }
    }
  }, []);


  useEffect(() => {
    try {
        const modeToPersist = appConfig.enableOfflineMode ? 'offline' : undefined; 
        const generalSettings: AppGeneralSettings = { darkMode, currency: selectedCurrency, billsViewMode, appMode: modeToPersist, userName };
        localStorage.setItem(APP_GENERAL_SETTINGS_KEY, JSON.stringify(generalSettings));
    } catch (e) {
        addNotification("Error: Could not save general settings.", "error", 7000);
    }
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode, selectedCurrency, billsViewMode, userName, addNotification, appConfig.enableOfflineMode]);


  useEffect(() => {
    let dataLoaded = false;
    try {
        if (appConfig.enableOfflineMode) { 
        const appDataRaw = localStorage.getItem(APP_DATA_KEY);
        if (appDataRaw) {
            const appData = JSON.parse(appDataRaw);
            setAllGroups(appData.allGroups || []);
            setAllExpenses(appData.allExpenses || {});
            setLocalUsers(appData.localUsers || []);
            const userGroups = (appData.allGroups || []).filter((g: Group) => g.creatorId === LOCAL_USER_ID || g.members.some(m => m.id === LOCAL_USER_ID));
            setCurrentGroupId(userGroups.length > 0 ? userGroups[0].id : '');
            dataLoaded = true;
        }
        } else { 
             setAllGroups([]); setAllExpenses({}); setLocalUsers([]); setCurrentGroupId(''); dataLoaded = true;
        }
    } catch (e) {
        addNotification("Error: Could not load app data.", "error", 7000);
        setAllGroups([]); setAllExpenses({}); setLocalUsers([]); setCurrentGroupId('');
        dataLoaded = true;
    }
    if (!dataLoaded) {
        setAllGroups([]); setAllExpenses({}); setLocalUsers([]); setCurrentGroupId('');
    }
  }, [addNotification, appConfig.enableOfflineMode]);

  useEffect(() => {
    try {
        if (appConfig.enableOfflineMode) { 
            localStorage.setItem(APP_DATA_KEY, JSON.stringify({ allGroups, allExpenses, localUsers }));
        }
    } catch (e) {
        addNotification("Error: Could not save app data.", "error", 7000);
    }
  }, [allGroups, allExpenses, localUsers, addNotification, appConfig.enableOfflineMode]);

  useEffect(() => { setActiveTab('dashboard'); }, [currentGroupId]);

   useEffect(() => {
    if (appConfig.enableOfflineMode) { 
        const userGroups = allGroups.filter(g => g.creatorId === LOCAL_USER_ID || g.members.some(m => m.id === LOCAL_USER_ID));
        if (currentGroupId && !userGroups.find(g => g.id === currentGroupId)) {
            setCurrentGroupId(userGroups.length > 0 ? userGroups[0].id : '');
        } else if (!currentGroupId && userGroups.length > 0) {
            setCurrentGroupId(userGroups[0].id);
        }
    } else {
        setCurrentGroupId('');
    }
   }, [allGroups, currentGroupId, appConfig.enableOfflineMode]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const currentGroup = useMemo(() => allGroups.find(g => g.id === currentGroupId), [allGroups, currentGroupId]);
  const expensesForCurrentGroup = useMemo(() => allExpenses[currentGroupId] || [], [allExpenses, currentGroupId]);

  const allDisplayUsers = useMemo(() => {
    const combined = new Map<string, User>();
    if (currentUser && currentUser.id !== 'anonymous') combined.set(currentUser.id, currentUser);
    localUsers.forEach(u => combined.set(u.id, u));
    currentGroup?.members.forEach(m => { if (!combined.has(m.id)) combined.set(m.id, m); });
    return Array.from(combined.values());
  }, [localUsers, currentUser, currentGroup]);

  const handleSaveExpense = useCallback((expense: Expense) => {
    if (!appConfig.enableOfflineMode) {
        addNotification(`Application is not configured correctly. Cannot save expense.`, "error"); return;
    }
    const actualAddedById = currentUser.id; 
    setAllExpenses(prev => {
      const groupExpenses = prev[expense.groupId] || [];
      const idx = groupExpenses.findIndex(e => e.id === expense.id);
      let updated; let isNew = false;
      if (idx > -1) { updated = [...groupExpenses]; updated[idx] = expense; }
      else { updated = [...groupExpenses, { ...expense, addedById: actualAddedById }]; isNew = true; }
      const sorted = updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if(isNew && !expense.isSettlement){ setNewlyAddedExpenseId(expense.id); setTimeout(() => setNewlyAddedExpenseId(null), 1000); }
      return { ...prev, [expense.groupId]: sorted };
    });
    setShowAddExpenseModal(false); setExpenseToEdit(null);
  }, [currentUser, addNotification, appConfig.enableOfflineMode]);

  // handleSuggestCategory function removed

  const handleSaveMultipleExpenses = useCallback((billEntries: MultiBillEntry[]) => {
    if (!currentGroup || !currentUser.id) {
        addNotification("Cannot save bills: group or user context is missing.", "error");
        return;
    }
    if (billEntries.length === 0) {
        addNotification("No bills to save.", "info");
        setShowAddMultipleBillsModal(false);
        return;
    }

    const newExpenses: Expense[] = [];
    let firstNewExpenseId: string | null = null;

    for (const entry of billEntries) {
        const numericTotalAmount = Number(entry.totalAmount);
        if (!entry.description.trim() || isNaN(numericTotalAmount) || numericTotalAmount <= 0) {
            addNotification(`Skipping bill: "${entry.description || 'Unnamed'}" due to missing/invalid data.`, "error");
            continue;
        }

        const payers: ExpensePayer[] = [{ userId: entry.paidById, amountPaid: numericTotalAmount }];
        
        // Simplified: Split equally among all group members
        const splitDetails: ExpenseSplitDetail[] = [];
        if (currentGroup.members.length > 0) {
            const amountPerMember = parseFloat((numericTotalAmount / currentGroup.members.length).toFixed(2));
            currentGroup.members.forEach(member => {
                splitDetails.push({ userId: member.id, owes: amountPerMember });
            });
            // Adjust for rounding differences if any
            const totalOwedCalculated = splitDetails.reduce((sum, p) => sum + p.owes, 0);
            if (Math.abs(totalOwedCalculated - numericTotalAmount) > 0.005 && splitDetails.length > 0) {
                const difference = numericTotalAmount - totalOwedCalculated;
                splitDetails[0].owes = parseFloat((splitDetails[0].owes + difference).toFixed(2));
            }
        }
        
        const expenseId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        if (!firstNewExpenseId) {
            firstNewExpenseId = expenseId;
        }

        newExpenses.push({
            id: expenseId,
            groupId: currentGroup.id,
            description: entry.description.trim(),
            totalAmount: numericTotalAmount,
            date: entry.date, // Already ISO string
            addedById: currentUser.id,
            payers,
            splitType: SplitType.EQUALLY, // Default for multi-add
            splitDetails,
            category: entry.category.trim() || undefined,
            isSettlement: false,
        });
    }

    if (newExpenses.length > 0) {
        setAllExpenses(prev => {
            const groupExpenses = [...(prev[currentGroup.id] || []), ...newExpenses];
            const sorted = groupExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (firstNewExpenseId) {
                setNewlyAddedExpenseId(firstNewExpenseId);
                setTimeout(() => setNewlyAddedExpenseId(null), 1000);
            }
            return { ...prev, [currentGroup.id]: sorted };
        });
        addNotification(`${newExpenses.length} bill(s) added successfully!`, "success");
    }
    setShowAddMultipleBillsModal(false);
  }, [currentGroup, currentUser, addNotification]);

  const handleDeleteExpense = useCallback((expenseId: string, groupId: string) => {
    if (window.confirm("Delete this expense?")) {
        setAllExpenses(prev => ({ ...prev, [groupId]: (prev[groupId] || []).filter(exp => exp.id !== expenseId) }));
        addNotification("Expense deleted successfully.", "success");
    }
  }, [addNotification]); // Added addNotification to dependencies

  const handleEditExpense = (expense: Expense) => { setExpenseToEdit(expense); setShowAddExpenseModal(true); };

  const handleOpenAddExpenseModal = () => {
    if (!appConfig.enableOfflineMode) { 
        addNotification(`Application is not configured correctly. Cannot add expense.`, "error"); return;
    }
    if (!currentGroup) { addNotification("Select or create a group first.", "info"); return; }
    setExpenseToEdit(null); setShowAddExpenseModal(true);
  }
  
  const handleOpenAddMultipleBillsModal = () => {
    if (!appConfig.enableOfflineMode) {
        addNotification(`Application is not configured correctly. Cannot add multiple bills.`, "error"); return;
    }
    if (!currentGroup) { addNotification("Select or create a group first.", "info"); return; }
    setShowAddMultipleBillsModal(true);
  };


  const handleCreateGroup = useCallback((groupName: string) => {
    if (!appConfig.enableOfflineMode) { 
        addNotification(`Application is not configured correctly. Cannot create group.`, "error"); return;
    }
    if (!groupName.trim()) { addNotification("Group name cannot be empty.", "error"); return; }
    if (appConfig.enableOfflineMode && userName === DEFAULT_USER_NAME) { 
        setPendingGroupNameForUser(groupName.trim()); 
        setIsPromptingForUserNameOnGroupCreate(true); 
        setShowSetUserNameModal(true); 
        setShowCreateGroupModal(false); return;
    }
    const newGroup: Group = { id: `group-${Date.now()}`, name: groupName.trim(), creatorId: currentUser.id, members: [currentUser] };
    setAllGroups(prev => [...prev, newGroup]);
    setAllExpenses(prev => ({...prev, [newGroup.id]: [] }));
    setCurrentGroupId(newGroup.id); setShowCreateGroupModal(false);
    addNotification(`Group "${newGroup.name}" created!`, "success");
  }, [currentUser, userName, addNotification, appConfig.enableOfflineMode]);

  const initiateCreateGroupProcess = () => {
    if (!appConfig.enableOfflineMode ) { 
        addNotification(`Application is not configured correctly. Cannot create group.`, "error"); return;
    }
    if (appConfig.enableOfflineMode && userName === DEFAULT_USER_NAME) { 
        setIsPromptingForUserNameOnGroupCreate(true); 
        setShowSetUserNameModal(true); 
    } else { setShowCreateGroupModal(true); }
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    if (!newName.trim()) { addNotification("Group name cannot be empty.", "error"); return; }
    setAllGroups(prev => prev.map(g => g.id === groupId ? {...g, name: newName.trim()} : g));
    addNotification("Group renamed.", "success");
  };

  const handleAddMemberToGroup = useCallback((groupId: string, memberNameRaw: string) => {
    const memberNameTrimmed = memberNameRaw.trim();
    if (!memberNameTrimmed) { addNotification("Member name empty.", "error"); return; }
    const group = allGroups.find(g => g.id === groupId);
    if (!group) { addNotification("Group not found.", "error"); return; }
    const memberNameLower = memberNameTrimmed.toLowerCase();
    if (currentUser.id !== 'anonymous' && currentUser.name.toLowerCase() === memberNameLower && group.members.some(m => m.id === currentUser.id)) {
        addNotification(`You (${currentUser.name}) are already in this group.`, "info"); return;
    }
    if (group.members.find(m => m.name.toLowerCase() === memberNameLower)) {
        addNotification(`"${memberNameTrimmed}" is already in this group.`, "info"); return;
    }
    const existingLocalUser = localUsers.find(u => u.name.toLowerCase() === memberNameLower && !group.members.some(gm => gm.id === u.id));
    let userToAdd: User | null = null;
    if (existingLocalUser && window.confirm(`Use existing contact "${existingLocalUser.name}"?`)) userToAdd = existingLocalUser;
    else if (appConfig.enableOfflineMode && userName.toLowerCase() === memberNameLower && !group.members.some(m => m.id === LOCAL_USER_ID) && window.confirm(`Add yourself ("${userName}")?`)) userToAdd = currentUser;
    if (!userToAdd) {
        userToAdd = { id: `local-${Date.now()}`, name: memberNameTrimmed, profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberNameTrimmed)}&background=random&color=fff&size=60`, email: `${memberNameLower.replace(/\s+/g, '.')}@local.settleup` };
        setLocalUsers(prev => [...prev, userToAdd!]);
    }
    if (userToAdd) {
        setAllGroups(prev => prev.map(g => g.id === groupId && !g.members.find(m => m.id === userToAdd!.id) ? { ...g, members: [...g.members, userToAdd!] } : g));
        addNotification(`"${userToAdd.name}" added.`, "success");
    }
  }, [allGroups, localUsers, currentUser, userName, addNotification, appConfig.enableOfflineMode]); 

  const handleRemoveMemberFromGroup = (groupId: string, userId: string) => {
     const group = allGroups.find(g => g.id === groupId); if (!group) return;
     if (userId === group.creatorId && group.members.length > 1) { addNotification("Creator cannot be removed if others exist.", "error"); return; }
     if (group.members.length === 1 && userId === group.creatorId && window.confirm("Removing last member (creator) deletes group. Continue?")) { handleDeleteGroup(groupId); return; }
    const memberName = group.members.find(u=>u.id === userId)?.name || 'Member';
    setAllGroups(prev => prev.map(g => g.id === groupId ? {...g, members: g.members.filter(m => m.id !== userId)} : g));
    addNotification(`${memberName} removed.`, "info");
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUserId) { addNotification("User context not found.", "error"); return; } 
    const groupToLeave = allGroups.find(g => g.id === groupId); if (!groupToLeave) return;
    if (groupToLeave.creatorId === currentUserId && groupToLeave.members.length > 1) { addNotification("Creator can't leave if others present.", "error"); return; }
    if (window.confirm(`Leave "${groupToLeave.name}"?`)) {
        if (groupToLeave.members.length === 1 && groupToLeave.members[0].id === currentUserId) { handleDeleteGroup(groupId); addNotification(`Group "${groupToLeave.name}" deleted.`, "info"); }
        else {
            setAllGroups(prev => prev.map(g => g.id === groupId ? {...g, members: g.members.filter(m => m.id !== currentUserId)} : g).filter(g => !(g.id === groupId && g.members.length === 0 && g.creatorId !== currentUserId)));
            addNotification(`You left "${groupToLeave.name}".`, "info");
        }
        if (currentGroupId === groupId) {
            const remaining = allGroups.filter(g => g.id !== groupId && (g.members.some(m => m.id === currentUserId) || g.creatorId === currentUserId));
            setCurrentGroupId(remaining.length > 0 ? remaining[0].id : '');
        }
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupName = allGroups.find(g => g.id === groupId)?.name || "The group";
    setAllGroups(prev => prev.filter(g => g.id !== groupId));
    setAllExpenses(prev => { const {[groupId]: _, ...rest} = prev; return rest; });
    addNotification(`Group "${groupName}" deleted.`, "info");
    if (currentGroupId === groupId) {
        const remaining = allGroups.filter(g => g.id !== groupId && currentUserId && (g.members.some(m => m.id === currentUserId) || g.creatorId === currentUserId));
        setCurrentGroupId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const handleSettleDebtClick = (debt: Debt) => { setDebtToSettle(debt); setShowSettleDebtModal(true); };

  const handleConfirmSettlement = useCallback((debt: Debt, amount: number) => {
    if (!currentGroup) { addNotification("Group context missing.", "error"); return; }
    const payerUser = allDisplayUsers.find(u => u.id === debt.fromUserId);
    const receiverUser = allDisplayUsers.find(u => u.id === debt.toUserId);
    if (!payerUser || !receiverUser) { addNotification("Users in debt not found.", "error"); return; }
    const settlementExpense: Expense = {
        id: `settle-${Date.now()}`, groupId: currentGroupId, description: `Settlement: ${payerUser.name} paid ${receiverUser.name}`,
        totalAmount: amount, date: new Date().toISOString(), addedById: currentUser.id,
        payers: [{ userId: debt.fromUserId, amountPaid: amount }], splitType: SplitType.EXACT_AMOUNTS,
        splitDetails: [{ userId: debt.toUserId, owes: amount }], category: "Settlement", isSettlement: true,
    };
    handleSaveExpense(settlementExpense);
    addNotification(`Settlement of ${formatCurrency(amount, selectedCurrency)} to ${receiverUser.name} recorded.`, "success");
    setShowSettleDebtModal(false); setDebtToSettle(null);
  }, [currentGroupId, currentUser, handleSaveExpense, selectedCurrency, allDisplayUsers, currentGroup, addNotification]);

  const simplifiedDebts = useMemo(() => {
    if (!currentGroup || !currentGroup.members || !appConfig.enableOfflineMode) return [];
    const involvedIds = new Set<string>(currentGroup.members.map(m => m.id));
    expensesForCurrentGroup.forEach(exp => { exp.payers.forEach(p => involvedIds.add(p.userId)); exp.splitDetails.forEach(sd => involvedIds.add(sd.userId)); });
    const debtUsers = Array.from(involvedIds).map(id => allDisplayUsers.find(u => u.id === id) || {id, name: 'Unknown'}).filter(Boolean) as User[];
    return calculateSimplifiedDebts(expensesForCurrentGroup.filter(e => !e.isSettlement), debtUsers);
  }, [expensesForCurrentGroup, currentGroup, allDisplayUsers, appConfig.enableOfflineMode]);

  const sortedExpenses = useMemo(() => [...expensesForCurrentGroup].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [expensesForCurrentGroup]);

  const { groupTotalSpending, currentUserTotalShare, currentUserTotalPaid } = useMemo(() => {
    let total = 0; let share = 0; let paid = 0;
    if (!currentUserId || !appConfig.enableOfflineMode) return { groupTotalSpending: 0, currentUserTotalShare: 0, currentUserTotalPaid: 0 };
    expensesForCurrentGroup.forEach(exp => {
      if (!exp.isSettlement) {
        total += exp.totalAmount;
        const detail = exp.splitDetails.find(sd => sd.userId === currentUserId);
        if (detail) share += detail.owes;
        exp.payers.forEach(p => { if (p.userId === currentUserId) paid += p.amountPaid; });
      }
    });
    return { groupTotalSpending: total, currentUserTotalShare: share, currentUserTotalPaid: paid };
  }, [expensesForCurrentGroup, currentUserId, appConfig.enableOfflineMode]);

  const handleSaveGlobalSettings = (newCurrency: SupportedCurrency) => {
    setSelectedCurrency(newCurrency); setShowGlobalSettingsModal(false);
    addNotification(`Currency changed to ${newCurrency}.`, 'success');
  };

  const handleSaveUserName = (newName: string) => { 
    setUserName(newName); 
    setShowSetUserNameModal(false); 
    addNotification(`Name set to "${newName}".`, 'success');
    if (isPromptingForUserNameOnGroupCreate) { 
        if (pendingGroupNameForUser) handleCreateGroup(pendingGroupNameForUser); 
        else setShowCreateGroupModal(true);
    }
    setIsPromptingForUserNameOnGroupCreate(false); setPendingGroupNameForUser(''); 
  };
  
  const renderActiveTabView = () => {
    const userGroups = allGroups.filter(g => g.creatorId === currentUser.id || g.members.some(m => m.id === currentUser.id));
    if (!currentGroup && userGroups.length > 0 && appConfig.enableOfflineMode) { 
        return <div className="p-8 text-center text-xl dark:text-white">Loading group data...</div>;
    }
    if (!currentGroup) {
        return <NoGroupsView onInitiateCreateGroup={initiateCreateGroupProcess} appMode="offline" />;
    }
    switch(activeTab) {
      case 'dashboard': return <DashboardView debts={simplifiedDebts} users={allDisplayUsers} currentGroup={currentGroup} currentUserId={currentUser.id} onSettleDebtClick={handleSettleDebtClick} groupTotalSpending={groupTotalSpending} currentUserTotalShare={currentUserTotalShare} currentUserTotalPaid={currentUserTotalPaid} expensesForCurrentGroup={expensesForCurrentGroup} darkMode={darkMode} selectedCurrency={selectedCurrency} onSetCurrentTab={setActiveTab} onShowSummaryModal={() => setShowSummaryModal(true)} />;
      case 'members': return <MembersView group={currentGroup} onShowGroupSettingsModal={() => setShowGroupSettingsModal(true)} allUsers={allDisplayUsers} appMode="offline" />;
      case 'bills': return <BillsView expenses={sortedExpenses} groupMembers={currentGroup.members} currentUserId={currentUser.id} groupCreatorId={currentGroup.creatorId} onDeleteExpense={handleDeleteExpense} onEditExpense={handleEditExpense} newlyAddedExpenseId={newlyAddedExpenseId} selectedCurrency={selectedCurrency} onOpenAddExpenseModal={handleOpenAddExpenseModal} onOpenAddMultipleBillsModal={handleOpenAddMultipleBillsModal} billsViewMode={billsViewMode} setBillsViewMode={setBillsViewMode} />;
      case 'analyser': return <AnalyserView expenses={expensesForCurrentGroup.filter(e => !e.isSettlement)} members={currentGroup.members} users={allDisplayUsers} darkMode={darkMode} selectedCurrency={selectedCurrency} onSetCurrentTab={setActiveTab} />;
      default: return null;
    }
  }

  const userVisibleGroups = allGroups.filter(g => g.creatorId === currentUser.id || g.members.some(m => m.id === currentUser.id));
  const shouldShowContent = appConfig.enableOfflineMode; 

  if (shouldShowContent && userVisibleGroups.length === 0 ) {
      return (
          <>
            <NotificationContainer notifications={notifications} onRemoveNotification={removeNotification} />
             <Header currentGroupId={currentGroupId} allGroups={userVisibleGroups} darkMode={darkMode} onSetCurrentGroupId={setCurrentGroupId} onInitiateCreateGroup={initiateCreateGroupProcess} onSetDarkMode={setDarkMode} onShowGlobalSettingsModal={() => setShowGlobalSettingsModal(true)} appMode="offline" setAppMode={setAppMode} onShowSetUserNameModal={() => setShowSetUserNameModal(true)} currentUser={currentUser} />
            <NoGroupsView onInitiateCreateGroup={initiateCreateGroupProcess} appMode="offline" />
            <CreateGroupModal isOpen={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)} onCreateGroup={handleCreateGroup} />
            <SetUserNameModal isOpen={showSetUserNameModal} onClose={() => { setShowSetUserNameModal(false); setIsPromptingForUserNameOnGroupCreate(false); setPendingGroupNameForUser(''); }} currentUserName={userName} onSaveUserName={handleSaveUserName} />
            {currentGroup && <AddMultipleBillsModal isOpen={showAddMultipleBillsModal} onClose={() => setShowAddMultipleBillsModal(false)} group={currentGroup} currentUserId={currentUser.id} onSaveMultipleExpenses={handleSaveMultipleExpenses} selectedCurrency={selectedCurrency} />}
            <Footer currentUser={currentUser} appMode="offline"/>
          </>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-darkBg text-gray-900 dark:text-darkText transition-colors duration-300 flex flex-col text-sm sm:text-base">
      <NotificationContainer notifications={notifications} onRemoveNotification={removeNotification} />
      <Header currentGroupId={currentGroupId} allGroups={userVisibleGroups} darkMode={darkMode} onSetCurrentGroupId={setCurrentGroupId} onInitiateCreateGroup={initiateCreateGroupProcess} onSetDarkMode={setDarkMode} onShowGlobalSettingsModal={() => setShowGlobalSettingsModal(true)} appMode="offline" setAppMode={setAppMode} onShowSetUserNameModal={() => setShowSetUserNameModal(true)} currentUser={currentUser} />

    {shouldShowContent ? (
      <>
        {currentGroup && (<div className="hidden md:block sticky top-[80px] z-30 bg-white dark:bg-darkSurface shadow-sm"><nav className="container mx-auto"><TabNavigation activeTab={activeTab} onSetTab={setActiveTab} isMobile={false} /></nav></div>)}
        <main className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 flex-grow">
          {currentGroup && (<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"><div className="flex items-center space-x-3 mb-3 sm:mb-0">{currentGroup.name.includes("Apartment") ? <BuildingOfficeIcon className="w-8 h-8 text-primary-500 dark:text-primary-400"/> : <UsersIcon className="w-8 h-8 text-primary-500 dark:text-primary-400"/>}<h2 className="text-2xl font-semibold text-gray-700 dark:text-darkText">Group: {currentGroup.name}</h2></div></div>)}
          {renderActiveTabView()}
        </main>
        {currentGroup && (<div className="md:hidden"><TabNavigation activeTab={activeTab} onSetTab={setActiveTab} isMobile={true} /></div>)}
      </>
     ) : ( 
        <main className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 flex-grow flex flex-col items-center justify-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mb-4" /> <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Application Error</h2>
            <p className="text-gray-600 dark:text-darkMuted"> SettleUp is not configured correctly. Please contact support. </p>
        </main>
     )}
      <Footer currentUser={currentUser} appMode="offline"/>
      {showAddExpenseModal && currentGroup && (<ModalComponent isOpen={true} onClose={() => { setShowAddExpenseModal(false); setExpenseToEdit(null);}} title={expenseToEdit ? "Edit Expense" : "Add New Expense"} size="2xl"><ExpenseForm group={currentGroup} currentUserId={currentUser.id} onSaveExpense={handleSaveExpense} onClose={() => { setShowAddExpenseModal(false); setExpenseToEdit(null); }} expenseToEdit={expenseToEdit} selectedCurrency={selectedCurrency}  /></ModalComponent>)}
      {currentGroup && <AddMultipleBillsModal isOpen={showAddMultipleBillsModal} onClose={() => setShowAddMultipleBillsModal(false)} group={currentGroup} currentUserId={currentUser.id} onSaveMultipleExpenses={handleSaveMultipleExpenses} selectedCurrency={selectedCurrency} />}
      {currentGroup && <GroupSettingsModal isOpen={showGroupSettingsModal} onClose={() => setShowGroupSettingsModal(false)} group={currentGroup} allUsers={allDisplayUsers} currentUserId={currentUser.id} onRenameGroup={handleRenameGroup} onAddMember={handleAddMemberToGroup} onRemoveMember={handleRemoveMemberFromGroup} onLeaveGroup={handleLeaveGroup} onAddNotification={addNotification} appMode="offline" />}
      <CreateGroupModal isOpen={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)} onCreateGroup={handleCreateGroup} />
      <SetUserNameModal isOpen={showSetUserNameModal} onClose={() => { setShowSetUserNameModal(false); setIsPromptingForUserNameOnGroupCreate(false); setPendingGroupNameForUser(''); }} currentUserName={userName} onSaveUserName={handleSaveUserName} />
      {currentGroup && <SettleDebtModal isOpen={showSettleDebtModal} onClose={() => { setShowSettleDebtModal(false); setDebtToSettle(null);}} debt={debtToSettle} payer={debtToSettle ? allDisplayUsers.find(u => u.id === debtToSettle.fromUserId) : undefined} receiver={debtToSettle ? allDisplayUsers.find(u => u.id === debtToSettle.toUserId) : undefined} onConfirmSettlement={handleConfirmSettlement} selectedCurrency={selectedCurrency} />}
      {currentGroup && <SummaryModal isOpen={showSummaryModal} onClose={() => setShowSummaryModal(false)} group={currentGroup} expenses={expensesForCurrentGroup} debts={simplifiedDebts} users={allDisplayUsers} darkMode={darkMode} selectedCurrency={selectedCurrency} />}
      <GlobalSettingsModal isOpen={showGlobalSettingsModal} onClose={() => setShowGlobalSettingsModal(false)} currentCurrency={selectedCurrency} onSaveSettings={handleSaveGlobalSettings} />
    </div>
  );
};


interface AppContentProps {
  initialAppModeFromIndex: AppMode;
}
const AppContent: React.FC<AppContentProps> = ({ initialAppModeFromIndex }) => {
  const [appMode, setAppMode] = useState<AppMode>(initialAppModeFromIndex);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false); 
  const [notifications, setNotifications] = useState<Notification[]>([]); 

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info', duration = 5000) => {
    const id = `notif-appcontent-${Date.now()}`;
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, []);
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (appConfig.enableOfflineMode && !appConfig.allowModeSwitching && appConfig.defaultInitialMode === 'offline') {
        setAppMode('offline');
        setShowLandingPage(false);
    } else if (appConfig.enableOfflineMode) { 
        const savedGeneralSettingsRaw = localStorage.getItem(APP_GENERAL_SETTINGS_KEY);
        let modeFromStorage: AppMode | undefined = undefined;
        if (savedGeneralSettingsRaw) {
            try {
                const savedSettings: AppGeneralSettings = JSON.parse(savedGeneralSettingsRaw);
                if (savedSettings.appMode === 'offline' && appConfig.enableOfflineMode) {
                    modeFromStorage = 'offline';
                }
            } catch (e) { console.error("[AppContent] Failed to parse general settings for mode:", e); }
        }
        if (modeFromStorage) { 
            setAppMode(modeFromStorage);
            setShowLandingPage(false);
        } else {
            setShowLandingPage(appConfig.enableOfflineMode && appConfig.allowModeSwitching);
            setAppMode(initialAppModeFromIndex); 
        }
    } else { 
        setAppMode('offline'); 
        setShowLandingPage(false);
    }
  }, [initialAppModeFromIndex]); 


  const handleSelectMode = (selectedMode: AppMode) => { 
    if (selectedMode === 'offline' && appConfig.enableOfflineMode) {
        setAppMode('offline');
        setShowLandingPage(false);
        try {
            const generalSettingsRaw = localStorage.getItem(APP_GENERAL_SETTINGS_KEY);
            const currentSettings = generalSettingsRaw ? JSON.parse(generalSettingsRaw) : {};
            const newSettings: AppGeneralSettings = { ...currentSettings, appMode: 'offline' };
            localStorage.setItem(APP_GENERAL_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (e) { addNotification("Error: Could not save mode selection.", "error", 7000); }
    } else {
        addNotification("Selected mode is not available or configuration error.", "error");
    }
  };


  if (!appConfig.enableOfflineMode) { 
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-darkBg flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <NotificationContainer notifications={notifications} onRemoveNotification={removeNotification} />
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Application Configuration Error</h1>
            <p className="text-gray-600 dark:text-darkMuted">SettleUp is not configured to run. Please check `app.config.ts` and ensure `enableOfflineMode` is true.</p>
        </div>
    );
  }

  if (showLandingPage) { 
      return (
        <>
          <NotificationContainer notifications={notifications} onRemoveNotification={removeNotification} />
          <LandingPage onSelectMode={handleSelectMode} clerkKeyAvailable={false} />
        </>
      );
  }

  return (
    <AppLogicContainer
      initialAppMode={initialAppModeFromIndex} 
      appMode={appMode} 
      setAppMode={setAppMode}
      setShowLandingPage={setShowLandingPage}
    />
  );
};


interface AppProps {
  initialAppMode: AppMode;
  clerkKeyAvailable: boolean; 
  isClerkProviderActive: boolean; 
}
const App: React.FC<AppProps> = ({ initialAppMode }) => { 
  return <AppContent initialAppModeFromIndex={initialAppMode} />;
}

export default App;