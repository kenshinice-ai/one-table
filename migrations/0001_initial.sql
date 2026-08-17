-- Cloudflare D1 / SQLite schema for Menu Planning Companion.
-- IDs are application-generated ULIDs. Timestamps are ISO-8601 UTC strings.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email_normalized TEXT UNIQUE,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'zh-CN' CHECK (locale IN ('zh-CN', 'en-AU')),
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'us')),
  currency TEXT NOT NULL DEFAULT 'AUD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE auth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('email_magic_link', 'apple')),
  provider_subject TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(provider, provider_subject)
);

CREATE TABLE preference_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  preferences_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(preferences_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE allergens (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  fsanz_declaration_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE diet_tags (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  rule_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(rule_json)),
  is_medical INTEGER NOT NULL DEFAULT 0 CHECK (is_medical IN (0, 1))
);

CREATE TABLE profile_allergens (
  profile_id TEXT NOT NULL REFERENCES preference_profiles(id) ON DELETE CASCADE,
  allergen_id TEXT NOT NULL REFERENCES allergens(id),
  response TEXT NOT NULL CHECK (response IN ('avoid', 'may_contain_ok', 'unknown')),
  note TEXT,
  PRIMARY KEY (profile_id, allergen_id)
);

CREATE TABLE profile_diet_tags (
  profile_id TEXT NOT NULL REFERENCES preference_profiles(id) ON DELETE CASCADE,
  diet_tag_id TEXT NOT NULL REFERENCES diet_tags(id),
  PRIMARY KEY (profile_id, diet_tag_id)
);

CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  canonical_name_en TEXT NOT NULL,
  canonical_name_zh TEXT NOT NULL,
  category TEXT NOT NULL,
  default_unit TEXT NOT NULL CHECK (default_unit IN ('g', 'ml', 'count')),
  density_g_per_ml REAL,
  grams_per_count REAL,
  parent_ingredient_id TEXT REFERENCES ingredients(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'review', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE ingredient_aliases (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('zh-CN', 'en-AU')),
  alias TEXT NOT NULL,
  UNIQUE(locale, alias)
);

CREATE TABLE ingredient_components (
  parent_ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  child_ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  proportion REAL CHECK (proportion IS NULL OR (proportion >= 0 AND proportion <= 1)),
  PRIMARY KEY (parent_ingredient_id, child_ingredient_id)
);

CREATE TABLE ingredient_allergens (
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  allergen_id TEXT NOT NULL REFERENCES allergens(id),
  presence TEXT NOT NULL CHECK (presence IN ('contains', 'derived_from', 'may_contain', 'unknown')),
  evidence_source_id TEXT,
  reviewed_at TEXT,
  PRIMARY KEY (ingredient_id, allergen_id)
);

CREATE TABLE cuisines (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  parent_id TEXT REFERENCES cuisines(id),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE cooking_methods (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  capacity_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(capacity_json))
);

CREATE TABLE recipe_roles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  primary_role_id TEXT NOT NULL REFERENCES recipe_roles(id),
  base_servings REAL NOT NULL DEFAULT 4 CHECK (base_servings > 0),
  active_minutes INTEGER NOT NULL CHECK (active_minutes >= 0),
  total_minutes INTEGER NOT NULL CHECK (total_minutes >= active_minutes),
  advance_minutes INTEGER NOT NULL DEFAULT 0 CHECK (advance_minutes >= 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  spice_level INTEGER NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 5),
  hold_quality INTEGER NOT NULL DEFAULT 3 CHECK (hold_quality BETWEEN 1 AND 5),
  reheating_quality INTEGER NOT NULL DEFAULT 3 CHECK (reheating_quality BETWEEN 1 AND 5),
  child_friendly INTEGER NOT NULL DEFAULT 0 CHECK (child_friendly IN (0, 1)),
  kitchen_test_status TEXT NOT NULL DEFAULT 'not_tested' CHECK (kitchen_test_status IN ('not_tested', 'editor_tested', 'kitchen_tested')),
  scaling_notes_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(scaling_notes_json)),
  safety_notes TEXT,
  created_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE recipe_translations (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('zh-CN', 'en-AU')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  serving_note TEXT,
  instructions_json TEXT NOT NULL CHECK (json_valid(instructions_json)),
  ai_assisted INTEGER NOT NULL DEFAULT 0 CHECK (ai_assisted IN (0, 1)),
  reviewed_by_user_id TEXT REFERENCES users(id),
  reviewed_at TEXT,
  PRIMARY KEY (recipe_id, locale)
);

