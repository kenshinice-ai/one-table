import type { PlannerRecipe } from './catalogue';

export type ShareCardDish = {
  title: string;
  role: string;
  minutes: number;
  kcal: number;
  price: string;
  imageUrl: string;
};

export type ShareCardInput = {
  brand: string;
  tagline: string;
  headline: string;
  dishes: ShareCardDish[];
  totals: Array<{ label: string; value: string }>;
  footer: string;
};

const WIDTH = 1080;
const LIST_TOP = 258;
const ROW_HEIGHT = 142;
const ROW_GAP = 14;
const FOOTER_HEIGHT = 260;
const MAX_DISHES = 8;

/** The card grows with the menu rather than leaving a short table floating in space. */
function cardHeight(dishCount: number) {
  return LIST_TOP + dishCount * (ROW_HEIGHT + ROW_GAP) + FOOTER_HEIGHT;
}

const PALETTE = {
  paper: '#fffaf2',
  card: '#fffdf9',
  ink: '#343535',
  muted: '#77746d',
  line: '#e8ded1',
  terracotta: '#d96b45',
  sage: '#5a947e',
};

const SANS = '"PingFang SC", "Noto Sans SC", -apple-system, system-ui, sans-serif';
const SERIF = '"Songti SC", "Noto Serif SC", Georgia, serif';

function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    // Same-origin artwork keeps the canvas untainted, which is what lets the
    // finished card be exported as a file at all.
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

