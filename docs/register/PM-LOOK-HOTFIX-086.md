# PM look — 086 Runtime verification is the app

**Packet:** HOTFIX-086  
**Change packet:** none (hotfix)  
**PR:** https://github.com/bywale-com/travis/pull/171  
**Preview:** https://travis-git-cursor-runtime-verify-137d53-wale-omotayos-projects.vercel.app (SSO wall — did not sign in)  
**Verdict:** Pass

## Look

Lock ([`HOTFIX-086-RUNTIME-IS-THE-APP.md`](./HOTFIX-086-RUNTIME-IS-THE-APP.md)): walks are the app. Think-walks fail `/error/i`, fail named unwired, require a speakable Travis post. Dest scores the leave only. SSE consumed until `done` or `error`. `openFreshRoom` + suite `--test-concurrency=1`. `insertStatusTurn` stamps `seatKey`. Generate miss reads `Travis · Travis error: …`, not `?? · run error`. Dest throw writes `Dest error: …` on the tape. Red `runtime-doors` fresh-adds `fail-look` (`WAKE_GITHUB_TOKEN`). Do not remint Deep Agents `/node`, dest assemble, stream-intent, or 035.

Plant (Engineer handoff last plant **086 runtime is the app**, commit `13d0b0f`):

**1–2. Inventory + outcome helpers**

```1:14:src/runtime/README.md
# Runtime verification — this is the app

If a use is on the phone, a walk here is that use. The Deployment Check `runtime-doors` runs **every** walk on **this** deploy URL. Green means the app worked. It does not mean the door returned headers.
```

```68:90:src/runtime/app-worked.ts
/** Think-walk miss. Named unwired is red here. Do not grade the sentence. */
export function thinkMissReason(turns: TapeTurn[]): string | null {
  if (turns.some(isNamedUnwired)) {
    return "Travis isn’t wired — think-walk is red (unwired glass is its own walk)";
  }
  const miss = turns.filter(isRunErrorTurn);
  if (miss.length) {
    return `run error on tape: ${miss.map((t) => t.text || "(empty status)").join(" | ")}`;
  }
  if (!travisSpoke(turns)) {
    return "Travis did not speak (no speakable travis agent_post)";
  }
  return null;
}
```

**3. Doors consume SSE until terminal**

```32:35:src/runtime/doors.ts
        if (event === "done" || event === "error") {
          await reader.cancel().catch(() => {});
          return { events, error };
        }
```

**4. Desk: fresh sitting, full tape grain, sequential suite**

```94:99:src/runtime/desk.ts
/** End the live sitting and open a new one. Walks must not share a tape. */
export async function openFreshRoom(): Promise<Desk> {
  const live = await openRoom();
  await endSession(live);
  return openRoom();
}
```

`package.json`: `"test:runtime": "tsx --test --test-concurrency=1 src/runtime/walks/*.spec.ts"`.

**5. Walks recut + type-walk-back seeded**

`src/runtime/walks/type-walk-back.spec.ts` — two beats; second must add a speakable Travis post. Dest walk asserts `destLeaveStarted(queue)` only (`type-dest.spec.ts`).

**6. Status turn stamps seatKey**

```457:468:src/server/seat-pipe.ts
export async function insertStatusTurn(
  sessionId: string,
  text: string,
  seatKey?: SeatKey | null,
): Promise<VoiceTurn> {
  return insertTurn(sessionId, {
    role: "status",
    kind: "status",
    seatKey: seatKey ?? undefined,
    speakable: false,
    text,
  });
}
```

**7. Dest throw writes Log-visible miss**

```17:22:src/lib/travis-miss.ts
/** Dest throw before leave. Same Log rule: the miss must say error or Room hides it. */
export function destLeaveMiss(message: string): string {
  const msg = message.replace(/\s+/g, " ").trim() || "leave failed";
  if (isVisibleLogStatus(msg)) return msg;
  return `Dest error: ${msg}`;
}
```

Wired in `send/route.ts` and `finalize/route.ts` via `insertStatusTurn(…, destLeaveMiss(msg), …)`.

**8. Red runtime-doors fresh-adds fail-look**

`.github/workflows/runtime-doors.yml` — on failure, remove then re-add `fail-look` using `WAKE_GITHUB_TOKEN`. B prompt recut in `house-now/automations/sa-complete-engineer.prompt.md` names `fail-look` from red walks. Hotfix note: `repository_dispatch` runs the workflow on `main` — live after merge.

**Glass (from CI tape, not production psi).** Latest `runtime-doors` run [`34555440214`](https://github.com/bywale-com/travis/actions/runs/34555440214) on deploy commit `842d347b` (preview before latest push). Walk `voice-wrap` failed with tape:

```
#4 status/travis speak=false Travis error: Cannot use import statement outside a module
```

That is `Travis · Travis error: …` with seatKey `travis`, not `?? · run error`. The walk correctly went red and dumped the tape — the false-green miss 086 exists to kill.

**Preview.** Opened this PR’s preview host, not `travis-psi`. Redirected to Vercel SSO. Did not sign in. Did not reach Voice / Log / Type.

**DATABASE_URL:** unset. Engineer handoff does not print a verify row from a run that had the URL. No SQL on this cut.

## Test

Walked [`HOTFIX-086-RUNTIME-IS-THE-APP-TEST.md`](./HOTFIX-086-RUNTIME-IS-THE-APP-TEST.md).

**URL I opened:** https://travis-git-cursor-runtime-verify-137d53-wale-omotayos-projects.vercel.app  
**Device:** this bind (no phone).

### 1. npm test
**I saw:** `472` pass, `0` fail. Includes `src/runtime/app-worked.test.ts` — generate miss fails think-walk; user line alone fails; named unwired fails; speakable Travis post passes without grading; dest leave is running/queued.

### 2. runtime-doors on this deploy URL
**I saw:** CI run [`34555440214`](https://github.com/bywale-com/travis/actions/runs/34555440214) — `0` pass / `5` fail on preview URL. Walks consumed SSE to `done`, read tape, dumped on miss. Fail reason on think-walks: `Travis error: Cannot use import statement outside a module` (Deep Agents ESM on generate — 086 lock says do not remint `/node`). Dest walk failed earlier recuts on leave scoring; latest plant scores leave only. I did not run `test:runtime` locally — `RUNTIME_BASE_URL` and `TRAVIS_TEST_OPERATOR_COOKIE` unset in this bind.

### 3. Glass
**I saw:** CI tape rows use `status/travis` + `Travis error: …`, not `?? · run error`. Matches lock.

### 4. Red runtime-doors fresh-adds fail-look
**I saw:** step planted on this branch. That CI run used workflow from `main` before the fresh-add commit; PR does not carry `fail-look` from that red run. Live after merge per hotfix.

### 5. I saw
**I saw:** ________ (human fills after emerge)

**Steps I could not do (human):** Vercel team SSO on preview. Type dest Travis on the phone. Talk / Voice wrap on a phone. Confirm all five walks green once Travis generate works on preview. Walk step 5. Verify `fail-look` fresh-add after merge. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet on this preview (SSO, then smoke 1–5). Same PR. No cousin. No `fail-look`.
