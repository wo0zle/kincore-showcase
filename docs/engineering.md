# Delivery and verification

## Work follows the behavior across layers

A change to a chore checklist involves the form, shared step state, completion contract, database checks, recurrence reset, completed-history snapshot, exports, and replay behavior. Delivery checks follow those dependencies rather than stopping at the first successful click.

The production stack uses TypeScript and validation for application boundaries, unit tests for domain calculations, and embedded PostgreSQL integration tests for transactional and permission behavior. Browser checks cover actual flows and responsive layouts.

## Latest recorded release evidence

For the October 8, 2026 chore-group/checklist and statistics release:

- 61 existing unit tests passed, alongside lint, TypeScript, and production build checks.
- Embedded PostgreSQL checks covered incomplete-checklist rejection, stale revisions, rollback, recurrence reset, preserved history, idempotent retries, household-local date aggregation, outsider denial, and paired-device revocation.
- Interactive checks covered shared partial steps, completion, late awards, captured history, and the next unchecked recurrence.
- Signed-in production checks covered mobile 365-day activity, day selection, all-time filters, Graphite mode, and offline completion replay recorded once after reconnect.
- Temporary verification accounts and households were removed after testing.

This is a selected release summary, not a public test run of the closed production repository. No production credentials or customer records are included as evidence. Physical refrigerator acceptance and broader end-to-end/operational gates remain separate work.

## What this repository verifies independently

Run `npm test` to check the illustrative model's own behavior and the public-file boundary. These tests are distinct from the production suite:

1. A checklist must finish before an award.
2. A retry resolves to the existing result without a second award.
3. A different request cannot complete an already completed occurrence.
4. A checklist revision change rejects stale work.
5. The credited profile comes from the actual completion.
6. Repeats reset their checklist while recorded history stays stable.
7. Different chore lengths and contributors produce the expected ledger totals.

All ten showcase model tests passed locally on October 8, 2026, including unusual retry identity keys. Browser checks confirmed incomplete-step rejection, actual-completer credit, a retry retaining one award, and fresh unchecked successor steps. Light and Graphite layouts were visually reviewed at desktop and 390-pixel mobile width; mobile had no horizontal overflow. These checks apply to this independent demo.

## Publication process

The showcase was assembled in a separate directory using an explicit publication manifest. Text, links, and images were reviewed before upload. It does not share the application's Git history. The included CI workflow runs on showcase changes with read-only permissions and contains no deployment actions.

For future updates, refresh scope and dated evidence, use fictional/public imagery, run the checks, and review the exact files to publish. Never copy the production working tree wholesale.
