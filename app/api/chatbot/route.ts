import { type NextRequest, NextResponse } from "next/server"
import { generateGeminiResponse } from "@/lib/gemini"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate response using Gemini API
    const response = await generateGeminiResponse(message)

    // Store conversation in MongoDB (optional)
    if (userId) {
      try {
        const client = await clientPromise
        const db = client.db("agridelivery")

        await db.collection("conversations").insertOne({
          userId,
          userMessage: message,
          botResponse: response,
          timestamp: new Date(),
        })
      } catch (dbError) {
        console.error("Failed to store conversation:", dbError)
        // Don't fail the request if DB storage fails
      }
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      {
        response:
          "I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance. 🔧",
      },
      { status: 200 }, // Return 200 so the user gets the fallback message
    )
  }
}
