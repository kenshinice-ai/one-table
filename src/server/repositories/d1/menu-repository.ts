import type { MenuRecord, MenuRepository } from '@/server/repositories/contracts';

import { firstOrNull, nowIso } from './helpers';

interface MenuRow {
  id: string;
  event_id: string;
  generation_run_id: string | null;
  variant: 'balanced' | 'budget' | 'easy' | 'custom';
  revision: number;
  status: 'candidate' | 'selected' | 'superseded' | 'archived';
  created_at: string;
  updated_at: string;
}

function mapMenu(row: MenuRow): MenuRecord {
  return {
    id: row.id,
    eventId: row.event_id,
    generationRunId: row.generation_run_id,
    variant: row.variant,
    revision: row.revision,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class D1MenuRepository implements MenuRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<MenuRecord | null> {
    const result = await this.db
      .prepare(
        `SELECT id, event_id, generation_run_id, variant, revision, status, created_at, updated_at
         FROM menus WHERE id = ?1`,
      )
      .bind(id)
      .all<MenuRow>();
    const row = firstOrNull(result);
    return row ? mapMenu(row) : null;
  }

  async select(menuId: string, eventId: string): Promise<void> {
    const timestamp = nowIso();
    await this.db.batch([
      this.db
        .prepare(
          `UPDATE menus SET status = 'superseded', updated_at = ?1
           WHERE event_id = ?2 AND status = 'selected' AND id <> ?3`,
        )
        .bind(timestamp, eventId, menuId),
      this.db
        .prepare(
          `UPDATE menus SET status = 'selected', updated_at = ?1
           WHERE id = ?2 AND event_id = ?3`,
        )
        .bind(timestamp, menuId, eventId),
    ]);
  }
}

