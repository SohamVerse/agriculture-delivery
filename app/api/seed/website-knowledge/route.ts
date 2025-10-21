import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { WebsiteKnowledge } from "@/lib/types/chatbot"

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db("agridelivery")

    // Clear existing knowledge
    await db.collection("website_knowledge").deleteMany({})

    const knowledgeData: Omit<WebsiteKnowledge, "_id">[] = [
      {
        page: "about",
        title: "About AgriDeliver",
        content: `AgriDeliver is India's leading online agricultural products delivery platform. We connect farmers directly with high-quality seeds, fertilizers, tools, and pesticides. Our mission is to empower farmers with easy access to genuine agricultural products at competitive prices. We serve farmers across India with fast delivery and expert support.`,
        createdAt: new Date(),
      },
      {
        page: "shipping",
        title: "Shipping & Delivery Policy",
        content: `We deliver across India within 3-7 business days. Free shipping on orders above ₹1000. Express delivery available in select cities (1-2 days). Orders are shipped via trusted logistics partners. Track your order using the order ID provided after purchase. Delivery charges: ₹50 for orders below ₹1000.`,
        createdAt: new Date(),
      },
      {
        page: "returns",
        title: "Returns & Refund Policy",
        content: `We accept returns within 7 days of delivery for defective or damaged products. Seeds packets must be unopened for returns. Refunds are processed within 5-7 business days. Contact support with order ID and photos for return requests. Shipping charges are non-refundable unless product is defective.`,
        createdAt: new Date(),
      },
      {
        page: "payment",
        title: "Payment Methods",
        content: `We accept multiple payment methods: Credit/Debit Cards, UPI, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery (COD available for orders below ₹5000). All payments are secured through Razorpay. EMI options available on orders above ₹3000.`,
        createdAt: new Date(),
      },
      {
        page: "categories",
        title: "Product Categories",
        content: `Seeds: Vegetable seeds, Wheat seeds, Rice seeds, Organic seeds. Fertilizers: NPK fertilizers, Organic compost, Vermicompost, Liquid fertilizers. Tools: Spades, Hoes, Shovels, Irrigation equipment, Sprayers. Pesticides: Organic pesticides, Fungicides, Herbicides, Insecticides.`,
        createdAt: new Date(),
      },
      {
        page: "support",
        title: "Customer Support",
        content: `Contact us: Email: support@agridelivery.com, Phone: +91-9876543210, WhatsApp: +91-9876543210. Support hours: Monday-Saturday 9 AM - 7 PM. Agricultural expert consultation available. We speak English, Hindi, and regional languages.`,
        createdAt: new Date(),
      },
      {
        page: "quality",
        title: "Quality Assurance",
        content: `All products are sourced from certified manufacturers. Seeds are tested for germination rates. Fertilizers are lab-verified for nutrient content. We guarantee authenticity and quality. 100% genuine products or money back guarantee.`,
        createdAt: new Date(),
      },
      {
        page: "farming-tips",
        title: "Farming Tips & Advice",
        content: `Season-based crop recommendations. Soil testing importance and methods. Organic farming practices. Pest control natural remedies. Water conservation techniques. Crop rotation benefits. Fertilizer application best practices. Post-harvest care.`,
        createdAt: new Date(),
      },
    ]

    await db.collection<WebsiteKnowledge>("website_knowledge").insertMany(knowledgeData)

    return NextResponse.json({
      message: "Website knowledge seeded successfully!",
      count: knowledgeData.length,
    })
  } catch (error) {
    console.error("Error seeding website knowledge:", error)
    return NextResponse.json({ error: "Failed to seed website knowledge" }, { status: 500 })
  }
}