/** Draws `image` to fill the box without distorting it. */
function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function truncate(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && context.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

function drawTableMark(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  context.strokeStyle = PALETTE.terracotta;
  context.lineWidth = radius * 0.16;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = PALETTE.terracotta;
  context.beginPath();
  context.arc(cx, cy, radius * 0.34, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = PALETTE.sage;
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
    context.beginPath();
    context.arc(
      cx + Math.cos(angle) * radius * 0.76,
      cy + Math.sin(angle) * radius * 0.76,
      radius * 0.13,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}

/**
 * Renders the menu as a portrait card that can be saved to the camera roll or
 * dropped into a chat. Everything is drawn directly to a canvas so the export
 * needs no screenshot permission, no server and no third-party library.
 */
export async function renderShareCard(input: ShareCardInput): Promise<Blob | null> {
  const visible = input.dishes.slice(0, MAX_DISHES);
  const height = cardHeight(visible.length);
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = PALETTE.paper;
  context.fillRect(0, 0, WIDTH, height);
  context.fillStyle = 'rgba(240, 198, 107, 0.16)';
  context.beginPath();
  context.arc(WIDTH - 60, 40, 320, 0, Math.PI * 2);
  context.fill();

  drawTableMark(context, 96, 108, 40);

  context.textBaseline = 'alphabetic';
  context.fillStyle = PALETTE.ink;
  context.font = `700 54px ${SERIF}`;
  context.fillText(input.brand, 160, 100);
  context.fillStyle = PALETTE.muted;
  context.font = `400 24px ${SANS}`;
  context.fillText(input.tagline, 162, 138);

  context.fillStyle = PALETTE.terracotta;
  context.font = `700 28px ${SANS}`;
  context.fillText(input.headline, 96, 216);

  const images = await Promise.all(visible.map((dish) => loadImage(dish.imageUrl)));

  const cardWidth = WIDTH - 192;

  visible.forEach((dish, index) => {
    const y = LIST_TOP + index * (ROW_HEIGHT + ROW_GAP);
    context.fillStyle = PALETTE.card;
    roundedRect(context, 96, y, cardWidth, ROW_HEIGHT, 22);
    context.fill();
    context.strokeStyle = PALETTE.line;
    context.lineWidth = 2;
    context.stroke();

    const thumbSize = ROW_HEIGHT - 28;
    context.save();
    roundedRect(context, 110, y + 14, thumbSize, thumbSize, 16);
    context.clip();
    const image = images[index];
    if (image) {
      drawCover(context, image, 110, y + 14, thumbSize, thumbSize);
    } else {
      context.fillStyle = '#f7f4ed';
      context.fillRect(110, y + 14, thumbSize, thumbSize);
    }
    context.restore();

    const textLeft = 110 + thumbSize + 24;
    const textRight = 96 + cardWidth - 28;
    context.fillStyle = PALETTE.terracotta;
    context.font = `700 20px ${SANS}`;
    context.fillText(dish.role.toUpperCase(), textLeft, y + 44);

    context.fillStyle = PALETTE.ink;
    context.font = `700 34px ${SERIF}`;
    const priceWidth = 110;
    context.fillText(
      truncate(context, dish.title, textRight - textLeft - priceWidth),
      textLeft,
      y + 86,
    );

    context.fillStyle = PALETTE.muted;
    context.font = `400 22px ${SANS}`;
    context.fillText(`${dish.minutes} min · ≈ ${dish.kcal} kcal`, textLeft, y + 120);

    context.fillStyle = PALETTE.ink;
    context.font = `700 26px ${SANS}`;
    context.textAlign = 'right';
    context.fillText(dish.price, textRight, y + 86);
    context.textAlign = 'left';
  });

  const totalsTop = LIST_TOP + visible.length * (ROW_HEIGHT + ROW_GAP) + 18;
  context.strokeStyle = PALETTE.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(96, totalsTop);
  context.lineTo(WIDTH - 96, totalsTop);
  context.stroke();

  const columnWidth = (WIDTH - 192) / Math.max(input.totals.length, 1);
  input.totals.forEach((total, index) => {
    const x = 96 + index * columnWidth;
    context.fillStyle = PALETTE.muted;
    context.font = `400 22px ${SANS}`;
    context.fillText(total.label, x, totalsTop + 44);
    context.fillStyle = PALETTE.ink;
    context.font = `700 40px ${SERIF}`;
    context.fillText(total.value, x, totalsTop + 92);
  });

  context.fillStyle = PALETTE.muted;
  context.font = `400 20px ${SANS}`;
  context.fillText(input.footer, 96, height - 52);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95));
}

export function shareCardDishes(
  recipes: PlannerRecipe[],
  locale: 'zh-CN' | 'en-AU',
  roleLabelFor: (role: string) => string,
  currency: Intl.NumberFormat,
): ShareCardDish[] {
  return recipes.map((recipe) => ({
    title: recipe.translations[locale].title,
    role: roleLabelFor(recipe.primaryRole),
    minutes: recipe.totalMinutes,
    kcal: recipe.nutrition.energyKcal,
    price: currency.format(recipe.cost.totalCents / 100),
    imageUrl: `/media/${recipe.slug}-640.webp`,
  }));
}

/* ------------------------------------------------------------------ *
 * Single-recipe card
 * ------------------------------------------------------------------ */

const RECIPE_CARD_WIDTH = 1080;
const RECIPE_CARD_HEIGHT = 1440;
/** The photo occupies the short side of the golden section. */
const PHOTO_HEIGHT = Math.round(RECIPE_CARD_HEIGHT * 0.382);

export type RecipeCardInput = {
  brand: string;
  tagline: string;
  title: string;
  role: string;
  summary: string;
  facts: string[];
  ingredientsHeading: string;
  ingredients: Array<{ name: string; amount: string }>;
  /** Rendered when the ingredient list is longer than the card can show. */
  moreIngredients: string | null;
  stepsHeading: string;
  steps: string[];
  imageUrl: string | null;
  footer: string;
};

/**
 * Stands in for a photograph that has not been produced yet. A grey "coming
 * soon" plate is honest inside the app, but a card is something a reader sends
 * to other people, so the placeholder is drawn as brand pattern instead — it
 * reads as a design choice rather than a missing asset.
 */
function drawPhotoPlaceholder(context: CanvasRenderingContext2D, height: number) {
  context.fillStyle = '#f6ece2';
  context.fillRect(0, 0, RECIPE_CARD_WIDTH, height);
  context.save();
  context.globalAlpha = 0.5;
  for (let row = -1; row < 6; row += 1) {
    for (let column = -1; column < 8; column += 1) {
      const x = column * 160 + (row % 2 ? 80 : 0);
      const y = row * 120;
      context.strokeStyle = row % 2 ? PALETTE.sage : PALETTE.terracotta;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x + 80, y + 60, 34, 0, Math.PI * 2);
      context.stroke();
    }
  }
  context.restore();
  drawTableMark(context, RECIPE_CARD_WIDTH / 2, height / 2, 74);
}

function wrapLine(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  return truncate(context, text, maxWidth);
}

/**
 * Renders one recipe as a portrait card. The menu card answers "what are we
 * eating"; this one answers "send me that recipe", which is the smaller and
 * more frequent share.
 */
