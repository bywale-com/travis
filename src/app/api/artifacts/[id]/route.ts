import { NextResponse } from "next/server";
import {
  artifactContentType,
  dispositionFilename,
} from "@/lib/artifact-kind";
import { describeServerError } from "@/lib/http";
import { artifactForProxy } from "@/server/artifacts";
import { downloadCursorArtifact } from "@/server/cursor-port";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const artifactId = id.trim();
    if (!artifactId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const row = await artifactForProxy(artifactId);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const bytes = await downloadCursorArtifact({
      agentId: row.cursorAgentId,
      path: row.path,
    });
    if (!bytes) {
      return NextResponse.json({ error: "Cursor download failed" }, { status: 502 });
    }
    const filename = dispositionFilename(row.filename);
    const type = artifactContentType(row.kind, row.path);
    const disposition =
      row.kind === "image"
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`;
    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[travis] artifact proxy failed:", err);
    return NextResponse.json(
      { error: describeServerError(err) },
      { status: 500 },
    );
  }
}
