

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    // console.warn(`Invalid date string received by formatDate: ${dateString}`);
    return 'Invalid Date';
  }
  
  // Rely on toLocaleDateString to handle timezone conversion based on user's browser settings
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const dateToISODateString = (date: Date): string => {
    // Check if the date is valid before calling toISOString
    if (isNaN(date.getTime())) {
        // console.warn('Invalid date object passed to dateToISODateString');
        // Return current date as a fallback or handle error appropriately
        return new Date().toISOString().split('T')[0]; 
    }
    return date.toISOString().split('T')[0];
};