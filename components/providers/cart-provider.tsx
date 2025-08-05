"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-provider"

interface CartItem {
  id: number
  product_id: number
  name: string
  name_hi?: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (productId: number, quantity?: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalAmount: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setItems([])
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const cartData = await response.json()
        setItems(cartData)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: number, quantity = 1) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const removeFromCart = async (productId: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error)
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setItems([])
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
