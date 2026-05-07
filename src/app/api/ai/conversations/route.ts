import {
  listConversationsService,
  createConversationService,
} from "@/lib/supabase/chat-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conversations = await listConversationsService();
    return Response.json(conversations);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const conversation = await createConversationService(body);
    return Response.json(conversation);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
