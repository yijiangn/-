import {
  deleteConversationService,
  renameConversationService,
  listMessagesService,
} from "@/lib/supabase/chat-repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await listMessagesService(params.id);
    return Response.json(messages);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await request.json();
    if (!title) {
      return Response.json({ error: "title required" }, { status: 400 });
    }
    await renameConversationService(params.id, title);
    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteConversationService(params.id);
    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
