#!/usr/bin/env bash
# Generates the responsive size ladder for recipe and ingredient artwork.
#
# The Worker serves static assets without an image optimiser, so every size a
# layout can request has to exist on disk. Source art stays at its full size in
# public/media; this writes <slug>-<width>.webp next to it.
#
# Requires webp tools and macOS sips:  brew install webp
# Run from the repository root:        npm run media:sizes

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MEDIA="$ROOT/public/media"
INGREDIENTS="$MEDIA/ingredients"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

for tool in dwebp cwebp sips; do
  command -v "$tool" >/dev/null || { echo "missing $tool (brew install webp)" >&2; exit 1; }
done

# One decode per source, then one resize per width, so a 200-recipe run stays
# in the tens of seconds rather than decoding the same file three times.
resize_one() {
  local source="$1" outdir="$2" quality="$3"
  shift 3
  local widths=("$@")
  local slug png
  slug="$(basename "$source" .webp)"
  case "$slug" in *-[0-9][0-9][0-9]|*-[0-9][0-9]) return 0 ;; esac

  png="$WORK/$slug.png"
  dwebp -quiet "$source" -o "$png" || return 0
  for width in "${widths[@]}"; do
    local target="$outdir/$slug-$width.webp"
    [ -f "$target" ] && [ "$target" -nt "$source" ] && continue
    sips -Z "$width" "$png" --out "$WORK/$slug-$width.png" >/dev/null 2>&1 || continue
    cwebp -quiet -q "$quality" "$WORK/$slug-$width.png" -o "$target" || true
    rm -f "$WORK/$slug-$width.png"
  done
  rm -f "$png"
}
export -f resize_one
export WORK

echo "Recipe artwork → 320 / 640 / 1280"
find "$MEDIA" -maxdepth 1 -name '*.webp' -print0 |
  xargs -0 -P 6 -I{} bash -c 'resize_one "$@"' _ {} "$MEDIA" 78 320 640 1280

echo "Ingredient artwork → 64 / 128"
find "$INGREDIENTS" -maxdepth 1 -name '*.webp' -print0 |
  xargs -0 -P 6 -I{} bash -c 'resize_one "$@"' _ {} "$INGREDIENTS" 72 64 128

echo "Done. $(find "$MEDIA" -name '*-[0-9]*.webp' | wc -l | tr -d ' ') derived files."
