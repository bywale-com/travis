# House PRs

**Seat:** Technical PM.  
**Not a packet. Not a hotfix.** The Action does not wake SA or Engineer.

When there is **no** active packet or hotfix PR, stamps and process locks go here. Open the PR, push immediately. Do not ride a finished cut.

## Three title classes

| Title starts with | What it is | Wakes |
|-------------------|------------|--------|
| `Packet NNN —` | Face + test + SA/Engineer plant | `**Wake:** sa` → SA |
| `Hotfix NNN —` | Engineer cut | `HOTFIX-NNN` file → Engineer |
| `House —` | Trail, process, naming, hygiene | Nothing |

Exact prefix. Em dash. The rest of the title is the lock in one clause.

```text
House — test sheets are exact; no active cut opens House
```

Branch may stay `cursor/house-<slug>-35b2`. No `PM-PACKET-*.md`. No `HOTFIX-*.md`.

## Must-not

- Title it as a packet or a hotfix so the Action fires.
- Leave the stamp only in chat.
- Recut a test sheet on a House PR unless the founder asked for the recut.
