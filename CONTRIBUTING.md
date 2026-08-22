# Contributing

Thank you for helping keep Taiwan Essential Calendar useful, accurate, and focused.

## Inclusion standard

Proposals should follow one question:

> Is this a date an ordinary person living in Taiwan is reasonably likely to care about or recognize in everyday life?

The project is deliberately curated. A date being official, historic, occupational, religious, or listed in another calendar is not by itself a reason to include it.

## Proposing an event change

Open a GitHub issue before a pull request that adds, removes, renames, or moves an event. Include:

- the exact Traditional Chinese display name;
- the proposed category;
- the date rule and an authoritative source;
- evidence that the event is broadly recognized in everyday life in Taiwan;
- whether it overlaps an existing event and why both should remain distinct.

Maintainers will assess the proposal against the inclusion standard rather than completeness.

## Development workflow

1. Fork the repository and create a focused branch.
2. Run `corepack enable` and `pnpm install`.
3. Edit the appropriate file in `data/` and update tests.
4. Run `pnpm check`.
5. Inspect the relevant generated `.ics` file in `dist/`.
6. Open a pull request explaining the user-facing effect and source material.

Generated `dist/` and `_site/` files are intentionally ignored. Do not commit them.
