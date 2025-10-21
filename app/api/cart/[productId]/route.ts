import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// PUT - Update cart item quantity
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("agridelivery")

    const result = await db.collection("cart").updateOne(
      { user_id: authUser.id, product_id: new ObjectId(params.productId) },
      {
        $set: { quantity, updated_at: new Date() },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("agridelivery")

    const result = await db
      .collection("cart")
      .deleteOne({ user_id: authUser.id, product_id: new ObjectId(params.productId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

