import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("agridelivery")

    const categories = await db.collection("categories").find({}).sort({ name: 1 }).toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedCategories = categories.map((category) => ({
      ...category,
      id: category._id.toString(),
      _id: category._id.toString(),
    }))

    return NextResponse.json(serializedCategories)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
