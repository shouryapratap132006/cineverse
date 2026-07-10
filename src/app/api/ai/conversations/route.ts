// ============================================================
// /api/ai/conversations — Chat history CRUD
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// In-memory store for conversations (until Prisma models added)
// Will be replaced with DB queries after migration
const conversationStore = new Map<string, {
  id: string; userId: string; title: string; type: string;
  isPinned: boolean; messages: object[]; createdAt: string; updatedAt: string;
}>();

function genId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/ai/conversations — list all conversations for user
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = Array.from(conversationStore.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({ conversations });
}

// POST /api/ai/conversations — create a conversation
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type = "general", messages = [] } = body;

  const id = genId();
  const now = new Date().toISOString();
  const conv = { id, userId, title: title ?? "New Conversation", type, isPinned: false, messages, createdAt: now, updatedAt: now };
  conversationStore.set(id, conv);

  return NextResponse.json(conv, { status: 201 });
}

// PATCH /api/ai/conversations — update (rename/pin)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, isPinned, messages } = body;

  const conv = conversationStore.get(id);
  if (!conv || conv.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (title !== undefined) conv.title = title;
  if (isPinned !== undefined) conv.isPinned = isPinned;
  if (messages !== undefined) conv.messages = messages;
  conv.updatedAt = new Date().toISOString();

  conversationStore.set(id, conv);
  return NextResponse.json(conv);
}

// DELETE /api/ai/conversations — delete a conversation
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const conv = conversationStore.get(id);
  if (!conv || conv.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  conversationStore.delete(id);
  return NextResponse.json({ deleted: true });
}
