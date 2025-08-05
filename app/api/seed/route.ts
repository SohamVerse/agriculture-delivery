import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db("agridelivery")

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("categories").deleteMany({})
    await db.collection("products").deleteMany({})
    await db.collection("orders").deleteMany({})
    await db.collection("cart").deleteMany({})

    console.log("Cleared existing data")

    // Insert Categories
    const categories = [
      {
        _id: new ObjectId(),
        name: "Seeds",
        nameHi: "बीज",
        description: "High quality agricultural seeds",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Fertilizers",
        nameHi: "उर्वरक",
        description: "Organic and chemical fertilizers",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Tools",
        nameHi: "उपकरण",
        description: "Farming tools and equipment",
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Pesticides",
        nameHi: "कीटनाशक",
        description: "Plant protection products",
        createdAt: new Date(),
      },
    ]

    await db.collection("categories").insertMany(categories)

    // Insert Products
    const products = [
      {
        name: "Organic Tomato Seeds",
        nameHi: "जैविक टमाटर के बीज",
        description: "Premium quality organic tomato seeds",
        descriptionHi: "प्रीमियम गुणवत्ता के जैविक टमाटर के बीज",
        price: 299.0,
        stockQuantity: 100,
        categoryId: categories[0]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "NPK Fertilizer",
        nameHi: "एनपीके उर्वरक",
        description: "Balanced NPK fertilizer for all crops",
        descriptionHi: "सभी फसलों के लिए संतुलित एनपीके उर्वरक",
        price: 450.0,
        stockQuantity: 50,
        categoryId: categories[1]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Garden Spade",
        nameHi: "बगीचे की कुदाल",
        description: "Heavy duty garden spade",
        descriptionHi: "भारी शुल्क बगीचे की कुदाल",
        price: 850.0,
        stockQuantity: 25,
        categoryId: categories[2]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Organic Pesticide",
        nameHi: "जैविक कीटनाशक",
        description: "Eco-friendly organic pesticide",
        descriptionHi: "पर्यावरण अनुकूल जैविक कीटनाशक",
        price: 320.0,
        stockQuantity: 75,
        categoryId: categories[3]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Wheat Seeds",
        nameHi: "गेहूं के बीज",
        description: "High yield wheat seeds",
        descriptionHi: "उच्च उत्पादन गेहूं के बीज",
        price: 180.0,
        stockQuantity: 200,
        categoryId: categories[0]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Compost Fertilizer",
        nameHi: "कंपोस्ट उर्वरक",
        description: "Organic compost fertilizer",
        descriptionHi: "जैविक कंपोस्ट उर्वरक",
        price: 250.0,
        stockQuantity: 80,
        categoryId: categories[1]._id,
        imageUrl: "/placeholder.svg?height=300&width=300",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("products").insertMany(products)

    // Insert Admin User
    const adminUser = {
      email: "admin@agridelivery.com",
      password: "admin123", // In production, hash this
      name: "Admin User",
      role: "admin",
      phone: "+91-9876543210",
      address: "Admin Office, Agriculture Hub",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(adminUser)

    // Insert Sample Customer
    const customerUser = {
      email: "customer@example.com",
      password: "customer123", // In production, hash this
      name: "John Farmer",
      role: "customer",
      phone: "+91-9876543211",
      address: "Village Farm, District Agriculture",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(customerUser)

    return NextResponse.json({
      message: "Database seeded successfully!",
      data: {
        categories: categories.length,
        products: products.length,
        users: 2,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
