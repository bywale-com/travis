# Systems change packet 011 — Cursor + GitHub integration (I1–I5)

**Number:** `011` — next systems packet is `012`. Never reuse a number.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-03  
**Decision:** Wire real SDK calls behind `GET /api/integrations/status`. Fix the broken `Agent.create` call shape (model + repository do not match the SDK contract). Rebuild `listCreateOptions` to return typed structs, not flat strings. Rebuild Create Agent (I4) to use real picker rows. No new tables. No GitHub OAuth surface. No billing pocket. Single operator.  
**Founder lock:** Keys stay server-side. `Cursor.repositories.list()` is the GitHub layer — no separate GITHUB_TOKEN. Recommendations surface a default variant, not an invented label. The model picker (I3) shows `id + displayName + one-word variant description` from live SDK data. `recently_used` in the repo picker is client-only (last selected, session-scoped) — not stored. `ref` is a free-text branch/tag/commit.  
**Glass (read, then ascribe — do not mint scenery):**  
- **I1** — "Cursor" screen. Four sections: CONNECTION (`email · plan`), GITHUB (`org · N repos visible`), MODELS (`N available`), REPOSITORIES (`N visible`). One "Change" affordance per section (server-side instruction text only, no in-app credential flow). Footer: *Keys stay server-side. Never sent to this device.*  
- **I5** — State A: key missing (`CURSOR_API_KEY missing`, `Set up`, `Add CURSOR_API_KEY in Vercel`). State B: Cursor connected, GitHub not (`No GitHub scope on this key`, `Connect`, `GitHub connection required — models still available`).  
- **I2** — bottom sheet: `Repository` header + org name (`bywale-com`). Search field (client-side filter on fetched list). RECENTLY USED section (last selected, session-local). ALL REPOS section. Footer: `N repos visible via GitHub · org`. No confirmation button — tap selects and dismisses.  
- **I3** — bottom sheet: `Model` header + `Cursor`. AVAILABLE list (`id · description`). RECOMMENDED FOR NEW AGENTS section (marked `default` badge). Footer: `Models fetched from Cursor · your key`. Tap selects and dismisses.  
- **I4** — "Create an agent". NAME free-text (required). MODEL selection row (opens I3, shows default on load). REPOSITORY selection row (opens I2). STARTING REF free-text (`branch, tag, or commit`). One loud action: `Create agent`. Footer note: `Runs are billed to your Cursor account.` + `You can remove it from the room later. Deleting for good is done by hand.`  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## Intent

`/api/agents/options` today returns `string[]` for models and repositories because `listCreateOptions` calls the SDK with wrong option shapes and flattens items through `namesFrom`. That function reads `url ?? name ?? id` — correct for repos (SDK returns `{ url }`), wrong for models (SDK returns `{ id, displayName, … }`). `Agent.create` on main passes `model` as a raw string and `repository` as a top-level key — neither matches the SDK contract (`model: { id }`, `cloud.repos: [{ url }]`). These must be fixed before the picker plates make any sense.

I1 and I5 need a new server route that returns structured connection status — not a live options list but a dedicated status check: key present + `Cursor.me()` + `Cursor.models.list().length` + `Cursor.repositories.list().length`. That route drives the I1 screen and the I5 error states without touching the options fetch.

I2 and I3 are bottom sheets over the rebuilt options route (`GET /api/integrations/options`) returning typed structs (`ModelOption[]`, `RepoOption[]`). Separate from the status route.

---

## Stood-up truth (quote, not memory)

### `Cursor.me()` → `SDKUser`

```typescript
// SDK 1.0.27 — stubs.d.ts
interface SDKUser {
  apiKeyName: string;
  userId?: number;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  createdAt: string;
}
```

