import { SECOND_MS } from './units.js';

export default {
  fromName: 'Pizza Delivery',
  transport: {
    connectionTimeoutMs: 10 * SECOND_MS,
    greetingTimeoutMs: 10 * SECOND_MS,
    socketTimeoutMs: 20 * SECOND_MS,
  },
  // Paths appended to CLIENT_BASE_URL when building links inside emails.
  links: {
    verifyEmail: '/verify-email',
    resetPassword: '/reset-password',
    adminInventory: '/admin/inventory',
  },
};
