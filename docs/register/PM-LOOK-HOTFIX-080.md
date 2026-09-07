# PM look — 080 Deep Agents must answer

**Packet:** HOTFIX-080  
**Change packet:** none (hotfix)  
**PR:** https://github.com/bywale-com/travis/pull/151  
**Preview:** https://travis-git-cursor-hotfix-080-deep-22fe61-wale-omotayos-projects.vercel.app  
**Verdict:** Pass

## Look

Lock ([`HOTFIX-080-DEEPAGENTS-ESM.md`](./HOTFIX-080-DEEPAGENTS-ESM.md) + 14:45): two lived Type sends in room Travis (`0e8875f8-283b-4dae-bf54-76c82a05b6ef`) hit `invokeDeepAgent` and died `Cannot use import statement outside a module`. Status was `speakable: false` and had no word “error,” so the Log hid it. Calling `Travis` still answered (vocative; kit never loads). Cut: (1) Deep Agents must run on the live send — hang so Vercel `require()` is not browser ESM. (2) If import/invoke still throws, the six-step OpenAI Responses loop is fallback for this generate (same tools, same key). (3) A generate miss must show on the Log (`Travis error: …` or other `/error/` text). Do not remint dest-with-context. Do not put Hear it / Skip **buttons** back.

Plant (Engineer `4db1f80`, handoff last plant **080 Deep Agents must answer**):

```5:10:src/server/travis-deep-agent.ts
import {
  createDeepAgent,
  registerHarnessProfile,
  StateBackend,
} from "deepagents/node";
```

```4:16:next.config.ts
  serverExternalPackages: [
    "@cursor/sdk",
    "deepagents",
    "deepagents/node",
    "langchain",
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
    "@langchain/langgraph-checkpoint",
    "langsmith",
    "openai",
  ],
```

```166:184:src/server/travis-openai.ts
  try {
    try {
      // Load after the send route has already returned SSE. A static import
      // of deepagents on this module made finalize/send/live-token HTML 500
      // at function load — the phone then parsed <!DOCTYPE as JSON.
      // 080: hang `deepagents/node` so Vercel require() hits CJS, not browser ESM.
      const { invokeDeepAgent } = await import("@/server/travis-deep-agent");
      return await invokeDeepAgent({
        sessionId: params.sessionId,
        prompt: params.prompt,
        room,
      });
    } catch {
      return await generateTravisTextViaResponses({
        sessionId: params.sessionId,
        prompt: params.prompt,
        room,
      });
    }
```

Fallback is the restored six-step Responses loop (`generateTravisTextViaResponses`, same `TRAVIS_TOOL_DECLS` / `OPENAI_API_KEY` / `TRAVIS_TEXT_MODEL`). If that throw still escapes, `pipeTravisText` writes `travisGenerateMiss`:

```6:15:src/lib/travis-miss.ts
export function isVisibleLogStatus(text: string): boolean {
  return /error/i.test(text);
}

/** Status text the Log will show. Do not write `Travis: <no error>`. */
export function travisGenerateMiss(message: string): string {
  const msg = message.replace(/\s+/g, " ").trim() || "generate failed";
  if (isVisibleLogStatus(msg)) return `Travis: ${msg}`;
  return `Travis error: ${msg}`;
}
```

Log filter in `Room.tsx` uses that helper (`threadTurns` at 2376–2377). `room-context.ts` `isContextWorthy` does the same. Dest-with-context files have **no diff** vs `main` (`d1bddae`). No Hear it / Skip **buttons** in `src/components/*.tsx`. Spoken invites stay.

`npx tsx --test src/lib/travis-miss.test.ts src/lib/one-pr.test.ts` — 3 pass, 0 fail. Lived line `Travis: Cannot use import statement outside a module` is hidden; `travisGenerateMiss` of that string is `Travis error: …` and visible.

**Tape I queried** (`DATABASE_URL` set; room `0e8875f8-…`):

| seq | kind | speakable | text |
|-----|------|-----------|------|
| 897 | user | true | `Travis` |
| 898 | agent_post | true | `Yep, I’m here…` |
| 899 | user | true | lived question |
| 900 | status | false | `Travis: Cannot use import statement outside a module` |
| 901 | user | true | same question |
| 902 | status | false | same import line |

Latest seq is still **902**. That is production psi after 079, **not** this plant. This PR is unmerged. Do not treat psi as the plant. Engineer handoff does not print a verify `agent_post` from a run that had the URL.

**Preview.** Opened this PR’s preview host, not `travis-psi`. Phone viewport (390×844). Redirected to Vercel SSO (`vercel.com/login?next=…sso-api?url=…travis-git-cursor-hotfix-080-deep-22fe61…`). I did not sign in. I did not see Voice / Log / Type glass. Do not fail a hotfix look for that.

## Test

Walked [`HOTFIX-080-DEEPAGENTS-ESM-TEST.md`](./HOTFIX-080-DEEPAGENTS-ESM-TEST.md).

**URL I opened:** https://travis-git-cursor-hotfix-080-deep-22fe61-wale-omotayos-projects.vercel.app  
**Device:** this bind (no phone).  
**Talk | Type | Voice:** never reached the desk.

### A.1 Type one question
**I saw:** SSO wall. Not Log. Not Type. Did not send the lived line. Did not see an `agent_post`. Did not see orange `Unexpected token '<'`.

### B.1 Send once more
**I saw:** did not Type a second line.

**Grain I could walk:** `deepagents/node` + `serverExternalPackages`. Responses fallback on throw. Miss text says `error` so the Log keeps it. Dest-with-context not reminted. Hear / Skip buttons stay off. Named tape rows match the lock. `travis-miss` tests pass.

**After:** no Hear it / Skip buttons in the planted face.

**Steps I could not do (human):** Vercel team SSO. Type the lived line on this preview. A second send. Talk on a phone. Confirm a Travis `agent_post` on the live desk after this plant is reachable. Those are the human’s. I do not fail the look for them.

## Loop

Pass: emerged. Human may walk the same sheet on this preview (SSO, then A–B). Same PR. No cousin. No `fail-look`.
