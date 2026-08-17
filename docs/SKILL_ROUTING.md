# Skill Routing for Implementation

This document tells the implementation agent which installed skill to use, when to use it, and when not to use it. The agent must read a selected skill's complete `SKILL.md` before acting.

## Required and recommended skills

| Skill                                 | Status                           | Trigger                                                                                                           | Expected output                                                                                           |
| ------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ui-ux-pro-max`                       | Required for UI work             | Before creating or materially changing layouts, responsive behaviour, forms, accessibility, tokens or interaction | Persisted design system, relevant page override, implementation aligned with touch/accessibility guidance |
| `browser:control-in-app-browser`      | Required for browser QA          | When a runnable local UI exists and a task requires interaction or screenshot verification                        | Tested flows, viewport evidence, console/runtime observations and screenshots where useful                |
| `pdf:pdf`                             | Required for PDF delivery        | When implementing or reviewing host, guest or bilingual PDF output                                                | Rendered page images plus visual QA; no PDF is accepted from code generation alone                        |
| `imagegen`                            | Conditional                      | When creating missing recipe/ingredient illustrations or concept imagery                                          | Project-local raster assets with prompt/provenance; AI illustration label preserved                       |
| `spreadsheets:Spreadsheets`           | Recommended for content pipeline | When creating the 200-recipe intake/review workbook or bulk QA report                                             | Verified XLSX/CSV with validation-ready columns and no sensitive personal data                            |
| `diff-check`                          | Required before commit/PR        | Only before a user-requested commit or PR, or before declaring a diff ready for review                            | Report in the skill's required READY/NEEDS FIXES format; it reports and does not silently fix             |
| `jscpd`                               | Required at code-complete gates  | After domain/UI modules stabilise and before release review                                                       | Duplication report for TypeScript/JavaScript excluding generated files and fixtures                       |
| `openai-docs`                         | Conditional                      | Before OpenAI API/model/SDK, Codex or Luna-specific implementation decisions                                      | Current official documentation evidence and model/API-correct implementation                              |
| `understand-anything-knowledge-graph` | Optional later                   | When the codebase has grown enough that module relationships are hard to audit                                    | Read-only interactive map; not useful during initial scaffolding                                          |
| `computer-use:computer-use`           | Last resort                      | When a required desktop/cloud UI cannot be operated through a connector, CLI or browser                           | Explicit UI operation evidence; avoid for normal code/test work                                           |

## Skills not appropriate for the current target

- `sites:sites-building` and `sites:sites-hosting`: do not use while Cloudflare remains the selected hosting platform and `.openai/hosting.json` is absent.
- `resource-tagging`: defer until cloud governance or multi-environment tagging is explicitly in scope.
- `presentations`, `documents`, and live Excel control: not needed for application implementation.
- `plugin-creator`, `skill-creator`, and `template-creator`: do not create new extensibility packages unless the user explicitly asks.

## Phase routing

| Phase                             | Skills                                    |
| --------------------------------- | ----------------------------------------- |
| Repository and backend foundation | None required; use normal code/test tools |
| Design system and planner UI      | `ui-ux-pro-max`                           |
| Interactive UI acceptance         | `browser:control-in-app-browser`          |
| Recipe content workbook           | `spreadsheets:Spreadsheets`               |
| AI illustrations                  | `imagegen`                                |
| PDF exports                       | `pdf:pdf`                                 |
| OpenAI AI adapter                 | `openai-docs`                             |
| Code-complete audit               | `jscpd`                                   |
| Commit/PR handoff                 | `diff-check`                              |

## UI skill procedure

1. Read `ui-ux-pro-max/SKILL.md` completely.
2. Inspect the actual stack and existing design files.
3. If no persisted design system exists, run its design-system search with the project root as output directory.
4. Use the approved culinary palette and free-form faceted interaction from `UX_UI_SPEC.md`; do not replace them with an automatically suggested generic AI palette.
5. Create page overrides only when a screen needs a justified exception.
6. Run the skill's pre-delivery checklist before the UI acceptance gate.

## Browser QA procedure

1. Read the Browser skill before the first browser action.
2. Prefer the local app URL and the in-app browser unless the user explicitly chooses Chrome.
3. Test visible interaction, not only DOM presence.
4. Test touch-sized controls using mobile/tablet viewports, keyboard navigation, focus order, menus, popovers, reset, undo and stale-menu states.
5. Record failures with exact screen, action, expected result and observed result.

## PDF skill procedure

1. Read the PDF skill before generating or inspecting final PDFs.
2. Generate host, guest and bilingual samples from synthetic data.
3. Render every page to images.
4. Check clipping, page breaks, CJK font embedding, image labels, unit/currency consistency, QR readability and allergen visibility.
5. Iterate until the rendered pages pass; a successful library call is not sufficient evidence.

## Image generation procedure

1. Use only when a real/licensed image is unavailable or a concept render is requested.
2. Store the selected output in the project, not only the generated-image cache.
3. Record `ai_model`, `ai_prompt`, `generated_at`, alt text and `media_type=ai_illustration`.
4. Do not use generated images as proof of exact finished appearance.
5. Ensure the app and PDF derive the visible AI label from media metadata.

## Quality skill procedure

### jscpd

- Run on authored TypeScript/JavaScript.
- Ignore `node_modules`, build output, coverage, generated API clients, migrations and fixture data.
- Start with `minLines: 5`, `minTokens: 50` and a release target below 3% meaningful duplication.
- Do not create abstractions merely to reach zero duplication.

### diff-check

- Run only after tests and build.
- Review the complete intended diff.
- Fix reported critical issues, rerun verification, and rerun diff-check.
- Do not commit unless the user requested a commit.

## Plugin note

No additional skill installation is required for the planned MVP. GitHub and Cloudflare plugins become useful only when the user authorises external repository operations or deployment management; they are connections, not substitutes for the local implementation skills above.
