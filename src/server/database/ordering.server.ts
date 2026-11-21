import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";

/**
 * `sort_order` for a new row: one past the current maximum, so it lands at
 * the end of its list. `scope` narrows which rows count as "its list".
 */
export function nextSortOrder(
  table: PgTable,
  sort_column: AnyPgColumn,
  scope?: SQL,
) {
  const where = scope ? sql` where ${scope}` : sql``;
  return sql<number>`(select coalesce(max(${sort_column}), -1) + 1 from ${table}${where})`;
}

/**
 * Sets `sort_order` to each id's index in `ids`, in a single statement.
 * Rows whose id isn't listed (or that fall outside `scope`) are untouched.
 * `id_type` is the id column's type (slugs are text; some tables use uuid).
 */
export function buildReorderQuery(
  table: PgTable,
  id_column: AnyPgColumn,
  ids: string[],
  scope?: SQL,
  id_type: "text" | "uuid" = "text",
) {
  const cast = sql.raw(id_type);
  const rows = sql.join(
    ids.map((id, index) => sql`(${id}::${cast}, ${index}::integer)`),
    sql`, `,
  );
  const and_scope = scope ? sql` and ${scope}` : sql``;
  return sql`update ${table}
    set ${sql.identifier("sort_order")} = new_order.sort_order
    from (values ${rows}) as new_order(id, sort_order)
    where ${id_column} = new_order.id${and_scope}`;
}
