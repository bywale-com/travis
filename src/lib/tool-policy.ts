/**
 * Hotfix 040 — what "safe" means for a Travis tool call.
 *
 * Definition, so it can be argued with and extended:
 *
 *   A tool call is safe when its effect is one the founder would predict from
 *   what they just said, and when any effect they cannot undo was confirmed
 *   first.
 *
 * That is made operational by classifying every tool by what it does to the
 * world, then attaching rules to the class rather than to the tool. Adding a
 * tool means adding one policy line; the rules already written then apply to
 * it. Adding a rule means writing one guard; every tool of that class is
 * covered at once.
 *
 * Fails closed on purpose: a tool with no policy entry cannot run, so it is
 * impossible to ship a new tool and forget to classify it. `policyCoverage`
 * turns "how much of this have we done" into a number a test can assert.
 */

export type ToolClass =
  /** No effect on the world. Cheap to be wrong about. */
  | "read"
  /** Spends money or starts work somewhere else. */
  | "write"
  /** Stops or removes something that already existed. */
  | "destructive"
  /** Ends the room. Nothing after it. */
  | "terminal";

export type ToolPolicy = {
  cls: ToolClass;
  /** Same call, same args, inside this window is a mistake, not an intent. */
  dedupeWindowMs?: number;
  /** Cannot fire on the first ask; needs the founder to say it twice. */
  requiresConfirm?: boolean;
};

export const TOOL_POLICY: Record<string, ToolPolicy> = {
  list_seats: { cls: "read" },
  queue_snapshot: { cls: "read" },
  work_in_flight: { cls: "read" },
  read_seat_reply: { cls: "read" },
  search_room: { cls: "read" },
  list_os: { cls: "read" },
  read_os: { cls: "read" },
  write_os: { cls: "write" },
  list_initiatives: { cls: "read" },
  read_initiative: { cls: "read" },
  list_backlog: { cls: "read" },
  file_plan: { cls: "write" },
  mark_initiative_done: { cls: "write" },
  rename_initiative: { cls: "write" },
  rename_room: { cls: "write" },
  set_view: { cls: "write" },
  send_to_seat: { cls: "write", dedupeWindowMs: 45_000 },
  dispatch_to_seat: { cls: "write", dedupeWindowMs: 45_000 },
  barge_or_drop: { cls: "destructive" },
  end_session: { cls: "terminal", requiresConfirm: true },
};

export type Verdict = { allow: true } | { allow: false; reason: string };

export function policyFor(name: string): ToolPolicy | null {
  return Object.prototype.hasOwnProperty.call(TOOL_POLICY, name)
    ? TOOL_POLICY[name]
    : null;
}

/** Unknown tool, or a known tool asked to do something irreversible unprompted. */
export function guardToolCall(
  name: string,
  args: Record<string, unknown>,
): Verdict {
  const policy = policyFor(name);
  if (!policy) {
    return {
      allow: false,
      reason: `${name} is not a tool you have. Tell the founder plainly instead of trying something else.`,
    };
  }
  if (policy.requiresConfirm && args.confirm !== true) {
    return {
      allow: false,
      reason:
        "That cannot be undone. Say what it will do, ask the founder to confirm, and only call again with confirm true once they have.",
    };
  }
  return { allow: true };
}

export function dedupeWindowFor(name: string): number | null {
  return policyFor(name)?.dedupeWindowMs ?? null;
}

export function duplicateRefusal(seatLabel: string, seconds: number): string {
  return `You already sent that exact line to ${seatLabel} ${seconds}s ago and it is still in this room. Not sending it twice. Use work_in_flight to see where it got to.`;
}

/**
 * Which declared tools carry a policy. A test asserts `missing` is empty, so
 * coverage is a fact rather than a memory.
 */
export function policyCoverage(declaredNames: string[]): {
  covered: string[];
  missing: string[];
  byClass: Record<ToolClass, string[]>;
} {
  const covered: string[] = [];
  const missing: string[] = [];
  const byClass: Record<ToolClass, string[]> = {
    read: [],
    write: [],
    destructive: [],
    terminal: [],
  };
  for (const name of declaredNames) {
    const policy = policyFor(name);
    if (!policy) {
      missing.push(name);
      continue;
    }
    covered.push(name);
    byClass[policy.cls].push(name);
  }
  return { covered, missing, byClass };
}
