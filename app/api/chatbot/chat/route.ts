import { type NextRequest, NextResponse } from "next/server"
import { processChatMessage } from "@/lib/langchain/langgraph-flow"
import { getChatSession } from "@/lib/langchain/memory"
import clientPromise from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { message, userId, chatId, cart } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    // Use existing chatId or create new one
    const activeChatId = chatId || uuidv4()

    // Get current cart from session or use provided
    let currentCart = cart || []

    if (!cart) {
      const session = await getChatSession(userId, activeChatId)
      if (session && session.cart) {
        currentCart = session.cart
      }
    }

    // Process message through LangGraph
    const result = await processChatMessage(message, userId, activeChatId, currentCart)

    // Update cart in session
    const client = await clientPromise
    const db = client.db("agridelivery")

    await db.collection("chat_sessions").updateOne(
      {
        user_id: userId,
        chat_id: activeChatId,
      },
      {
        $set: {
          cart: result.cart,
          updatedAt: new Date(),
        },
      },
    )

    // Auto-generate title for new chats
    if (!chatId) {
      const title = message.substring(0, 50) + (message.length > 50 ? "..." : "")
      await db.collection("chat_sessions").updateOne(
        {
          user_id: userId,
          chat_id: activeChatId,
        },
        {
          $set: { title },
        },
      )
    }

    return NextResponse.json({
      response: result.response,
      products: result.products,
      cart: result.cart,
      intent: result.intent,
      chatId: activeChatId,
    })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      {
        response: "I'm experiencing some technical difficulties. Please try again in a moment. 🔧",
        products: [],
        cart: [],
      },
      { status: 200 },
    )
  }
}

