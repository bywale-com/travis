import { operatorLinkText } from "@/lib/operator-auth";

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

/** Resend the personal enter URL. Failures stay server-side. */
export async function sendOperatorLinkMail(opts: {
  to: string;
  url: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.error("[travis] RESEND_API_KEY missing — cannot send login link");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.to],
      subject: "Your Travis link",
      text: operatorLinkText(opts.url),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(
      "[travis] resend failed",
      res.status,
      body.replace(/\s+/g, " ").slice(0, 200),
    );
  }
}
