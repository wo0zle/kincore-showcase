# Architecture: shared state, clear ownership

kinCore has two identity layers. An authenticated account can belong to households and administer them according to its role. A household profile represents the person receiving an assignment, completing a chore, and earning progress. A paired kitchen screen is a revocable device, not another administrator.

```mermaid
flowchart TB
  Phone[Phone and tablet] --> Web[Next.js application]
  Fridge[Paired kitchen screen] --> Web
  Web --> Server[Server reads and validated mutations]
  Server --> Auth[Supabase Auth and membership]
  Server --> DB[(PostgreSQL / household isolation)]
  Queue[IndexedDB completion queue] -->|replay after reconnect| Server
  Server -->|read-only| Google[Google Calendar]
  Server --> Checkout[Stripe hosted checkout and portal]
  Checkout -->|verified webhook| Server
```

## A completion is a state transition

```mermaid
sequenceDiagram
  participant UI as Household UI
  participant API as Authorized server
  participant DB as Transactional store
  UI->>API: Complete occurrence with actual profile and retry identity
  API->>DB: Validate scope, open state, checklist revision
  DB->>DB: Capture completion inputs and record award
  DB->>DB: Evaluate applicable achievements and update summaries
  DB->>DB: Schedule next eligible recurrence
  DB-->>API: Recorded outcome
  API-->>UI: Refresh progress
  UI->>API: Retry the same operation after reconnect
  API->>DB: Resolve existing outcome
  DB-->>UI: Same completion, no second award
```

This illustrates logical responsibilities, not the production SQL or an exact endpoint contract. Duplicate requests and overlapping work must converge on a single recorded outcome.

## Template, occurrence, completion

A template describes future work. An occurrence is the specific scheduled job currently open. A completion captures what happened: the actual completer, time, checklist, scoring inputs, and resulting award. Editing future work must not rewrite completed history.

Recurring work has one open occurrence per template. Overdue work remains visible; a new open copy does not stack on top of it. Once resolved, recurrence calculation determines the next eligible date. The rules use household-local dates rather than assuming every household lives in the server's timezone.

## Calendar and friends are different boundaries

Google Calendar remains the editor for imported events. kinCore displays selected events alongside its own scheduled chores. Tokens and exchanges stay server-side. Public Google OAuth verification is still pending at this snapshot.

Friendship is bilateral and opt-in. A friend's view receives a limited comparison projection. It does not reuse the household's full task/calendar payload. Secret achievements remain concealed until earned.

## Offline has a defined scope

The browser queues chore completions for replay after reconnect. This is not a claim that every operation works offline. Checklist partial progress saves online; offline step state accompanies a queued completion. A changed checklist revision must not silently complete a newer version.

## Refresh and deployment

Visible-page periodic refresh and reconnect refresh are implemented. General realtime subscriptions are future work. Vercel hosts the Next.js application; Supabase provides authentication and transactional data. A fully independent self-hosted authentication/API stack is not presented as finished.
