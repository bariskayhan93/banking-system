export const SEED_CONFIG = {
  // Person seeding
  DEFAULT_PERSON_COUNT: 10,

  // Bank account seeding
  MAX_ACCOUNTS_PER_PERSON: 3,
  INITIAL_BALANCE_BASE: 10000,
  INITIAL_BALANCE_RANDOM_RANGE: 5000,

  // Transaction seeding
  MAX_TRANSACTIONS_PER_ACCOUNT: 10,
  MIN_TRANSACTION_AMOUNT: 10,
  MAX_DEBIT_AMOUNT: 500,
  MIN_CREDIT_AMOUNT: 50,
  MAX_CREDIT_AMOUNT: 1000,
  DEBIT_PROBABILITY: 0.7,

  // Friendship seeding
  MIN_FRIENDS_PER_PERSON: 2,
  MAX_FRIENDS_PER_PERSON: 4,

  // Static data
  BANK_NAMES: ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'],
  IBAN_PREFIXES: ['DE89', 'FR76', 'GB29', 'US12', 'CH93'],

  TRANSACTION_DESCRIPTIONS: [
    'Grocery shopping',
    'Restaurant bill',
    'Online purchase',
    'Utility payment',
    'Salary deposit',
    'Rent payment',
    'Subscription fee',
    'Transfer',
  ],

  DEFAULT_PERSON_NAMES: [
    'John Doe',
    'Jane Smith',
    'Alice Johnson',
    'Bob Brown',
    'Charlie Davis',
    'Diana Evans',
    'Edward Franklin',
    'Fiona Green',
    'George Harris',
    'Ian Jackson',
  ],
} as const;
