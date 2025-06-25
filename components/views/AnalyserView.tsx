// components/views/AnalyserView.tsx
import React from 'react';
import SpendAnalyser from '../SpendAnalyser';
import { Expense, User, SupportedCurrency, AppTab } from '../../types';

interface AnalyserViewProps {
  expenses: Expense[];
  members: User[];
  users: User[];
  darkMode: boolean;
  selectedCurrency: SupportedCurrency;
  onSetCurrentTab: (tab: AppTab) => void;
}

const AnalyserView: React.FC<AnalyserViewProps> = (props) => {
  return (
    <SpendAnalyser
      expenses={props.expenses}
      members={props.members}
      users={props.users}
      darkMode={props.darkMode}
      selectedCurrency={props.selectedCurrency}
      onSetCurrentTab={props.onSetCurrentTab}
    />
  );
};

export default AnalyserView;