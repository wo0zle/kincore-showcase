# Security and publication boundaries

## Report privately

Email **wesley@kincore.co** with a concise description, affected surface, and safe reproduction steps. Do not put credentials, personal data, or exploit details in public issues. This is a reporting contact, not a promise of a response time or a paid bounty.

## What this repository exposes

High-level architecture, product scope, selected verification summaries, public brand assets, a fictional preview, and newly written illustrative code. There are no production credentials, customer records, auth session files, infrastructure identifiers, database migrations, or production authorization handlers here.

The example model runs in browser memory. Anyone can change it using developer tools. It provides no authentication, authorization, or durable storage and must not be repurposed as a server security layer.

## Production principles

- Resolve membership and permissions on the server, rather than trusting a submitted household identifier.
- Use database row-level security as another boundary for household-owned data.
- Separate account identity from household profiles and paired-device access.
- Keep provider credentials server-side and restrict calendar access to read-only operations.
- Make completion and reward recording transactional and retry-safe.
- Share only an opt-in aggregate projection with friend households.
- Validate input and constrain user-generated content; moderate public comments.
- Control optional analytics through consent and avoid sending private household data to analytics.

These are engineering practices, not a certification or a guarantee against every vulnerability. Ongoing device testing, provider configuration, abuse testing, and operational checks remain part of release work.

## Showcase checks

Only paths in the publication manifest can pass the included content check. It checks links and several common credential/private-file patterns. CI tests the examples and runs this check. Pattern scanning cannot prove the absence of sensitive content; human review of documentation and images is still required.

The showcase workflow has read-only repository permissions. It has no deployment step, environment credentials, cloud connection, or production data access.
