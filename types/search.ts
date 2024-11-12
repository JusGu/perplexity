import { Search, Query } from '@prisma/client';

export interface SearchWithQueries extends Search {
  queries: Query[];
} 