import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

// DELETE - Clear entire cart
export async function DELETE() {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("agridelivery")

    await db.collection("cart").deleteMany({ user_id: authUser.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

