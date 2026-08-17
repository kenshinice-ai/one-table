import { ulid } from 'ulid';

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix: string): string {
  return `${prefix}_${ulid().toLowerCase()}`;
}

export function firstOrNull<T>(result: D1Result<T>): T | null {
  return result.results[0] ?? null;
}
