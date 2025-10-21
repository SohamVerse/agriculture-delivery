import Razorpay from "razorpay"
import crypto from "crypto"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay credentials not found. Payment features will be disabled.")
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export interface CreateOrderParams {
  amount: number // in INR
  currency?: string
  receipt?: string
  notes?: Record<string, any>
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const { amount, currency = "INR", receipt, notes } = params

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes,
    })

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    return {
      success: false,
      error: "Failed to create payment order",
    }
  }
}

export interface VerifyPaymentParams {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function verifyRazorpayPayment(params: VerifyPaymentParams): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex")

    return expectedSignature === razorpay_signature
  } catch (error) {
    console.error("Payment verification error:", error)
    return false
  }
}

export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return {
      success: true,
      payment,
    }
  } catch (error) {
    console.error("Error fetching payment details:", error)
    return {
      success: false,
      error: "Failed to fetch payment details",
    }
  }
}

