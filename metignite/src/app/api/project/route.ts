import { kv } from "@vercel/kv";

// GET /api/project?id=<projectId>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing project ID" }, { status: 400 });
  }

  try {
    const project = await kv.get(`project:${id}`);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch {
    // KV not configured -- return 503 so client falls back to localStorage
    return Response.json(
      { error: "Cloud storage not configured", fallback: true },
      { status: 503 }
    );
  }
}

// POST /api/project -- save project
export async function POST(request: Request) {
  try {
    const project = await request.json();
    if (!project.id) {
      return Response.json({ error: "Missing project ID" }, { status: 400 });
    }

    await kv.set(`project:${id(project)}`, project, { ex: 60 * 60 * 24 * 90 }); // 90 day TTL
    // Also index by a user-friendly slug for sharing
    if (project.context?.projectName) {
      const slug = project.context.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      await kv.set(`project:slug:${slug}`, project.id, { ex: 60 * 60 * 24 * 90 });
    }

    return Response.json({ saved: true, id: project.id });
  } catch {
    return Response.json(
      { error: "Cloud storage not configured", fallback: true },
      { status: 503 }
    );
  }
}

function id(project: { id: string }) {
  return project.id;
}
