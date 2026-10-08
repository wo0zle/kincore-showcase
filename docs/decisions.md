# Design decisions worth discussing

## 1. Separate accounts from profiles

**Reason:** shared screens and family participation do not map cleanly to one credential per avatar. Accounts govern access; profiles represent assignments and progress.

**Cost:** every action must distinguish the authenticated actor from the profile receiving credit. A profile identifier is never sufficient authorization.

## 2. Keep the reward ledger with the completion

**Reason:** retries, interruptions, and concurrent taps should not duplicate points. Recorded results need a stable explanation even when future scoring changes.

**Cost:** completion is more than updating a checkbox. Integrity belongs in a transaction, with tests around replay, attribution, and historical snapshots.

## 3. One unresolved repeat at a time

**Reason:** missing a day should create visible overdue work, not a wall of duplicate dishes.

**Cost:** this is not a compliance log of every missed scheduled slot. A product needing one historical obligation per slot would choose a different model.

## 4. Read-only calendar first

**Reason:** one place to see the household week without introducing another calendar editor or conflicting write path.

**Cost:** changes still happen in Google. OAuth review and provider availability remain external dependencies.

## 5. Friend comparisons use a projection

**Reason:** a friendly contest does not require sharing private home details.

**Cost:** cross-household profiles deliberately show less than local profiles. A new comparison metric needs a privacy review before joining that projection.

## 6. Sell expression, keep participation free

**Reason:** families should not need a subscription to share chores and participate in the game.

**Cost:** supporter rewards need to feel worthwhile without altering points, achievement difficulty, or essential access. Cosmetics and printable keepsakes fit that boundary.

## 7. Publish a showcase rather than the operational repository

**Reason:** readers can evaluate the product, architecture, decisions, and illustrative invariants without receiving production configuration or sensitive implementation material.

**Cost:** this repository cannot independently prove every production claim or reproduce the service. Its examples and verification summaries state their limits explicitly.
