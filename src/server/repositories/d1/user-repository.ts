import type {
  CreateUserInput,
  UserRecord,
  UserRepository,
} from '@/server/repositories/contracts';

import { firstOrNull, newId, nowIso } from './helpers';

interface UserRow {
  id: string;
  email_normalized: string | null;
  display_name: string | null;
  locale: 'zh-CN' | 'en-AU';
  unit_system: 'metric' | 'us';
  status: 'active' | 'disabled' | 'deleted';
  created_at: string;
  updated_at: string;
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    emailNormalized: row.email_normalized,
    displayName: row.display_name,
    locale: row.locale,
    unitSystem: row.unit_system,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.db
      .prepare(
        `SELECT id, email_normalized, display_name, locale, unit_system, status, created_at, updated_at
         FROM users WHERE id = ?1`,
      )
      .bind(id)
      .all<UserRow>();
    const row = firstOrNull(result);
    return row ? mapUser(row) : null;
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const id = newId('usr');
    const timestamp = nowIso();
    await this.db
      .prepare(
        `INSERT INTO users (
          id, email_normalized, display_name, locale, unit_system, currency, status, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, 'AUD', 'active', ?6, ?6)`,
      )
      .bind(
        id,
        input.emailNormalized ?? null,
        input.displayName ?? null,
        input.locale ?? 'zh-CN',
        input.unitSystem ?? 'metric',
        timestamp,
      )
      .run();

    return {
      id,
      emailNormalized: input.emailNormalized ?? null,
      displayName: input.displayName ?? null,
      locale: input.locale ?? 'zh-CN',
      unitSystem: input.unitSystem ?? 'metric',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}

