import { Expense, User, Debt } from '../types';

export const calculateSimplifiedDebts = (expenses: Expense[], members: User[]): Debt[] => {
  if (members.length === 0) return [];

  const netBalances: { [userId: string]: number } = {};
  members.forEach(member => netBalances[member.id] = 0);

  expenses.forEach(expense => {
    expense.payers.forEach(payer => {
      if (netBalances[payer.userId] !== undefined) {
        netBalances[payer.userId] += payer.amountPaid;
      }
    });
    expense.splitDetails.forEach(detail => {
      if (netBalances[detail.userId] !== undefined) {
        netBalances[detail.userId] -= detail.owes;
      }
    });
  });

  const debtors: Array<{ id: string, amount: number }> = [];
  const creditors: Array<{ id: string, amount: number }> = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    const epsilon = 0.005; // Adjusted epsilon for more practical rounding
    if (balance < -epsilon) {
      debtors.push({ id: userId, amount: balance });
    } else if (balance > epsilon) {
      creditors.push({ id: userId, amount: balance });
    }
  });

  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: Debt[] = [];
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];
    const amountToSettle = Math.min(-debtor.amount, creditor.amount);
    
    const epsilon = 0.005; 

    if (amountToSettle > epsilon) {
        simplifiedDebts.push({
            fromUserId: debtor.id,
            toUserId: creditor.id,
            amount: parseFloat(amountToSettle.toFixed(2)), // Ensure 2 decimal places for amount
            id: `${debtor.id}-${creditor.id}`, // Simple unique ID, might need improvement for multiple debts between same two people if not fully simplified.
        });

        debtor.amount += amountToSettle;
        creditor.amount -= amountToSettle;
    }

    if (Math.abs(debtor.amount) < epsilon) {
      debtorIdx++;
    }
    if (Math.abs(creditor.amount) < epsilon) {
      creditorIdx++;
    }
  }
  return simplifiedDebts;
};