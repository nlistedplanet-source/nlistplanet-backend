// Format currency to INR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Calculate platform fee
export const calculatePlatformFee = (amount) => {
  const feePercentage = parseFloat(process.env.REACT_APP_PLATFORM_FEE_PERCENTAGE || 2);
  return (amount * feePercentage) / 100;
};

// Calculate total with platform fee
export const calculateTotalWithFee = (amount) => {
  return amount + calculatePlatformFee(amount);
};

// Format date
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return formatDate(date);
};

// Validate username
export const validateUsername = (username) => {
  const regex = /^[a-z0-9_]{3,20}$/;
  return regex.test(username);
};

// Validate email
export const validateEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

// Generate share URL with referral code
export const generateShareURL = (referralCode, listingId = null) => {
  const baseURL = window.location.origin;
  if (listingId) {
    return `${baseURL}/marketplace?ref=${referralCode}&listing=${listingId}`;
  }
  return `${baseURL}?ref=${referralCode}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    sold: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
