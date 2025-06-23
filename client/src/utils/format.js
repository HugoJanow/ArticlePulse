import { ethers } from 'ethers';

/**
 * Format an Ethereum address to a shorter version
 * @param {string} address - The Ethereum address to format
 * @param {number} chars - Number of characters to show at the beginning and end
 * @returns {string} - The formatted address
 */
export const formatAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Format a token amount to a readable string
 * @param {string|number|BigNumber} amount - The amount to format
 * @param {number} decimals - Number of decimals to display
 * @returns {string} - The formatted amount
 */
export const formatTokenAmount = (amount, decimals = 2) => {
  if (!amount) return '0';
  
  try {
    // If amount is a BigNumber (from ethers)
    if (ethers.BigNumber.isBigNumber(amount)) {
      return parseFloat(ethers.utils.formatEther(amount)).toFixed(decimals);
    }
    
    // If amount is a string in wei
    if (typeof amount === 'string' && /^\d+$/.test(amount)) {
      return parseFloat(ethers.utils.formatEther(amount)).toFixed(decimals);
    }
    
    // Otherwise, just format as a number
    return parseFloat(amount).toFixed(decimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} - The formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Truncate a string to a specific length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} - The truncated string
 */
export const truncateString = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
