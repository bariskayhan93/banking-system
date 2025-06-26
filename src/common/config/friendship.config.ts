export const FRIENDSHIP_CONFIG = {
  // Maximum number of direct friends a person can have
  MAX_DIRECT_FRIENDS: 1000,

  // Friendship network limits
  MAX_NETWORK_DEPTH: 6, // Six degrees of separation
  MAX_NETWORK_SIZE: 10000, // Maximum total network size

  // Cycle detection settings
  ENABLE_CYCLE_DETECTION: true,
  MAX_PATH_LENGTH_FOR_CYCLE_CHECK: 10,
} as const;