CREATE TABLE recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  sequence INTEGER NOT NULL,
  normalized_quantity REAL,
  normalized_unit TEXT CHECK (normalized_unit IS NULL OR normalized_unit IN ('g', 'ml', 'count')),
  display_quantity TEXT NOT NULL,
  preparation_note_en TEXT,
  preparation_note_zh TEXT,
  optional INTEGER NOT NULL DEFAULT 0 CHECK (optional IN (0, 1)),
  scaling_strategy TEXT NOT NULL DEFAULT 'linear' CHECK (scaling_strategy IN ('linear', 'rounded', 'constant', 'manual')),
  substitution_group TEXT,
  UNIQUE(recipe_id, sequence)
);

CREATE TABLE recipe_roles_map (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES recipe_roles(id),
  suitability_score INTEGER NOT NULL DEFAULT 100 CHECK (suitability_score BETWEEN 0 AND 100),
  PRIMARY KEY (recipe_id, role_id)
);

CREATE TABLE recipe_cuisines (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cuisine_id TEXT NOT NULL REFERENCES cuisines(id),
  weight INTEGER NOT NULL DEFAULT 100 CHECK (weight BETWEEN 1 AND 100),
  PRIMARY KEY (recipe_id, cuisine_id)
);

CREATE TABLE recipe_methods (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  method_id TEXT NOT NULL REFERENCES cooking_methods(id),
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (recipe_id, method_id)
);

CREATE TABLE recipe_equipment (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL REFERENCES equipment(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  occupied_minutes INTEGER NOT NULL DEFAULT 0 CHECK (occupied_minutes >= 0),
  required INTEGER NOT NULL DEFAULT 1 CHECK (required IN (0, 1)),
  PRIMARY KEY (recipe_id, equipment_id)
);

CREATE TABLE recipe_serving_styles (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  serving_style TEXT NOT NULL CHECK (serving_style IN ('family', 'plated', 'buffet')),
  suitability_score INTEGER NOT NULL DEFAULT 100 CHECK (suitability_score BETWEEN 0 AND 100),
  PRIMARY KEY (recipe_id, serving_style)
);

CREATE TABLE recipe_diet_tags (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  diet_tag_id TEXT NOT NULL REFERENCES diet_tags(id),
  verification TEXT NOT NULL CHECK (verification IN ('computed', 'reviewed', 'unknown')),
  PRIMARY KEY (recipe_id, diet_tag_id)
);

CREATE TABLE recipe_nutrition_snapshots (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_version TEXT,
  per_serving_energy_kj INTEGER,
  per_serving_energy_kcal INTEGER,
  protein_g REAL,
  fat_g REAL,
  saturated_fat_g REAL,
  carbohydrate_g REAL,
  sugars_g REAL,
  fibre_g REAL,
  sodium_mg REAL,
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  calculated_at TEXT NOT NULL,
  reviewed_at TEXT,
  UNIQUE(recipe_id, source_name, calculated_at)
);

CREATE TABLE ingredient_price_snapshots (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  region_code TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  cents_per_base_unit INTEGER NOT NULL CHECK (cents_per_base_unit >= 0),
  base_unit TEXT NOT NULL CHECK (base_unit IN ('100g', '100ml', 'count')),
  source_name TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100)
);

