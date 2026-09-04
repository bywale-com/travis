# Work-repo tree (template)

This is the accurate skeleton of a Travis-shaped git repo. File these paths. Do not invent cousins. Unfold is later — these rows are house contents.

```text
AGENTS.md                          Engineer always-on
README.md                          Product one-liner + Implementation trail (newest first)
docs/
  README.md                        Three pastes + identity
  seats/
    pm.md                          PM process (specimen)
    sa.md                          SA process
    engineer.md                    Engineer process
  register/
    PHASE-ONE.md                   Thesis — does not move every stamp
    PHASE-ONE-LOG.md               PM trail — Current + append
    SYSTEMS-ANALYST-LOG.md         SA trail
    ENGINEER-HANDOFF.md            Engineer pickup
    HOTFIXES.md                    Hotfix index (next number)
    initiatives/                   One folder per pocket — context + what changed
    PLATES-*.md                    Face glass when signed
    plates/                        PNG plates
    PM-PACKET-*.md                 PM → SA (same PR as the pocket)
    SYSTEMS-CHANGE-PACKET-NNN-*.md SA → Engineer (same PR as the pocket)
    ENVELOPE-*.md                  Pass-on commits on that PR
    HOTFIX-NNN-*.md                Engineer receipts — they get merged
  build-foundation/
    PROJECT-BRIEF.md               What to build next
    00-rudiments.md                Tokens, surfaces, How
    01–08 + cursor-rules/          Visual + overlay + parametric law
  method/
    00-INDEX.md
    DECISION-CONSTITUTION.md
    TWO-COLUMN-SYNTHESIS.md
src/
  app/api/                         HTTP doors
  components/                      Face (Room, composer, plates/)
  lib/                             Pure grain + *.test.ts
  server/                          Machine
  server/db/                       schema + migrate
  theme/                           Tokens
  surfaces/                        Surface registry
```

Not OS folders (do not put these under `/` in the house): rooms, agents.

Do not forget: `HOTFIXES.md` numbering; Implementation line on root README; Current pointer on both logs; tests next to `src/lib`; plates in register not in `src/`. Cursor rule copies live under `docs/build-foundation/cursor-rules/` and in the workspace `.cursor/rules` — same law, two places.
