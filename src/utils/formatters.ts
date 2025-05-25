import { format, parseISO } from 'date-fns';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format time
export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};