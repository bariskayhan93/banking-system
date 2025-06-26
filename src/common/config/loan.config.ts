export interface LoanConfig {
  readonly lendingPercentage: number;
  readonly maxLoanPerFriend: number;
  readonly usePercentageMethod: boolean;
  readonly cacheExpirationMs: number;
}

export const DEFAULT_LOAN_CONFIG: LoanConfig = {
  lendingPercentage: 25,
  maxLoanPerFriend: 10000,
  usePercentageMethod: false,
  cacheExpirationMs: 300000, // 5 minutes
};
