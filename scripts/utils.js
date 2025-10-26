const bcrypt = require('bcryptjs');

// Utility functions that can be shared across scripts
const utils = {
  // Hash a password with bcrypt
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 12);
  },
  
  // Verify a password
  verifyPassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },
  
  // Format date for database
  formatDate: (date = new Date()) => {
    return date.toISOString().split('T')[0];
  },
  
  // Generate a random string
  generateRandomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

module.exports = utils;