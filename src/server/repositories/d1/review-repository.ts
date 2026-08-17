import type {
  CreateReviewInput,
  ReviewRecord,
  ReviewRepository,
} from '@/server/repositories/contracts';

import { newId, nowIso } from './helpers';

interface ReviewRow {
  id: string;
  recipe_id: string;
  review_type: CreateReviewInput['reviewType'];
  outcome: CreateReviewInput['outcome'];
  reviewer_user_id: string;
  notes: string | null;
  reviewed_at: string;
}

function mapReview(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    reviewType: row.review_type,
    outcome: row.outcome,
    reviewerUserId: row.reviewer_user_id,
    notes: row.notes ?? undefined,
    reviewedAt: row.reviewed_at,
  };
}

export class D1ReviewRepository implements ReviewRepository {
  constructor(private readonly db: D1Database) {}

  async create(input: CreateReviewInput): Promise<ReviewRecord> {
    const record: ReviewRecord = {
      ...input,
      id: newId('rev'),
      reviewedAt: nowIso(),
    };
    await this.db
      .prepare(
        `INSERT INTO recipe_reviews (
          id, recipe_id, review_type, outcome, reviewer_user_id, notes, reviewed_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(
        record.id,
        record.recipeId,
        record.reviewType,
        record.outcome,
        record.reviewerUserId,
        record.notes ?? null,
        record.reviewedAt,
      )
      .run();
    return record;
  }

  async listForRecipe(recipeId: string): Promise<ReviewRecord[]> {
    const result = await this.db
      .prepare(
        `SELECT id, recipe_id, review_type, outcome, reviewer_user_id, notes, reviewed_at
         FROM recipe_reviews WHERE recipe_id = ?1 ORDER BY reviewed_at DESC`,
      )
      .bind(recipeId)
      .all<ReviewRow>();
    return result.results.map(mapReview);
  }
}

