export const APP_NAME = 'IPE Services';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const RATE_LIMITS = {
  DEFAULT: { ttl: 60_000, limit: 100 },
  AUTH: { ttl: 60_000, limit: 5 },
  SENSITIVE: { ttl: 60_000, limit: 10 },
} as const;
