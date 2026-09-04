/**
 * Hotfix 069 — a seat's last room line is not this ticket's answer.
 *
 * Lived 19:10 — Travis read the September 3 cost-panel SA post as if it
 * were the face-gap job stamped a minute earlier. last-by-slug has no
 * ticket. A send that never landed still left that old essay as "what
 * SA said."
 */

export function formatSeatReplyLead(opts: {
  label: string;
  initiativeId?: string;
  hasPost: boolean;
  postOnTicket: boolean;
  sentAfterPost: boolean;
}): string | null {
  const label = opts.label.trim() || "That seat";
  if (opts.initiativeId) {
    if (!opts.postOnTicket) {
      return `${label} has not posted on this ticket.`;
    }
    return null;
  }
  if (!opts.hasPost) return `${label} has not replied in this room yet.`;
  if (opts.sentAfterPost) {
    return `No reply since the last send. Do not treat an older ${label} post as this job.`;
  }
  return null;
}

/** Prefix when we still return a room-wide last line. Not a ticket read. */
export function staleSeatReplyPrefix(label: string): string {
  const name = label.trim() || "That seat";
  return `${name} last said in this room (this is not a ticket read — call read_initiative for a named initiative):`;
}
