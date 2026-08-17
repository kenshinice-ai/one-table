import type { Locale, RecipeRecord, RecipeSummary } from '@/domain';

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  create(input: CreateUserInput): Promise<UserRecord>;
}

export interface RecipeRepository {
  listPublished(locale: Locale, limit?: number): Promise<RecipeSummary[]>;
  searchPublished(query: string, locale: Locale, limit?: number): Promise<RecipeSummary[]>;
  findById(id: string, locale: Locale): Promise<RecipeRecord | null>;
  createVersionSnapshot(recipeId: string, changeSummary: string, actorId?: string): Promise<string>;
  publish(recipeId: string, actorId: string, changeSummary: string): Promise<void>;
  rebuildSearchIndex(): Promise<number>;
}

export interface EventRepository {
  findById(id: string): Promise<EventRecord | null>;
  create(input: CreateEventInput): Promise<EventRecord>;
  createGenerationSnapshot(input: CreateGenerationSnapshotInput): Promise<string>;
}

export interface MenuRepository {
  findById(id: string): Promise<MenuRecord | null>;
  select(menuId: string, eventId: string): Promise<void>;
}

export interface ReviewRepository {
  create(input: CreateReviewInput): Promise<ReviewRecord>;
  listForRecipe(recipeId: string): Promise<ReviewRecord[]>;
}

export interface UserRecord {
  id: string;
  emailNormalized: string | null;
  displayName: string | null;
  locale: Locale;
  unitSystem: 'metric' | 'us';
  status: 'active' | 'disabled' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  emailNormalized?: string;
  displayName?: string;
  locale?: Locale;
  unitSystem?: 'metric' | 'us';
}

export interface EventRecord {
  id: string;
  ownerUserId: string | null;
  title: string | null;
  guestCount: number;
  dishCount: number;
  servingStyle: 'family' | 'plated' | 'buffet';
  filterRevision: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  ownerUserId?: string;
  title?: string;
  guestCount?: number;
  dishCount?: number;
  servingStyle?: 'family' | 'plated' | 'buffet';
}

export interface CreateGenerationSnapshotInput {
  eventId: string;
  filterRevision: number;
  rulesetVersion: string;
  input: unknown;
}

export interface MenuRecord {
  id: string;
  eventId: string;
  generationRunId: string | null;
  variant: 'balanced' | 'budget' | 'easy' | 'custom';
  revision: number;
  status: 'candidate' | 'selected' | 'superseded' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  recipeId: string;
  reviewType: 'content' | 'allergen' | 'nutrition' | 'rights' | 'translation' | 'kitchen_test';
  outcome: 'approved' | 'changes_requested' | 'rejected';
  reviewerUserId: string;
  notes?: string;
}

export interface ReviewRecord extends CreateReviewInput {
  id: string;
  reviewedAt: string;
}