CREATE TABLE recipe_cost_snapshots (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  per_serving_cents INTEGER NOT NULL CHECK (per_serving_cents >= 0),
  pantry_policy TEXT NOT NULL CHECK (pantry_policy IN ('include_all', 'exclude_staples')),
  price_version TEXT NOT NULL,
  calculated_at TEXT NOT NULL,
  UNIQUE(recipe_id, region_code, pantry_policy, price_version)
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL CHECK (media_type IN ('original_photo', 'licensed_photo', 'ai_illustration')),
  subject_type TEXT NOT NULL CHECK (subject_type IN ('recipe', 'ingredient', 'other')),
  mime_type TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  alt_en TEXT NOT NULL,
  alt_zh TEXT NOT NULL,
  source_url TEXT,
  license_code TEXT,
  attribution TEXT,
  ai_model TEXT,
  ai_prompt TEXT,
  generated_at TEXT,
  rights_reviewed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE recipe_media (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (recipe_id, media_id)
);

CREATE TABLE content_sources (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('original', 'licensed', 'api', 'public_domain', 'user_private')),
  provider_name TEXT NOT NULL,
  source_url TEXT,
  external_id TEXT,
  license_code TEXT,
  attribution_required INTEGER NOT NULL DEFAULT 0 CHECK (attribution_required IN (0, 1)),
  caching_allowed INTEGER NOT NULL DEFAULT 0 CHECK (caching_allowed IN (0, 1)),
  terms_checked_at TEXT,
  retrieved_at TEXT NOT NULL
);

CREATE TABLE recipe_sources (
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES content_sources(id),
  relationship TEXT NOT NULL CHECK (relationship IN ('original', 'adapted', 'inspired', 'nutrition_only', 'image_only')),
  PRIMARY KEY (recipe_id, source_id)
);

CREATE TABLE recipe_versions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
  change_summary TEXT NOT NULL,
  created_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  UNIQUE(recipe_id, version_number)
);

CREATE TABLE recipe_reviews (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('content', 'allergen', 'nutrition', 'rights', 'translation', 'kitchen_test')),
  outcome TEXT NOT NULL CHECK (outcome IN ('approved', 'changes_requested', 'rejected')),
  reviewer_user_id TEXT NOT NULL REFERENCES users(id),
  notes TEXT,
  reviewed_at TEXT NOT NULL
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  event_date TEXT,
  meal_time TEXT,
  guest_count INTEGER NOT NULL DEFAULT 6 CHECK (guest_count BETWEEN 1 AND 30),
  dish_count INTEGER NOT NULL DEFAULT 4 CHECK (dish_count BETWEEN 1 AND 10),
  serving_style TEXT NOT NULL DEFAULT 'family' CHECK (serving_style IN ('family', 'plated', 'buffet')),
  budget_total_cents INTEGER CHECK (budget_total_cents IS NULL OR budget_total_cents >= 0),
  budget_tolerance_bps INTEGER NOT NULL DEFAULT 1000 CHECK (budget_tolerance_bps BETWEEN 0 AND 5000),
  currency TEXT NOT NULL DEFAULT 'AUD',
  pantry_policy TEXT NOT NULL DEFAULT 'exclude_staples' CHECK (pantry_policy IN ('include_all', 'exclude_staples')),
  locale TEXT NOT NULL DEFAULT 'zh-CN' CHECK (locale IN ('zh-CN', 'en-AU')),
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'us')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  filter_revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE event_constraints (
  event_id TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  hard_constraints_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(hard_constraints_json)),
  preferences_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(preferences_json)),
  equipment_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(equipment_json)),
  health_preferences_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(health_preferences_json)),
  updated_at TEXT NOT NULL
);

CREATE TABLE event_allergens (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  allergen_id TEXT NOT NULL REFERENCES allergens(id),
  source TEXT NOT NULL CHECK (source IN ('organizer', 'guest', 'profile')),
  PRIMARY KEY (event_id, allergen_id, source)
);

CREATE TABLE event_guests (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  display_name TEXT,
  attendance TEXT NOT NULL DEFAULT 'unknown' CHECK (attendance IN ('unknown', 'yes', 'no', 'maybe')),
  response_token_hash TEXT NOT NULL UNIQUE,
  preferences_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(preferences_json)),
  responded_at TEXT,
  delete_after TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE guest_allergens (
  guest_id TEXT NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  allergen_id TEXT NOT NULL REFERENCES allergens(id),
  response TEXT NOT NULL CHECK (response IN ('avoid', 'may_contain_ok', 'unknown')),
  note TEXT,
  PRIMARY KEY (guest_id, allergen_id)
);

CREATE TABLE guest_diet_tags (
  guest_id TEXT NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  diet_tag_id TEXT NOT NULL REFERENCES diet_tags(id),
  PRIMARY KEY (guest_id, diet_tag_id)
);

