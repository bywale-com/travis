import { operatorLinkText } from "@/lib/operator-auth";

export type MailSendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "missing_key" | "resend_error"; detail?: string };

function fromAddress(): string {
  const explicit = process.env.TRAVIS_FROM_EMAIL?.trim();
  if (explicit?.includes("@")) return explicit;
  const named = process.env.RESEND_FROM_EMAIL?.trim();
  if (named?.includes("@")) return named;
  const domain = (process.env.MAIL_ROOT_DOMAIN ?? "")
    .trim()
    .replace(/\r/g, "");
  if (domain) {
    const name = named && !named.includes("@") ? named : "Travis";
    return `${name} <noreply@${domain}>`;
  }
  return "Travis <noreply@mail.try-tower.com>";
}

/** Resend the personal enter URL. */
export async function sendOperatorLinkMail(opts: {
  to: string;
  url: string;
}): Promise<MailSendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = fromAddress();
  if (!key) {
    console.error("[travis] operator mail: RESEND_API_KEY missing", {
      from,
      toDomain: opts.to.split("@")[1] ?? "",
    });
    return { ok: false, reason: "missing_key" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: "Your Travis link",
      text: operatorLinkText(opts.url),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const detail = body.replace(/\s+/g, " ").slice(0, 200);
    console.error("[travis] operator mail: resend failed", {
      status: res.status,
      from,
      toDomain: opts.to.split("@")[1] ?? "",
      detail,
    });
    return { ok: false, reason: "resend_error", detail };
  }
  let id: string | undefined;
  try {
    const data = (await res.json()) as { id?: string };
    id = data.id;
  } catch {
    // Resend accepted; id optional for logging.
  }
  console.info("[travis] operator mail: sent", {
    from,
    toDomain: opts.to.split("@")[1] ?? "",
    resendId: id ?? "",
  });
  return { ok: true, id };
}
