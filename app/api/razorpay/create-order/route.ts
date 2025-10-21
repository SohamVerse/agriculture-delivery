import { type NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder } from "@/lib/razorpay"
import clientPromise from "@/lib/mongodb"
import { Order, CartItem } from "@/lib/types/chatbot"

export async function POST(request: NextRequest) {
  try {
    const { userId, chatId, items, totalAmount } = await request.json()

    if (!userId || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Create Razorpay order
    // Receipt must be max 40 characters
    const shortReceipt = `ord_${Date.now().toString().slice(-10)}`
    const orderResult = await createRazorpayOrder({
      amount: totalAmount,
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        userId,
        chatId,
        itemCount: items.length,
      },
    })

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
    }

    // Store order in database with pending status
    const client = await clientPromise
    const db = client.db("agridelivery")

    const order: Order = {
      user_id: userId,
      chat_id: chatId,
      items: items as CartItem[],
      total_amount: totalAmount,
      payment_status: "pending",
      razorpay_order_id: orderResult.order.id,
      timestamp: new Date(),
    }

    const result = await db.collection<Order>("orders").insertOne(order)

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      razorpayOrderId: orderResult.order.id,
      amount: totalAmount,
      currency: orderResult.order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

