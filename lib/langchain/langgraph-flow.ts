import { StateGraph, END, START } from "@langchain/langgraph"
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages"
import { detectIntent } from "./intent-detector"
import {
  searchProducts,
  getProductsByCategory,
  getAllCategories,
  getWebsiteKnowledge,
  getRecommendedProducts,
  getGeminiModel,
  getUserOrders,
  searchOrderById,
} from "./retriever"
import { CartItem, ProductCard } from "@/lib/types/chatbot"
import { MongoDBChatMessageHistory } from "./memory"

// Define the state interface
interface GraphState {
  messages: BaseMessage[]
  intent: string
  entities: Record<string, any>
  products: ProductCard[]
  cart: CartItem[]
  userId: string
  chatId: string
  nextAction: string
  context: string
}

// Node 1: Process user input and detect intent
async function processUserInput(state: GraphState): Promise<Partial<GraphState>> {
  const lastMessage = state.messages[state.messages.length - 1]
  const userMessage = lastMessage.content as string

  // Detect intent
  const intentResult = await detectIntent(userMessage)

  console.log("Intent detected:", intentResult)

  return {
    intent: intentResult.intent,
    entities: intentResult.entities,
    nextAction: intentResult.intent,
  }
}

// Node 2: Fetch product data
async function fetchProductData(state: GraphState): Promise<Partial<GraphState>> {
  const { intent, entities } = state
  let products: ProductCard[] = []

  try {
    if (intent === "search_product") {
      if (entities.category) {
        products = await getProductsByCategory(entities.category)
      } else if (entities.productName) {
        products = await searchProducts(entities.productName)
      } else {
        // Get recent or popular products
        products = await getRecommendedProducts()
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  return {
    products,
  }
}

// Node 3: Fetch website knowledge (FAQ, policies)
async function fetchWebsiteKnowledge(state: GraphState): Promise<Partial<GraphState>> {
  const lastMessage = state.messages[state.messages.length - 1]
  const userMessage = lastMessage.content as string

  const knowledge = await getWebsiteKnowledge(userMessage)

  return {
    context: knowledge || "No specific information found.",
  }
}

// Node 6: Fetch order information
async function fetchOrderData(state: GraphState): Promise<Partial<GraphState>> {
  const { intent, entities, userId } = state

  let orderContext = ""

  try {
    if (intent === "order_status" && entities.orderId) {
      // Search specific order
      const order = await searchOrderById(entities.orderId, userId)
      if (order) {
        orderContext = `Order ${order.id}: Status - ${order.status}, Total - ₹${order.total}, Items - ${order.items.length}, Date - ${new Date(order.date).toLocaleDateString()}`
      } else {
        orderContext = "Order not found. Please check your order ID."
      }
    } else if (intent === "order_status") {
      // Get recent orders
      const orders = await getUserOrders(userId, 3)
      if (orders.length > 0) {
        orderContext = orders
          .map(
            (o, i) =>
              `${i + 1}. Order ${o.id.slice(-8)}: ${o.status} - ₹${o.total} - ${new Date(o.date).toLocaleDateString()}`,
          )
          .join("\n")
      } else {
        orderContext = "You don't have any orders yet."
      }
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    orderContext = "Unable to fetch order information at this time."
  }

  return {
    context: orderContext,
  }
}

// Node 4: Generate response
async function generateResponse(state: GraphState): Promise<Partial<GraphState>> {
  const { intent, messages, products, cart, context, entities } = state

  const model = getGeminiModel()

  let systemPrompt = `You are an intelligent agriculture eCommerce assistant for AgriDeliver. 
You help farmers and customers with product recommendations, orders, and agricultural advice.

Current context:
- User intent: ${intent}
- Available products: ${products.length > 0 ? products.map((p) => `${p.name} (₹${p.price})`).join(", ") : "None"}
- Cart items: ${cart.length > 0 ? cart.map((c) => `${c.name} x${c.quantity}`).join(", ") : "Empty"}
${context ? `- Knowledge base: ${context}` : ""}

Guidelines:
1. Be conversational and helpful
2. If products are available, mention them with prices
3. For cart operations, confirm the action
4. Use emojis appropriately 🌾🚜🌱
5. Support both English and Hindi
6. Keep responses concise but informative

Respond naturally based on the user's intent.`

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    ...messages.slice(-5), // Last 5 messages for context
  ])

  const responseText = response.content as string

  return {
    messages: [...messages, new AIMessage(responseText)],
  }
}

// Node 5: Handle cart operations
async function handleCartOperation(state: GraphState): Promise<Partial<GraphState>> {
  const { intent, entities, products, cart } = state
  let updatedCart = [...cart]

  if (intent === "add_to_cart" && products.length > 0) {
    const product = products[0]
    const quantity = entities.quantity || 1

    const existingItemIndex = updatedCart.findIndex((item) => item.product_id === product._id)

    if (existingItemIndex >= 0) {
      updatedCart[existingItemIndex].quantity += quantity
    } else {
      updatedCart.push({
        product_id: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url,
      })
    }
  } else if (intent === "remove_from_cart" && entities.productName) {
    updatedCart = updatedCart.filter(
      (item) => !item.name.toLowerCase().includes(entities.productName.toLowerCase()),
    )
  }

  return {
    cart: updatedCart,
  }
}

// Routing function to determine next node
function routeIntent(state: GraphState): string {
  const { intent } = state

  switch (intent) {
    case "search_product":
      return "fetch_products"
    case "add_to_cart":
      return "fetch_products"
    case "remove_from_cart":
      return "handle_cart"
    case "view_cart":
      return "generate_response"
    case "checkout":
      return "generate_response"
    case "faq":
      return "fetch_knowledge"
    case "order_status":
      return "fetch_orders"
    default:
      return "generate_response"
  }
}

// Build the graph
export function createChatbotGraph() {
  const workflow = new StateGraph<GraphState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
      },
      intent: {
        value: (x?: string, y?: string) => y ?? x ?? "general",
        default: () => "general",
      },
      entities: {
        value: (x?: Record<string, any>, y?: Record<string, any>) => y ?? x ?? {},
        default: () => ({}),
      },
      products: {
        value: (x?: ProductCard[], y?: ProductCard[]) => y ?? x ?? [],
        default: () => [],
      },
      cart: {
        value: (x?: CartItem[], y?: CartItem[]) => y ?? x ?? [],
        default: () => [],
      },
      userId: {
        value: (x?: string, y?: string) => y ?? x ?? "",
        default: () => "",
      },
      chatId: {
        value: (x?: string, y?: string) => y ?? x ?? "",
        default: () => "",
      },
      nextAction: {
        value: (x?: string, y?: string) => y ?? x ?? "",
        default: () => "",
      },
      context: {
        value: (x?: string, y?: string) => y ?? x ?? "",
        default: () => "",
      },
    },
  })

  // Add nodes
  workflow.addNode("process_input", processUserInput)
  workflow.addNode("fetch_products", fetchProductData)
  workflow.addNode("fetch_knowledge", fetchWebsiteKnowledge)
  workflow.addNode("fetch_orders", fetchOrderData)
  workflow.addNode("handle_cart", handleCartOperation)
  workflow.addNode("generate_response", generateResponse)

  // Add edges
  workflow.addEdge(START, "process_input")

  workflow.addConditionalEdges("process_input", routeIntent, {
    fetch_products: "fetch_products",
    fetch_knowledge: "fetch_knowledge",
    fetch_orders: "fetch_orders",
    handle_cart: "handle_cart",
    generate_response: "generate_response",
  })

  workflow.addEdge("fetch_products", "handle_cart")
  workflow.addEdge("handle_cart", "generate_response")
  workflow.addEdge("fetch_knowledge", "generate_response")
  workflow.addEdge("fetch_orders", "generate_response")
  workflow.addEdge("generate_response", END)

  return workflow.compile()
}

// Main function to process a chat message
export async function processChatMessage(
  userMessage: string,
  userId: string,
  chatId: string,
  currentCart: CartItem[] = [],
): Promise<{
  response: string
  products: ProductCard[]
  cart: CartItem[]
  intent: string
}> {
  const graph = createChatbotGraph()

  // Load chat history
  const memory = new MongoDBChatMessageHistory(userId, chatId)
  const history = await memory.getMessages()

  // Initial state
  const initialState: GraphState = {
    messages: [...history, new HumanMessage(userMessage)],
    intent: "general",
    entities: {},
    products: [],
    cart: currentCart,
    userId,
    chatId,
    nextAction: "",
    context: "",
  }

  // Run the graph
  const result = await graph.invoke(initialState)

  // Save messages to history
  await memory.addUserMessage(userMessage)
  const lastMessage = result.messages[result.messages.length - 1]
  await memory.addAIMessage(lastMessage.content as string)

  return {
    response: lastMessage.content as string,
    products: result.products,
    cart: result.cart,
    intent: result.intent,
  }
}

