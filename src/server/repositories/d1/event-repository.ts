import type {
  CreateEventInput,
  CreateGenerationSnapshotInput,
  EventRecord,
  EventRepository,
} from '@/server/repositories/contracts';

import { firstOrNull, newId, nowIso } from './helpers';

interface EventRow {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  guest_count: number;
  dish_count: number;
  serving_style: 'family' | 'plated' | 'buffet';
  filter_revision: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    title: row.title,
    guestCount: row.guest_count,
    dishCount: row.dish_count,
    servingStyle: row.serving_style,
    filterRevision: row.filter_revision,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class D1EventRepository implements EventRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<EventRecord | null> {
    const result = await this.db
      .prepare(
        `SELECT id, owner_user_id, title, guest_count, dish_count, serving_style,
                filter_revision, status, created_at, updated_at
         FROM events WHERE id = ?1`,
      )
      .bind(id)
      .all<EventRow>();
    const row = firstOrNull(result);
    return row ? mapEvent(row) : null;
  }

  async create(input: CreateEventInput): Promise<EventRecord> {
    const id = newId('evt');
    const timestamp = nowIso();
    const guestCount = input.guestCount ?? 6;
    const dishCount = input.dishCount ?? 4;
    const servingStyle = input.servingStyle ?? 'family';

    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO events (
            id, owner_user_id, title, guest_count, dish_count, serving_style, created_at, updated_at
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)`,
        )
        .bind(
          id,
          input.ownerUserId ?? null,
          input.title ?? null,
          guestCount,
          dishCount,
          servingStyle,
          timestamp,
        ),
      this.db
        .prepare(
          `INSERT INTO event_constraints (
            event_id, hard_constraints_json, preferences_json, equipment_json,
            health_preferences_json, updated_at
          ) VALUES (?1, '{}', '{}', '{}', '{}', ?2)`,
        )
        .bind(id, timestamp),
    ]);

    return {
      id,
      ownerUserId: input.ownerUserId ?? null,
      title: input.title ?? null,
      guestCount,
      dishCount,
      servingStyle,
      filterRevision: 1,
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async createGenerationSnapshot(input: CreateGenerationSnapshotInput): Promise<string> {
    const id = newId('gen');
    await this.db
      .prepare(
        `INSERT INTO generation_runs (
          id, event_id, filter_revision, ruleset_version, input_snapshot_json,
          eligible_recipe_count, status, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, 0, 'queued', ?6)`,
      )
      .bind(
        id,
        input.eventId,
        input.filterRevision,
        input.rulesetVersion,
        JSON.stringify(input.input),
        nowIso(),
      )
      .run();
    return id;
  }
}
