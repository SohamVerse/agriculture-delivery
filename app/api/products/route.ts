import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const client = await clientPromise
    const db = client.db("agridelivery")

    // Build query
    const query: any = { isActive: true }

    if (category && category !== "all") {
      query.categoryId = new ObjectId(category)
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { nameHi: { $regex: search, $options: "i" } },
        { descriptionHi: { $regex: search, $options: "i" } },
      ]
    }

    // Execute query
    let cursor = db.collection("products").find(query).sort({ createdAt: -1 })

    if (limit) {
      cursor = cursor.limit(Number.parseInt(limit))
    }

    const products = await cursor.toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      id: product._id.toString(),
      _id: product._id.toString(),
      categoryId: product.categoryId.toString(),
    }))

    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
