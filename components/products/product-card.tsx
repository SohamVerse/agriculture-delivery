"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  name_hi?: string
  description: string
  description_hi?: string
  price: string | number // Allow both string and number
  stock_quantity: number
  imageUrl?: string
  category_id: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await addToCart(product.id.toString(), 1)
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const displayName = language === "hi" && product.name_hi ? product.name_hi : product.name
  const displayDescription = language === "hi" && product.description_hi ? product.description_hi : product.description

  return (
    <div className="agri-card p-6 group hover:shadow-xl transition-all duration-300">
      <div className="relative mb-4">
        <img
          src={product.imageUrl}
          alt={displayName}
          className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock_quantity === 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500">{t("products.outOfStock")}</Badge>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{displayName}</h3>

        <p className="text-gray-600 text-sm line-clamp-2">{displayDescription}</p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">₹{Number(product.price).toFixed(2)}</div>
          <div className="text-sm text-gray-500">Stock: {product.stock_quantity}</div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0 || loading}
          className="w-full agri-button"
        >
          {loading ? t("common.loading") : t("products.addToCart")}
        </Button>
      </div>
    </div>
  )
}
