export const MONGO_DUPLICATE_KEY_CODE = 11_000;

// Mongoose connection.readyState values.
export const DB_READY_STATE = Object.freeze({
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3,
});
