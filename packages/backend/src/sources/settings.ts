import { SOURCE_DEFAULTS } from "@aihot/site";
import { sql, type Db } from "../db.ts";

/** Default for new sources; existing sources keep their own editable interval. */
export async function collectionSettings(db: Db = sql): Promise<{ intervalMinutes: number }> {
  const [row] = await db<{ value: { intervalMinutes: number } }[]>`SELECT value FROM settings WHERE key = 'collection'`;
  return row?.value ?? { intervalMinutes: SOURCE_DEFAULTS.intervalMinutes };
}
