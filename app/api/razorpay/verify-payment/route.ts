import { type NextRequest, NextResponse } from "next/server"
import { verifyRazorpayPayment } from "@/lib/razorpay"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify payment signature
    const isValid = verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update order in database
    const client = await clientPromise
    const db = client.db("agridelivery")

    const updateResult = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          payment_status: "paid",
          razorpay_payment_id,
          razorpay_signature,
          updated_at: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get the updated order
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })

    // Update product stock
    if (order && order.items) {
      for (const item of order.items) {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.product_id) },
          {
            $inc: { stockQuantity: -item.quantity },
          },
        )
      }
    }

    // Clear cart after successful payment
    if (order && order.user_id) {
      await db.collection("cart").deleteMany({ user_id: order.user_id })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order,
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