CREATE TABLE generation_runs (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filter_revision INTEGER NOT NULL,
  ruleset_version TEXT NOT NULL,
  input_snapshot_json TEXT NOT NULL CHECK (json_valid(input_snapshot_json)),
  eligible_recipe_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  failure_code TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE menus (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  generation_run_id TEXT REFERENCES generation_runs(id),
  variant TEXT NOT NULL CHECK (variant IN ('balanced', 'budget', 'easy', 'custom')),
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'selected', 'superseded', 'archived')),
  total_cost_cents INTEGER,
  per_person_cost_cents INTEGER,
  total_energy_kj_per_person INTEGER,
  total_energy_kcal_per_person INTEGER,
  safety_status TEXT NOT NULL DEFAULT 'unknown' CHECK (safety_status IN ('pass', 'warning', 'fail', 'unknown')),
  explanation_status TEXT NOT NULL DEFAULT 'pending' CHECK (explanation_status IN ('pending', 'ready', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(event_id, revision, variant)
);

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  role_id TEXT NOT NULL REFERENCES recipe_roles(id),
  course_order INTEGER NOT NULL,
  scaled_servings REAL NOT NULL CHECK (scaled_servings > 0),
  cost_cents INTEGER,
  substitution_reason TEXT,
  UNIQUE(menu_id, course_order)
);

CREATE TABLE menu_scores (
  menu_id TEXT PRIMARY KEY REFERENCES menus(id) ON DELETE CASCADE,
  preference_score INTEGER NOT NULL CHECK (preference_score BETWEEN 0 AND 100),
  feasibility_score INTEGER NOT NULL CHECK (feasibility_score BETWEEN 0 AND 100),
  budget_score INTEGER NOT NULL CHECK (budget_score BETWEEN 0 AND 100),
  nutrition_score INTEGER NOT NULL CHECK (nutrition_score BETWEEN 0 AND 100),
  variety_score INTEGER NOT NULL CHECK (variety_score BETWEEN 0 AND 100),
  balance_score INTEGER NOT NULL CHECK (balance_score BETWEEN 0 AND 100),
  score_breakdown_json TEXT NOT NULL CHECK (json_valid(score_breakdown_json)),
  ruleset_version TEXT NOT NULL
);

CREATE TABLE ai_runs (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  menu_id TEXT REFERENCES menus(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('explain_menu', 'suggest_substitution', 'translate_draft', 'normalize_import')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_json TEXT CHECK (output_json IS NULL OR json_valid(output_json)),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'failed', 'rejected')),
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE share_links (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  menu_id TEXT REFERENCES menus(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('guest_preferences', 'menu_view')),
  token_hash TEXT NOT NULL UNIQUE,
  permission TEXT NOT NULL CHECK (permission IN ('submit_only', 'view_only', 'view_and_download')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE exports (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('host_pdf', 'guest_pdf', 'bilingual_pdf')),
  locale TEXT NOT NULL CHECK (locale IN ('zh-CN', 'en-AU', 'bilingual')),
  object_key TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'rendering', 'ready', 'failed')),
  source_revision INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT CHECK (before_json IS NULL OR json_valid(before_json)),
  after_json TEXT CHECK (after_json IS NULL OR json_valid(after_json)),
  created_at TEXT NOT NULL
);

CREATE INDEX idx_recipes_status_role ON recipes(status, primary_role_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id, sequence);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_ingredient_allergens_allergen ON ingredient_allergens(allergen_id, presence);
CREATE INDEX idx_price_region_date ON ingredient_price_snapshots(region_code, observed_at);
CREATE INDEX idx_events_owner_updated ON events(owner_user_id, updated_at);
CREATE INDEX idx_guests_event ON event_guests(event_id);
CREATE INDEX idx_generation_event_created ON generation_runs(event_id, created_at);
CREATE INDEX idx_menus_event_status ON menus(event_id, status);
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id, course_order);
CREATE INDEX idx_share_event ON share_links(event_id, purpose);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id, created_at);

CREATE VIRTUAL TABLE recipe_search_fts USING fts5(
  recipe_id UNINDEXED,
  locale UNINDEXED,
  title,
  summary,
  ingredient_terms,
  cuisine_terms,
  tokenize = 'unicode61 remove_diacritics 2'
);
