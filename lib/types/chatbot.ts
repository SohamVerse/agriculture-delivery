import { ObjectId } from "mongodb"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  metadata?: {
    products?: ProductCard[]
    intent?: string
    action?: string
  }
}

export interface ChatSession {
  _id?: ObjectId
  user_id: string
  chat_id: string
  title: string
  messages: ChatMessage[]
  cart?: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatHistory {
  _id?: ObjectId
  user_id: string
  sessions: {
    chat_id: string
    title: string
    lastMessage: string
    updatedAt: Date
  }[]
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  _id?: ObjectId
  user_id: string
  chat_id: string
  items: CartItem[]
  total_amount: number
  payment_status: "pending" | "paid" | "failed"
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  timestamp: Date
}

export interface ProductCard {
  _id: string
  name: string
  nameHi?: string
  description: string
  price: number
  image_url: string
  stock: number
  category: string
}

export interface WebsiteKnowledge {
  _id?: ObjectId
  page: string
  title: string
  content: string
  embeddings?: number[]
  metadata?: Record<string, any>
  createdAt: Date
}

export type Intent =
  | "search_product"
  | "add_to_cart"
  | "view_cart"
  | "checkout"
  | "faq"
  | "general"
  | "order_status"
  | "remove_from_cart"

export interface IntentResult {
  intent: Intent
  confidence: number
  entities: {
    productName?: string
    category?: string
    quantity?: number
    orderId?: string
  }
}

