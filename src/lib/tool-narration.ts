/**
 * Hotfix 041 — Travis says what it is about to do, before it does it.
 *
 * Voice already feels smarter than Type for a boring reason: in Voice you hear
 * Travis the whole time, and in Type you watch nothing happen for thirty
 * seconds while a tool blocks. Same model, same tools — one of them just talks.
 *
 * So the narration is written here rather than asked of the model: it is
 * deterministic, it costs no tokens, and it cannot be forgotten. It lands in
 * the room log and is never spoken, because reading tool chatter aloud is the
 * spam we already decided against.
 *
 * Instant, self-evident calls get no line. A narration for everything is just
 * a slower way to say nothing.
 */

const SEAT_LABEL: Record<string, string> = {
  pm: "the PM",
  sa: "the SA",
  engineer: "the Engineer",
};

function seat(args: Record<string, unknown>): string {
  return SEAT_LABEL[String(args.seat ?? "")] ?? "that seat";
}

function clip(text: string, cap = 60): string {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return "";
  return flat.length <= cap ? flat : `${flat.slice(0, cap).trimEnd()}…`;
}

export function narrateToolCall(
  name: string,
  args: Record<string, unknown>,
): string | null {
  switch (name) {
    case "dispatch_to_seat": {
      const line = clip(String(args.text ?? ""));
      return line
        ? `Calling ${seat(args)} with “${line}”.`
        : `Calling ${seat(args)}.`;
    }
    case "send_to_seat": {
      const line = clip(String(args.text ?? ""));
      return line
        ? `Calling ${seat(args)} with “${line}”.`
        : `Calling ${seat(args)}.`;
    }
    case "barge_or_drop":
      return args.action === "send"
        ? `Pushing ${seat(args)}'s waiting line through now.`
        : `Dropping ${seat(args)}'s waiting line.`;
    case "mark_initiative_done":
      return "Marking that initiative done.";
    case "rename_initiative":
      return "Renaming that initiative.";
    case "rename_room":
      return "Renaming the room.";
    case "end_session":
      return "Ending the room.";
    case "create_agent": {
      const label = clip(String(args.label ?? ""), 40);
      return label ? `Creating ${label}.` : "Creating an agent.";
    }
    case "sit_agent": {
      const who = clip(String(args.who ?? ""), 40);
      const protocol = clip(String(args.protocol ?? ""), 24);
      if (who && protocol) return `Seating ${who} on ${protocol}.`;
      if (who) return `Seating ${who}.`;
      return "Seating that person.";
    }
    default:
      // list_seats, queue_snapshot, work_in_flight, search_room,
      // list_os, read_os, write_os, list_initiatives, read_initiative,
      // list_backlog, file_plan, read_seat_reply, set_view — instant.
      return null;
  }
}
