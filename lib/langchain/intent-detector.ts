import { Intent, IntentResult } from "@/lib/types/chatbot"
import { getGeminiModel } from "./retriever"

const INTENT_DETECTION_PROMPT = `You are an intent classifier for an eCommerce chatbot. Analyze the user's message and classify it into one of these intents:

1. **search_product** - User wants to find or browse products
2. **add_to_cart** - User wants to add a product to cart
3. **view_cart** - User wants to see their cart
4. **remove_from_cart** - User wants to remove items from cart
5. **checkout** - User wants to place an order or proceed to payment
6. **order_status** - User asks about their order status
7. **faq** - User asks about policies, shipping, returns, website info
8. **general** - General conversation, greetings, or agricultural advice

Extract entities if applicable:
- productName: name of the product mentioned
- category: category name (seeds, fertilizers, tools, pesticides)
- quantity: number of items
- orderId: order ID if mentioned

Respond ONLY with valid JSON in this exact format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {
    "productName": "product name or null",
    "category": "category or null",
    "quantity": number or null,
    "orderId": "order id or null"
  }
}

User message: `

export async function detectIntent(userMessage: string): Promise<IntentResult> {
  try {
    const model = getGeminiModel()

    const response = await model.invoke([
      {
        role: "user",
        content: INTENT_DETECTION_PROMPT + userMessage,
      },
    ])

    const content = response.content as string
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const result: IntentResult = JSON.parse(jsonMatch[0])

    // Validate intent
    const validIntents: Intent[] = [
      "search_product",
      "add_to_cart",
      "view_cart",
      "checkout",
      "faq",
      "general",
      "order_status",
      "remove_from_cart",
    ]

    if (!validIntents.includes(result.intent)) {
      result.intent = "general"
    }

    return result
  } catch (error) {
    console.error("Intent detection error:", error)
    // Default to general intent on error
    return {
      intent: "general",
      confidence: 0.5,
      entities: {},
    }
  }
}

// Helper function to extract product names from message
export function extractProductNames(message: string): string[] {
  const products: string[] = []
  const commonProducts = [
    "tomato seeds",
    "wheat seeds",
    "rice seeds",
    "npk fertilizer",
    "compost",
    "spade",
    "pesticide",
    "fertilizer",
    "seeds",
  ]

  const lowerMessage = message.toLowerCase()
  for (const product of commonProducts) {
    if (lowerMessage.includes(product)) {
      products.push(product)
    }
  }

  return products
}

// Helper to extract quantity from message
export function extractQuantity(message: string): number | null {
  const quantityMatch = message.match(/(\d+)\s*(piece|pieces|kg|packet|packets|unit|units)?/i)
  if (quantityMatch) {
    return parseInt(quantityMatch[1])
  }
  return null
}

