import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import clientPromise from "@/lib/mongodb"
import { ProductCard, WebsiteKnowledge } from "@/lib/types/chatbot"

// Initialize Gemini model
export function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable")
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7,
  })
}

// Search products by name, category, or keyword
export async function searchProducts(query: string, limit: number = 6): Promise<ProductCard[]> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const searchRegex = new RegExp(query, "i")

  const products = await db
    .collection("products")
    .aggregate([
      {
        $match: {
          $or: [{ name: searchRegex }, { nameHi: searchRegex }, { description: searchRegex }],
          isActive: true,
          stockQuantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $limit: limit,
      },
    ])
    .toArray()

  return products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    nameHi: p.nameHi,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    stock: p.stockQuantity,
    category: p.category.name,
  }))
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<ProductCard[]> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const categoryDoc = await db.collection("categories").findOne({
    $or: [{ name: new RegExp(category, "i") }, { nameHi: new RegExp(category, "i") }],
  })

  if (!categoryDoc) {
    return []
  }

  const products = await db
    .collection("products")
    .find({
      categoryId: categoryDoc._id,
      isActive: true,
      stockQuantity: { $gt: 0 },
    })
    .limit(6)
    .toArray()

  return products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    nameHi: p.nameHi,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    stock: p.stockQuantity,
    category: categoryDoc.name,
  }))
}

// Get product by ID
export async function getProductById(productId: string): Promise<ProductCard | null> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const { ObjectId } = require("mongodb")
  const product = await db.collection("products").findOne({
    _id: new ObjectId(productId),
  })

  if (!product) {
    return null
  }

  const category = await db.collection("categories").findOne({
    _id: product.categoryId,
  })

  return {
    _id: product._id.toString(),
    name: product.name,
    nameHi: product.nameHi,
    description: product.description,
    price: product.price,
    image_url: product.imageUrl,
    stock: product.stockQuantity,
    category: category?.name || "Unknown",
  }
}

// Get all categories
export async function getAllCategories(): Promise<Array<{ name: string; nameHi: string; description: string }>> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const categories = await db.collection("categories").find({}).toArray()

  return categories.map((c) => ({
    name: c.name,
    nameHi: c.nameHi,
    description: c.description,
  }))
}

// Get website knowledge by page
export async function getWebsiteKnowledge(query: string): Promise<string> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const searchRegex = new RegExp(query, "i")

  const knowledge = await db
    .collection<WebsiteKnowledge>("website_knowledge")
    .find({
      $or: [{ title: searchRegex }, { content: searchRegex }, { page: searchRegex }],
    })
    .limit(3)
    .toArray()

  if (knowledge.length === 0) {
    return ""
  }

  return knowledge.map((k) => `${k.title}:\n${k.content}`).join("\n\n")
}

// Get recommended products based on cart or recent views
export async function getRecommendedProducts(categoryName?: string, limit: number = 4): Promise<ProductCard[]> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  let query: any = { isActive: true, stockQuantity: { $gt: 0 } }

  if (categoryName) {
    const category = await db.collection("categories").findOne({
      $or: [{ name: new RegExp(categoryName, "i") }, { nameHi: new RegExp(categoryName, "i") }],
    })

    if (category) {
      query.categoryId = category._id
    }
  }

  const products = await db
    .collection("products")
    .aggregate([
      { $match: query },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
    ])
    .toArray()

  return products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    nameHi: p.nameHi,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    stock: p.stockQuantity,
    category: p.category.name,
  }))
}

// Get user orders
export async function getUserOrders(userId: string, limit: number = 5) {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const orders = await db
    .collection("orders")
    .find({ user_id: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()

  return orders.map((o) => ({
    id: o._id.toString(),
    items: o.items,
    total: o.total_amount,
    status: o.payment_status,
    date: o.timestamp,
    paymentId: o.razorpay_payment_id,
  }))
}

// Search order by ID
export async function searchOrderById(orderId: string, userId: string) {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const { ObjectId } = require("mongodb")

  try {
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      user_id: userId,
    })

    if (!order) {
      return null
    }

    return {
      id: order._id.toString(),
      items: order.items,
      total: order.total_amount,
      status: order.payment_status,
      date: order.timestamp,
      paymentId: order.razorpay_payment_id,
    }
  } catch (error) {
    return null
  }
}