export async function renderRecipeCard(input: RecipeCardInput): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = RECIPE_CARD_WIDTH;
  canvas.height = RECIPE_CARD_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = PALETTE.paper;
  context.fillRect(0, 0, RECIPE_CARD_WIDTH, RECIPE_CARD_HEIGHT);

  const photo = input.imageUrl ? await loadImage(input.imageUrl) : null;
  if (photo) {
    context.save();
    context.beginPath();
    context.rect(0, 0, RECIPE_CARD_WIDTH, PHOTO_HEIGHT);
    context.clip();
    drawCover(context, photo, 0, 0, RECIPE_CARD_WIDTH, PHOTO_HEIGHT);
    context.restore();
  } else {
    drawPhotoPlaceholder(context, PHOTO_HEIGHT);
  }

  const margin = 88;
  const contentWidth = RECIPE_CARD_WIDTH - margin * 2;
  let y = PHOTO_HEIGHT + 78;

  context.textBaseline = 'alphabetic';
  context.fillStyle = PALETTE.terracotta;
  context.font = `700 24px ${SANS}`;
  context.fillText(input.role.toUpperCase(), margin, y);

  y += 58;
  context.fillStyle = PALETTE.ink;
  context.font = `700 58px ${SERIF}`;
  context.fillText(wrapLine(context, input.title, contentWidth), margin, y);

  y += 44;
  context.fillStyle = PALETTE.muted;
  context.font = `400 24px ${SANS}`;
  context.fillText(wrapLine(context, input.summary, contentWidth), margin, y);

  y += 46;
  context.fillStyle = PALETTE.sage;
  context.font = `700 24px ${SANS}`;
  context.fillText(input.facts.join('   ·   '), margin, y);

  y += 30;
  context.strokeStyle = PALETTE.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(margin, y);
  context.lineTo(RECIPE_CARD_WIDTH - margin, y);
  context.stroke();

  y += 48;
  context.fillStyle = PALETTE.muted;
  context.font = `700 22px ${SANS}`;
  context.fillText(input.ingredientsHeading.toUpperCase(), margin, y);

  y += 38;
  const amountColumn = RECIPE_CARD_WIDTH - margin;
  input.ingredients.forEach((ingredient) => {
    context.fillStyle = PALETTE.ink;
    context.font = `400 27px ${SANS}`;
    context.fillText(wrapLine(context, ingredient.name, contentWidth - 220), margin, y);
    context.font = `700 27px ${SANS}`;
    context.textAlign = 'right';
    context.fillText(ingredient.amount, amountColumn, y);
    context.textAlign = 'left';
    y += 40;
  });

  if (input.moreIngredients) {
    context.fillStyle = PALETTE.muted;
    context.font = `400 24px ${SANS}`;
    context.fillText(input.moreIngredients, margin, y);
    y += 40;
  }

  y += 26;
  context.fillStyle = PALETTE.muted;
  context.font = `700 22px ${SANS}`;
  context.fillText(input.stepsHeading.toUpperCase(), margin, y);

  y += 40;
  input.steps.forEach((step, index) => {
    context.fillStyle = PALETTE.terracotta;
    context.font = `700 24px ${SANS}`;
    context.fillText(String(index + 1).padStart(2, '0'), margin, y);
    context.fillStyle = PALETTE.ink;
    context.font = `400 25px ${SANS}`;
    context.fillText(wrapLine(context, step, contentWidth - 56), margin + 56, y);
    y += 42;
  });

  drawTableMark(context, margin + 22, RECIPE_CARD_HEIGHT - 76, 22);
  context.fillStyle = PALETTE.ink;
  context.font = `700 30px ${SERIF}`;
  context.fillText(input.brand, margin + 60, RECIPE_CARD_HEIGHT - 78);
  context.fillStyle = PALETTE.muted;
  context.font = `400 20px ${SANS}`;
  context.fillText(input.tagline, margin + 60, RECIPE_CARD_HEIGHT - 52);
  context.textAlign = 'right';
  context.fillText(input.footer, RECIPE_CARD_WIDTH - margin, RECIPE_CARD_HEIGHT - 52);
  context.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95));
}

/** How many ingredient rows fit on a card before it starts to crowd. */
export const RECIPE_CARD_INGREDIENT_LIMIT = 8;
/** How many steps a card shows; the rest belong in the app or the printout. */
export const RECIPE_CARD_STEP_LIMIT = 4;

/**
 * Assembles the card's content from what the dialog is showing. Kept separate
 * from the drawing so the truncation rules can be tested without a canvas.
 */
export function buildRecipeCardInput({
  title,
  summary,
  role,
  facts,
  ingredients,
  steps,
  ingredientsHeading,
  stepsHeading,
  brand,
  tagline,
  footer,
  moreIngredientsLabel,
  imageUrl,
}: {
  title: string;
  summary: string;
  role: string;
  facts: string[];
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  ingredientsHeading: string;
  stepsHeading: string;
  brand: string;
  tagline: string;
  footer: string;
  /** Receives the number of ingredients that did not fit. */
  moreIngredientsLabel: (count: number) => string;
  imageUrl: string | null;
}): RecipeCardInput {
  const shown = ingredients.slice(0, RECIPE_CARD_INGREDIENT_LIMIT);
  const hidden = ingredients.length - shown.length;
  return {
    brand,
    tagline,
    title,
    role,
    summary,
    facts,
    ingredientsHeading,
    ingredients: shown,
    moreIngredients: hidden > 0 ? moreIngredientsLabel(hidden) : null,
    stepsHeading,
    steps: steps.slice(0, RECIPE_CARD_STEP_LIMIT),
    imageUrl,
    footer,
  };
}

/** Recipes whose artwork has not been produced keep the card's brand pattern. */
export function recipeHasArtwork(objectKey: string) {
  return objectKey.startsWith('media/');
}
