import type { Locale, RecipeRecord, RecipeSummary, ServingStyle } from '@/domain';
import type { RecipeRepository } from '@/server/repositories/contracts';

import { firstOrNull, newId, nowIso } from './helpers';

interface SummaryRow {
  id: string;
  slug: string;
  status: RecipeSummary['status'];
  title: string;
  summary: string;
  primary_role_code: string;
  active_minutes: number;
  total_minutes: number;
  difficulty: RecipeSummary['difficulty'];
  spice_level: number;
}

interface DetailRow extends SummaryRow {
  base_servings: number;
  advance_minutes: number;
  child_friendly: number;
  instructions_json: string;
}

interface IngredientRow {
  id: string;
  canonical_name: string;
  normalized_quantity: number | null;
  normalized_unit: 'g' | 'ml' | 'count' | null;
  display_quantity: string;
  optional: number;
  scaling_strategy: RecipeRecord['ingredients'][number]['scalingStrategy'];
}

interface ServingStyleRow {
  serving_style: ServingStyle;
  suitability_score: number;
}

function mapSummary(row: SummaryRow): RecipeSummary {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    summary: row.summary,
    primaryRoleCode: row.primary_role_code,
    activeMinutes: row.active_minutes,
    totalMinutes: row.total_minutes,
    difficulty: row.difficulty,
    spiceLevel: row.spice_level,
  };
}

export class D1RecipeRepository implements RecipeRepository {
  constructor(private readonly db: D1Database) {}

  async listPublished(locale: Locale, limit = 24): Promise<RecipeSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT r.id, r.slug, r.status, t.title, t.summary, rr.code AS primary_role_code,
                r.active_minutes, r.total_minutes, r.difficulty, r.spice_level
         FROM recipes r
         JOIN recipe_translations t ON t.recipe_id = r.id AND t.locale = ?1
         JOIN recipe_roles rr ON rr.id = r.primary_role_id
         WHERE r.status = 'published'
         ORDER BY r.published_at DESC, r.slug
         LIMIT ?2`,
      )
      .bind(locale, limit)
      .all<SummaryRow>();
    return result.results.map(mapSummary);
  }

  async searchPublished(query: string, locale: Locale, limit = 24): Promise<RecipeSummary[]> {
    const result = await this.db
      .prepare(
        `SELECT r.id, r.slug, r.status, t.title, t.summary, rr.code AS primary_role_code,
                r.active_minutes, r.total_minutes, r.difficulty, r.spice_level
         FROM recipe_search_fts f
         JOIN recipes r ON r.id = f.recipe_id AND r.status = 'published'
         JOIN recipe_translations t ON t.recipe_id = r.id AND t.locale = ?1
         WHERE f.locale = ?1 AND recipe_search_fts MATCH ?2
         ORDER BY bm25(recipe_search_fts)
         LIMIT ?3`,
      )
      .bind(locale, query, limit)
      .all<SummaryRow>();
    return result.results.map(mapSummary);
  }

  async findById(id: string, locale: Locale): Promise<RecipeRecord | null> {
    const detailResult = await this.db
      .prepare(
        `SELECT r.id, r.slug, r.status, t.title, t.summary, rr.code AS primary_role_code,
                r.active_minutes, r.total_minutes, r.difficulty, r.spice_level,
                r.base_servings, r.advance_minutes, r.child_friendly, t.instructions_json
         FROM recipes r
         JOIN recipe_translations t ON t.recipe_id = r.id AND t.locale = ?2
         JOIN recipe_roles rr ON rr.id = r.primary_role_id
         WHERE r.id = ?1`,
      )
      .bind(id, locale)
      .all<DetailRow>();
    const detail = firstOrNull(detailResult);
    if (!detail) return null;

    const [ingredientResult, servingStyleResult] = await Promise.all([
      this.db
        .prepare(
          `SELECT ri.id, i.canonical_name_en AS canonical_name, ri.normalized_quantity,
                  ri.normalized_unit, ri.display_quantity, ri.optional, ri.scaling_strategy
           FROM recipe_ingredients ri
           JOIN ingredients i ON i.id = ri.ingredient_id
           WHERE ri.recipe_id = ?1
           ORDER BY ri.sequence`,
        )
        .bind(id)
        .all<IngredientRow>(),
      this.db
        .prepare(
          `SELECT serving_style, suitability_score
           FROM recipe_serving_styles WHERE recipe_id = ?1 ORDER BY serving_style`,
        )
        .bind(id)
        .all<ServingStyleRow>(),
    ]);

    return {
      ...mapSummary(detail),
      baseServings: detail.base_servings,
      advanceMinutes: detail.advance_minutes,
      childFriendly: detail.child_friendly === 1,
      instructions: JSON.parse(detail.instructions_json) as string[],
      servingStyles: servingStyleResult.results.map((row) => ({
        style: row.serving_style,
        suitabilityScore: row.suitability_score,
      })),
      ingredients: ingredientResult.results.map((row) => ({
        id: row.id,
        canonicalName: row.canonical_name,
        normalizedQuantity: row.normalized_quantity,
        normalizedUnit: row.normalized_unit,
        displayQuantity: row.display_quantity,
        optional: row.optional === 1,
        scalingStrategy: row.scaling_strategy,
      })),
    };
  }

  async createVersionSnapshot(recipeId: string, changeSummary: string, actorId?: string) {
    const version = await this.db
      .prepare(
        `SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version
         FROM recipe_versions WHERE recipe_id = ?1`,
      )
      .bind(recipeId)
      .first<{ next_version: number }>();
    const snapshot = await this.db
      .prepare(`SELECT * FROM recipes WHERE id = ?1`)
      .bind(recipeId)
      .first<Record<string, unknown>>();
    if (!snapshot) throw new Error(`Recipe not found: ${recipeId}`);

    const id = newId('rv');
    await this.db
      .prepare(
        `INSERT INTO recipe_versions (
          id, recipe_id, version_number, snapshot_json, change_summary, created_by_user_id, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(
        id,
        recipeId,
        version?.next_version ?? 1,
        JSON.stringify(snapshot),
        changeSummary,
        actorId ?? null,
        nowIso(),
      )
      .run();
    return id;
  }

