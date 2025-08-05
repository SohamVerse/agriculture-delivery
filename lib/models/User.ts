import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: "customer" | "admin"
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  name: string
  nameHi?: string
  description: string
  descriptionHi?: string
  price: number
  stockQuantity: number
  categoryId: ObjectId
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id?: ObjectId
  name: string
  nameHi?: string
  description?: string
  createdAt: Date
}

export interface Order {
  _id?: ObjectId
  userId: ObjectId
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shippingAddress: string
  phone: string
  orderDate: Date
  deliveryDate?: Date
  trackingId: string
}

export interface OrderItem {
  productId: ObjectId
  name: string
  price: number
  quantity: number
}

export interface CartItem {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  quantity: number
  createdAt: Date
}

export interface Conversation {
  _id?: ObjectId
  userId?: ObjectId
  userMessage: string
  botResponse: string
  timestamp: Date
}
