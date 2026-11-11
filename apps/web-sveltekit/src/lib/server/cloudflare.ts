import { getRequestEvent } from '$app/server';
export type Statement = { bind(...values: unknown[]): Statement; first<T = Record<string, unknown>>(column?: string): Promise<T | null>; all<T = Record<string, unknown>>(): Promise<{ results: T[] }>; run(): Promise<{ meta: { changes: number } }> };
export type Database = { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown[]> };
export type Bucket = { put(key: string, value: ArrayBuffer | Uint8Array | string, options?: unknown): Promise<unknown>; get(key: string): Promise<{ body: ReadableStream; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> } | null>; delete(key: string): Promise<unknown> };
export type CloudBindings = { DB: Database; PRIVATE_FILES: Bucket; ADMIN_PASSCODE?: string; VAULT_ADMIN_PASSWORD?: string; VAULT_SESSION_SECRET?: string; [name: string]: unknown };
export function cloudBindings(): CloudBindings | undefined {
  try { return (getRequestEvent().platform as { env?: CloudBindings } | undefined)?.env; } catch { return undefined; }
}
export function requireCloud() { const bindings = cloudBindings(); if (!bindings?.DB || !bindings.PRIVATE_FILES) throw new Error('Private storage is not configured.'); return bindings; }