**No `plan` field in SDK.** I1 shows "Cursor Pro" — that is `apiKeyName` (the key's display name as set in Cursor dashboard), not a separate plan field. SA decision: use `apiKeyName` as the `plan` label on I1. If the key name contains "Pro" that is what shows. Do not invent a plan tier field.

### `Cursor.models.list()` → `SDKModel[]`

```typescript
interface SDKModel {
  id: string;
  displayName: string;
  description?: string;
  aliases?: string[];
  parameters?: ModelParameterDefinition[];
  variants?: ModelVariant[];
}

interface ModelVariant {
  params: ModelParameterValue[];
  displayName: string;
  description?: string;
  isDefault?: boolean;
}
```

**Default model:** `isDefault === true` on a `ModelVariant`, not on the model itself. Policy: pick the first model that has any variant with `isDefault === true`. If none, pick `id === "composer-2.5"` if present, else the first item.

**Description for I3 rows:** use `variants[0].displayName` (e.g. `"balanced"`, `"fast"`, `"code"`, `"heavy"`, `"multimodal"`) as the one-word descriptor shown after the `·`. If `variants` is empty, use `description?.split(" ")[0]` or omit.

### `Cursor.repositories.list()` → `SDKRepository[]`

```typescript
interface SDKRepository {
  url: string;  // e.g. "github.com/bywale-com/travis"
}
```

**GitHub connectivity:** there is no separate GITHUB_TOKEN. If `repositories.list()` returns an empty array and `me()` succeeds, the key has no GitHub scope. That is State B on I5. No OAuth flow — the instruction is a server-side note to the operator to reconnect the GitHub integration on cursor.com.

**Org name for I1 / I2 header:** derive from the first `url` (`url.split("/")[1]` → `bywale-com`). If the list is empty, org is unknown — show the "Not connected" state.

**Repo short name for I2 rows:** `url.split("/").pop()` (e.g. `"travis"`, `"omcoda_tower"`). Full URL is the subtitle (`github.com/bywale-com/travis`).

**Private / language fields shown in I2** (`Private · TypeScript`, `Public · Next.js`) — the SDK `SDKRepository` only has `url`. SA decision: these are **glass-only decoration**; Engineer does not call a GitHub REST API to enrich them. I2 rows show `repoName` (bold) and `url` (quiet). Drop the `Private · TypeScript` subtitle — do not invent fields the SDK does not return. If PM returns from glass review and says those fields must show, that is a separate pocket requiring a GitHub REST call and a new decision.

### `Agent.create` contract (SDK)

```typescript
// Correct cloud shape
await Agent.create({
  apiKey: key,
  name: label,
  model: { id: modelId },          // ModelSelection, not a raw string
  cloud: {
    repos: repository              // only when a repo url is selected
      ? [{ url: repository }]
      : undefined,
    // ref goes on the repo entry, not a top-level field
    startingRef: undefined,        // ← does NOT exist at top level
  },
  prompt: `You are ${label}. You sit in a Travis room.`,
});
```

**`ref` field:** SDK `CloudAgentOptions.repos` entries accept `startingRef?: string`. It is not a top-level `Agent.create` field. The current code passes `ref` at the top level — that is wrong. Fix: if `ref` is provided, pass `cloud.repos: [{ url: repository, startingRef: ref }]`. If `repository` is absent but `ref` is present, ignore `ref` (cannot set a ref without a repo).

**Current broken shape on main:**
```typescript
await Agent.create({
  model: opts.model || undefined,         // ← raw string, wrong
  repository: opts.repository || undefined, // ← not an SDK field
  ref: opts.ref || undefined,             // ← not a top-level SDK field
  ...
})
```

---

## Must / must-not

### Must

**New route: `GET /api/integrations/status`**

Server only. No client secrets. Returns:

```typescript
type IntegrationStatus = {
  cursor:
    | { connected: true; email: string; keyName: string }
    | { connected: false; reason: "missing_key" | "invalid_key" };
  github:
    | { connected: true; org: string; repoCount: number }
    | { connected: false; reason: "no_scope" | "no_cursor" };
  models:
    | { available: true; count: number }
    | { available: false };
  repositories:
    | { available: true; count: number; org: string }
    | { available: false };
};
```

Implementation:
1. If `CURSOR_API_KEY` is absent → `cursor: { connected: false, reason: "missing_key" }`. All others unavailable.
2. Call `Cursor.me({ apiKey })`. If it throws/401 → `cursor: { connected: false, reason: "invalid_key" }`.
3. Call `Cursor.models.list({ apiKey })` → count.
4. Call `Cursor.repositories.list({ apiKey })` → count + org from first url. If empty → `github: { connected: false, reason: "no_scope" }`.
5. All four calls happen on the server. Do not proxy the key to the client.

**Updated route: rebuild `GET /api/integrations/options`** (rename from `/api/agents/options`)

Returns typed structs, not flat strings:

```typescript
type OptionsResponse = {
  models: ModelOption[];
  repositories: RepoOption[];
  defaultModelId: string | null;
};

type ModelOption = {
  id: string;
  displayName: string;
  variantLabel: string;   // first variant displayName, or ""
  isDefault: boolean;     // has any variant with isDefault === true
};

type RepoOption = {
  url: string;            // full e.g. "github.com/bywale-com/travis"
  name: string;           // last segment e.g. "travis"
};
```

Default model selection: first model with any `isDefault` variant, else `composer-2.5`, else first item. `defaultModelId` names the winner.

**Fix `createAgentBinding` in `src/server/create-agent.ts`**

Change the `Agent.create` call to match the SDK contract:

```typescript
await Agent.create({
  apiKey: key,
  name: label,
  model: opts.model ? { id: opts.model } : undefined,
  cloud: (opts.repository || opts.ref) ? {
    repos: opts.repository
      ? [{ url: opts.repository, ...(opts.ref ? { startingRef: opts.ref } : {}) }]
      : undefined,
  } : undefined,
  prompt: `You are ${label}. You sit in a Travis room.`,
} as Record<string, unknown>);
```

The `as Record<string, unknown>` cast stays until the SDK types are fully typed in this codebase.

**Fix `listCreateOptions` / `namesFrom`**

`namesFrom` today is a raw unknown flattener. It must be replaced by typed readers that know the SDK shapes. The rebuild routes through `GET /api/integrations/options` which uses the typed `ModelOption[]` / `RepoOption[]` structs above. The old `listCreateOptions` function can be removed once the new route is in.

**I1 screen (`/integrations` or door from room index footer)**

Read from `GET /api/integrations/status`. Four sections: CONNECTION, GITHUB, MODELS, REPOSITORIES. Each section has a status dot (filled = connected, empty ring = not). "Change" is a quiet text link with static instruction text (no in-app credential flow — just tells operator where to go). Footer: *Keys stay server-side. Never sent to this device.*

**I2 bottom sheet (Repository picker)**

- Fetched from `GET /api/integrations/options` → `repositories`.
- Client-side search filter on the fetched list (no server round-trip).
- RECENTLY USED section: last selected repo stored in **session local state** (`useState` in the Create Agent component). Not persisted. If nothing selected yet, omit the section.
- ALL REPOS section: full list minus the recently used item.
- Tap selects and dismisses. No confirm button.
- Footer: `N repos visible via GitHub · org`.

**I3 bottom sheet (Model picker)**

- Fetched from `GET /api/integrations/options` → `models` + `defaultModelId`.
- AVAILABLE section: all models, `id` bold, `variantLabel` as one-word description after `·`.
- RECOMMENDED FOR NEW AGENTS section: the model whose `id === defaultModelId`. Show `default` badge.
- If `defaultModelId` is null (no models), show honest empty: "No models available — check the Cursor connection."
- Tap selects and dismisses.
- Footer: `Models fetched from Cursor · your key`.

**I4 Create Agent (rebuilt)**

- NAME: required text field. Create button disabled until non-empty.
- MODEL: selection row, opens I3. Defaults to `defaultModelId` on load — shows `id + variantLabel`. If no models, shows "Select model" placeholder (row still tappable, sheet shows empty state).
- REPOSITORY: selection row, opens I2. No default. Shows "Select repository" until chosen.
- STARTING REF: free-text (`branch, tag, or commit`). Optional. Hint text only.
- Create button: one loud action. Sends `{ label, model: selectedModelId, repository: selectedRepoUrl, ref }` to `POST /api/agents`.
- Footer notes are glass copy — paste as-is from the plate.

**I5 error states**

Handled by I1's status response — no separate route. Engineer renders the two states from the `IntegrationStatus` union directly.

### Must-not

- A separate `GITHUB_TOKEN` env var. GitHub connection is via the Cursor key's OAuth scope only.
- A GitHub REST call to enrich repo metadata (`private`, `language`). The SDK returns only `{ url }`.
- A `plan` / `tier` field on `SDKUser`. Use `apiKeyName` as the plan label.
- An `isDefault` flag at the model level. Default is derived from `variants[].isDefault`.
- Persisting "recently used" repos to the database. Session-local state only.
- An in-app OAuth flow or credential input. Keys are set server-side by the operator.
- Calling the old `/api/agents/options` route from I2/I3 — that route returns flat strings, not the typed structs the pickers need. Rename or replace.
- Deleting agents from within the app. The plate says "done by hand."
- A `billing` / `usage` pocket. Not in this packet.
- Billing or usage endpoints in I1. Count-only (`N available`, `N visible`).

---

## Stores

No new tables. No schema change. This packet is all runtime + route + SDK call fixes.

---

## Routes

| Route | Change |
|-------|--------|
| `GET /api/integrations/status` | **New.** Returns `IntegrationStatus` as above. |
| `GET /api/integrations/options` | **New** (replaces `/api/agents/options`). Returns `OptionsResponse` as above. |
| `GET /api/agents/options` | **Remove** or redirect to `/api/integrations/options`. |
| `POST /api/agents` | **Fix** `createAgentBinding` SDK call shape (model, cloud.repos, startingRef). |

---

## Ports / tools (state table)

| Port | 011 |
|------|-----|
| `Cursor.me()` → email + keyName | **Real** |
| `Cursor.models.list()` → typed structs | **Real** |
| `Cursor.repositories.list()` → url only | **Real** |
| `Agent.create` with correct model + cloud.repos | **Real — fix** |
| GitHub REST repo enrichment (private, language) | **Refused** |
| Separate GITHUB_TOKEN | **Refused** |
| In-app credential flow | **Refused** |
| Recently used repos persisted to DB | **Refused** |
| Agent delete from app | **Refused** |
| Billing / cost in I1 | **Out of scope** |

---

## Verify

1. `GET /api/integrations/status` with valid key → `cursor.connected: true`, email = `SDKUser.userEmail`, keyName = `SDKUser.apiKeyName`. `github.connected: true` only if `repositories.list()` returns ≥1 item.
2. Same route with no `CURSOR_API_KEY` → `cursor.connected: false, reason: "missing_key"`. All others unavailable.
3. `GET /api/integrations/options` → `models` is `ModelOption[]` (not flat strings). `defaultModelId` is the first model with an `isDefault` variant.
4. `POST /api/agents` with model + repository → `Agent.create` receives `model: { id }` and `cloud.repos: [{ url }]`. No `repository` top-level key. No bare string `model`.
5. Selecting a repo in I2, then opening I2 again → RECENTLY USED shows the last pick. Closing and reopening Create Agent → RECENTLY USED gone (session-local only).
6. I5 State A renders when `cursor.connected: false`. State B renders when `cursor.connected: true` but `github.connected: false`.
7. `namesFrom` is gone or unreachable after the rebuild.

---

## Out of scope

- Billing / Agent.getUsage per room.
- Multi-operator or team.
- Repo enrichment (private/language badges).
- Agent delete.
- GitHub OAuth flow.
- 012+.

---

## Engineer handoff

Fix `createAgentBinding` SDK call first (that is a live bug). Then build `GET /api/integrations/status`. Then `GET /api/integrations/options` with typed structs. Then wire I1, I2, I3, I4 from those routes. I5 is conditional rendering on I1's status response. No new tables. Founder does not land SQL for this packet — it is all runtime.
