import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch user's cart
export async function GET() {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("agridelivery")

    // Get cart items with product details
    const cartItems = await db
      .collection("cart")
      .aggregate([
        { $match: { user_id: authUser.id } },
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            id: { $toString: "$_id" },
            product_id: { $toString: "$product_id" },
            name: "$product.name",
            name_hi: "$product.name_hi",
            price: "$product.price",
            quantity: 1,
            image_url: "$product.image_url",
          },
        },
      ])
      .toArray()

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("agridelivery")

    // Check if product exists
    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check stock
    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingItem = await db
      .collection("cart")
      .findOne({ user_id: authUser.id, product_id: new ObjectId(productId) })

    if (existingItem) {
      // Update quantity
      await db.collection("cart").updateOne(
        { user_id: authUser.id, product_id: new ObjectId(productId) },
        {
          $inc: { quantity: quantity },
          $set: { updated_at: new Date() },
        }
      )
    } else {
      // Add new item
      await db.collection("cart").insertOne({
        user_id: authUser.id,
        product_id: new ObjectId(productId),
        quantity,
        created_at: new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

