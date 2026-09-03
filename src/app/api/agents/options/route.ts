import { permanentRedirect } from "next/navigation";

/** Redirect to the canonical integrations options route. */
export async function GET() {
  return permanentRedirect("/api/integrations/options");
}