  async publish(recipeId: string, actorId: string, changeSummary: string): Promise<void> {
    const timestamp = nowIso();
    await this.db.batch([
      this.db
        .prepare(
          `UPDATE recipes
           SET status = 'published', published_at = COALESCE(published_at, ?1), updated_at = ?1
           WHERE id = ?2`,
        )
        .bind(timestamp, recipeId),
      this.db
        .prepare(
          `INSERT INTO audit_log (
            id, actor_user_id, entity_type, entity_id, action, after_json, created_at
          ) VALUES (?1, ?2, 'recipe', ?3, 'publish', ?4, ?5)`,
        )
        .bind(
          newId('audit'),
          actorId,
          recipeId,
          JSON.stringify({ status: 'published' }),
          timestamp,
        ),
    ]);
    await this.createVersionSnapshot(recipeId, changeSummary, actorId);
    await this.rebuildSearchIndex();
  }

  async rebuildSearchIndex(): Promise<number> {
    await this.db.prepare(`DELETE FROM recipe_search_fts`).run();
    const result = await this.db
      .prepare(
        `SELECT r.id AS recipe_id, t.locale, t.title, t.summary,
                GROUP_CONCAT(i.canonical_name_en || ' ' || i.canonical_name_zh, ' ') AS ingredient_terms,
                GROUP_CONCAT(c.name_en || ' ' || c.name_zh, ' ') AS cuisine_terms
         FROM recipes r
         JOIN recipe_translations t ON t.recipe_id = r.id
         LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
         LEFT JOIN ingredients i ON i.id = ri.ingredient_id
         LEFT JOIN recipe_cuisines rc ON rc.recipe_id = r.id
         LEFT JOIN cuisines c ON c.id = rc.cuisine_id
         WHERE r.status = 'published'
         GROUP BY r.id, t.locale, t.title, t.summary`,
      )
      .all<{
        recipe_id: string;
        locale: Locale;
        title: string;
        summary: string;
        ingredient_terms: string | null;
        cuisine_terms: string | null;
      }>();

    if (result.results.length === 0) return 0;
    await this.db.batch(
      result.results.map((row) =>
        this.db
          .prepare(
            `INSERT INTO recipe_search_fts (
              recipe_id, locale, title, summary, ingredient_terms, cuisine_terms
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
          )
          .bind(
            row.recipe_id,
            row.locale,
            row.title,
            row.summary,
            row.ingredient_terms ?? '',
            row.cuisine_terms ?? '',
          ),
      ),
    );
    return result.results.length;
  }
}
