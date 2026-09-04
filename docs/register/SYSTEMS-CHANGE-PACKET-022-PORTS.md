# SYSTEMS-CHANGE-PACKET-022 — Ports as a control

**Number:** `022` — next systems packet is `023`. Never reuse a number.  
**Status:** **Signed.** Engineer has **not** planted the host or the connectors face. Plant on **this PR** ([#120](https://github.com/bywale-com/travis/pull/120)) after this file.  
**Seat:** Systems Analyst. Engineer pastes this. No leftover analysis.  
**When:** 2026-09-04  
**Envelope:** [`ENVELOPE-TRAVIS-PORTS.md`](./ENVELOPE-TRAVIS-PORTS.md)  
**Glass (PM lock on the envelope):** new components on an existing face are a plate we generate. **I1 cannot grow.** Voice / Log / Backlog / Create / Roster gain nothing.  
**Prior (do not remint):** 011 `IntegrationStatus` + options · 012 house (refused `travis.integration`) · 020 box · 021 unfold / `TRAVIS_GITHUB_TOKEN` · 042  
**Trail:** [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md)

---

## 1. Story (signed)

Ports are a **control**, not another `TRAVIS_*` env line. The product plants a **host once**. Travis fills a **manifest** in the house. The phone lists whatever is registered. Founder **authorizes** (paste). The secret never hits the phone and never lands on the Sprite disk.

**Two writes — do not collapse them.**

| Write | Where | Who |
|-------|--------|-----|
| **Product** | Host + connectors plate + prebuilt use | Engineer / a seat. Deploy `travis-psi`. **Not Travis.** |
| **Harness** | `/ports/<slug>.json` in `os_node` | Travis (`write_os`). **Not** this repo. |

If every new vendor needs a PR here, the Story is false.

**Hands stay split.** Travis writes Travis (ports, harness, prove, unfold). Seats write repos. 042 stands.

---

## 2. Registry — un-refuse the grain, do not reuse the name

012 / 021 refused **`travis.integration`**. That name stays refused (it was “install is env + I1 DTO”).

**Mint `travis.port`.** OS-scoped. **No `session_id`.** Add in one room → everywhere. `DATABASE_URL` is not a port.

```sql
CREATE TABLE travis.port (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  kind text NOT NULL,
  env_name text NOT NULL DEFAULT '',
  secret text NOT NULL DEFAULT '',
  authorized_at timestamptz,
  house_path text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

| Column | Law |
|--------|-----|
| `slug` | `[A-Za-z0-9._-]+`. Identity. |
| `kind` | `prebuilt` \| `harness` |
| `env_name` | Name injected into **box exec** only. Never a file on disk. |
| `secret` | Server only. **Never** in GET JSON. **Never** `write_box` / `tee`. |
| `house_path` | Harness: `/ports/<slug>.json`. Empty on prebuilts. |

Ensure-once + founder ALTER (same 012 discipline). Do not `db:push` as the land.

---

## 3. Host — manifest in the house, not MCP

**Refuse MCP this packet.** Aug 28 named it; do not plant it from that stamp. **Refuse OAuth** this packet (paste only).

**Convention dir:** `/ports` on `os_node`. Add it next to `/protocols` and `/templates` in ensure (empty dir, no content). Do not migrate-seed manifests from git.

**Descriptor Travis is allowed to write** (`write_os` `/ports/<slug>.json`):

```json
{ "slug": "linear", "label": "Linear", "env": "LINEAR_API_KEY", "authorize": "paste" }
```

`slug` must match the filename stem. `authorize` is `paste` only this packet. Unknown fields ignored. Invalid JSON → that file does not become a row.

**How the phone lists without a product deploy**

`listPorts()` (server):

1. Ensure the five prebuilt rows exist (slug + label + `env_name`, **no** secret).  
2. Walk house `/ports` files. Each valid manifest **upserts** a `kind=harness` row (`slug`, `label`, `env_name`, `house_path`). Does not overwrite `secret`.  
3. Return `{ slug, label, kind, connected }[]`.  

`connected` = row `secret` nonempty **or** (prebuilt and `process.env[env_name]` nonempty).

No new Travis tool. `write_os` is the write. After he files it, the row appears for Authorize.

**Generic use (so a new vendor is not a PR):** authorized secrets are passed as **exec env** on `run_box` / `prove_box` / `unfold_repo` / `write_box` / `read_box`. Prefer row `secret`, else process env for that `env_name`. Token never written to the Sprite. A harness port does **not** grow a new first-class Travis tool. If he needs a new product tool, that is a product write.

---

## 4. Authorize

**Paste.** Operator-auth HTTP (053). Completes on the same plate.

`POST /api/ports/:slug/authorize` `{ "token": "…" }`  
Writes `secret` + `authorized_at`. Never echoes the token. Empty token refused.

`GET /api/ports` — list above. Replaces I1’s job. Do **not** ship `secret`.

Already-in: `connected` true → Authorize again is allowed (overwrite).

Empty plate: no row connected.

---

## 5. Prebuilts this packet

| Slug | Label | `env_name` | Notes |
|------|--------|------------|--------|
| `cursor` | Cursor | `CURSOR_API_KEY` | Seats. Cursor’s GitHub **scope** stays inside this port (011). Not a second GitHub row. |
| `github` | GitHub | `TRAVIS_GITHUB_TOKEN` | **His** create + push (021 unfold). |
| `sprites` | Box | `SPRITES_TOKEN` | 020. |
| `openai` | Mouth | `OPENAI_API_KEY` | Dest Travis. |
| `resend` | Mail | `RESEND_API_KEY` | Magic link. |

Do not invent a marketplace. **ElevenLabs** stays considering. **`GITHUB_TOKEN`** stays unnamed. **`DATABASE_URL`** stays out.

### `TRAVIS_GITHUB_TOKEN`

- Env remains **fallback** so unfold is not blocked before the founder pastes.  
- Plate `github` is already-in if env **or** row secret.  
- Unfold / box exec prefer the row, then env.  
- Authorize on `github` writes the row. Do not add `GITHUB_TOKEN`.

011 `GET /api/integrations/options` (models, repos) **stays** for V4. I1’s Cursor / models / repos **dump is not the connectors job**.

---

## 6. Glass

**One face: the connectors plate.** It **replaces** I1. Do not grow the Cursor PNG.

| On the plate | Law |
|--------------|-----|
| Row | name, connected / not, Authorize |
| Empty | none wired |
| Already-in | Authorize again |
| Authorize beat | paste token. Completes, same plate. Keys stay server-side. |

Add-a-new-port is **spoken** or a quiet door (“he files `/ports/<slug>.json`”). Not its own plate. After `write_os`, the row appears.

V1 footer already opens I1 — same quiet link. Label may say **Connectors**. No reprint for a label.

**Do not generate:** prove, unfold, house/box tree, MCP IDE, marketplace, a plate per vendor.

V4 pickers unchanged. No second repo picker.

---

## 7. Must-not

- Marketplace browse  
- Prove / unfold / Browse-OS plates  
- Computer use  
- Auto-sit catalog slugs  
- Box tools becoming Cursor send  
- 042 lifting so he can edit `bywale-com/travis`  
- Dumping the house onto the Sprite  
- Reminting 011 / 012 / 020 / 021  
- MCP host this packet  
- Secret in house `body`, on the phone, or on the Sprite disk  
- `travis.integration` as the table name  

---

## 8. Named silence (back)

- Computer use  
- Travis seeing Cursor PRs / dashboard  
- Second repo picker on V4  
- Rewriting this product from the box  
- OAuth  
- ElevenLabs  
- MCP  

---

## 9. Engineer (paste)

On **this PR** (`cursor/envelope-travis-ports-0bd3`):

1. `travis.port` + ensure-once. Founder lands ALTER. Seed the five prebuilts **without** secrets.  
2. Ensure house dir `/ports`.  
3. `listPorts` / `GET /api/ports` / `POST /api/ports/:slug/authorize`.  
4. Box exec injects authorized env. Never tee a secret.  
5. **Generate the connectors plate** (row, empty, already-in, Authorize). Replace I1. Keep V4 options.  
6. Unfold continues to use `github` (row then `TRAVIS_GITHUB_TOKEN`).

Do not send **That’s fine.** from this bind.

---

## Verify

- `GET /api/ports` never contains a token.  
- A house file `/ports/linear.json` appears as a harness row without a deploy.  
- Authorize then `run_box 'test -n "$LINEAR_API_KEY"'` via `prove_box` sees the env; `read_box` of any path does not show the token.  
- `github` already-in when only `TRAVIS_GITHUB_TOKEN` is set.  
- V4 still loads models/repos. Connectors plate does not dump them.  
- 042 tests still pass. No MCP tool.  
