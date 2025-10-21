import { type NextRequest, NextResponse } from "next/server"
import { getAllChatSessions } from "@/lib/langchain/memory"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const sessions = await getAllChatSessions(userId)

    // Format sessions for frontend
    const formattedSessions = sessions.map((session) => ({
      chatId: session.chat_id,
      title: session.title || "New Chat",
      lastMessage: session.messages[session.messages.length - 1]?.content || "",
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
    }))

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

