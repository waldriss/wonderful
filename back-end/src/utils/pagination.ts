import { PaginationMeta, PaginationQuery } from '../shared/types/pagination';

/**
 * Default pagination values
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination query parameters
 */
export function parsePagination(query: PaginationQuery): {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} {
  const page = Math.max(1, query.page || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    skip,
    sortBy: query.sortBy,
    sortOrder,
  };
}

/**
 * Build pagination metadata from total count
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
