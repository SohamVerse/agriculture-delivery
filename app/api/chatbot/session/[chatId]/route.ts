import { type NextRequest, NextResponse } from "next/server"
import { getChatSession } from "@/lib/langchain/memory"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const { chatId } = await params

    const session = await getChatSession(userId, chatId)

    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    return NextResponse.json({
      chatId: session.chat_id,
      title: session.title,
      messages: session.messages,
      cart: session.cart || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching chat session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

