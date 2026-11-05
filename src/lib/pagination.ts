import * as z from "zod";

export interface Pagination {
  page: number;
  size: number;
}
export type PaginationArg = Partial<Pagination> | undefined;

export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  size: 16,
} as const;

export function injectPaginationDefaults(pagination: PaginationArg) {
  if (pagination) {
    return {
      page: Math.floor(Math.abs(pagination.page ?? DEFAULT_PAGINATION.page)),
      size: Math.floor(Math.abs(pagination.size ?? DEFAULT_PAGINATION.size)),
    };
  }
  return DEFAULT_PAGINATION;
}

export function buildPaginationQueryAugments(p: PaginationArg) {
  if (p) {
    const pagination = injectPaginationDefaults(p);
    return {
      limit: pagination.size,
      offset: (pagination.page - 1) * pagination.size,
    };
  }
  return {
    limit: DEFAULT_PAGINATION.size,
    offset: 0,
  };
}

export const paginationSchema = z
  .object({
    page: z.number().positive().default(DEFAULT_PAGINATION.page),
    limit: z.number().positive().default(DEFAULT_PAGINATION.size),
  })
  .optional();
