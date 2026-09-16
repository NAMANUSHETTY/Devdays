---
description: 'Commenting and documentation standards for TypeScript and Astro code'
applyTo: '**/*.{ts,astro,css}'
---

# Commenting and Documentation Standards

## Comment intent

- Explain **why** code exists, including non-obvious constraints, trade-offs, or decisions.
- Do not restate what the code already expresses. A comment such as `// Get all games` above `getAllGames()` adds noise.
- Prefer clear names and small functions over comments that describe routine control flow.
- Keep comments close to the code they explain and update or remove them whenever the related code changes. An outdated comment is a bug.
- Use comments sparingly; do not add comments solely to increase apparent documentation coverage.

## Data-layer API documentation

Every exported function in `db/` and `src/lib/` must have a TSDoc/JSDoc comment directly above its declaration. The comment must:

- Describe the function's purpose and any important behavior or constraints.
- Document every parameter with `@param`, including the injectable `db` argument used by data-access helpers and tests.
- Document the returned value with `@returns`.
- Call out thrown errors or side effects when they are part of the public contract.

Types, constants, and exported tables should also have a brief TSDoc comment when their purpose is not obvious from their name or declaration.

```ts
/**
 * Returns games in stable title order for deterministic static builds.
 *
 * @param db - The injectable Drizzle database used for the query.
 * @returns The published games mapped to the application-facing shape.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
  // ...
}
```

## Astro component contracts

Every reusable component in `src/components/` and `src/layouts/` must document its `Props` interface. The documentation should describe the component's role and clarify any non-obvious prop requirements, defaults, or accessibility expectations.

```astro
---
/** Props for the reusable game card displayed in game listings. */
interface Props {
  /** Game data rendered by the card. */
  game: Game;
}
---
```

Page-only `Props` interfaces do not need a separate comment when the page and prop names make the contract self-explanatory.

## Formatting and linting

Use the repository's TypeScript style consistently:

- Use two spaces for indentation, semicolons, double quotes, and trailing commas in multiline objects, arrays, and parameter lists.
- Prefer `interface` for object contracts and explicit parameter and return types for exported functions.
- Use `import type` for type-only imports and avoid `any`; choose a precise type or an existing shared type instead.
- Keep one logical statement per line and wrap long signatures or object literals rather than using dense formatting.

ESLint's recommended TypeScript and Astro rules enforce the parts of this style that can be checked automatically, including type safety and common syntax mistakes. Run `npm run lint` through the `quality-checks` skill after TypeScript or Astro changes; use comments and TSDoc to document intent and contracts, not as a substitute for lint rules.
