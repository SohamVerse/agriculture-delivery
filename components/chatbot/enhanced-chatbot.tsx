"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  MessageCircle,
  X,
  Send,
  ShoppingCart,
  History,
  Plus,
  Trash2,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  products?: ProductCard[]
}

interface ProductCard {
  _id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  category: string
}

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

interface ChatSession {
  chatId: string
  title: string
  lastMessage: string
  updatedAt: Date
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function EnhancedChatbot() {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Set userId from auth or generate guest ID
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserId(user.id)
    } else if (!userId) {
      setUserId("guest_" + Date.now())
    }
  }, [user, isAuthenticated])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  useEffect(() => {
    if (isOpen && !currentChatId) {
      // Start with welcome message
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your AgriDeliver assistant. How can I help you today? 🌾",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, currentChatId])

  // Load chat sessions
  const loadChatSessions = async () => {
    try {
      const response = await fetch(`/api/chatbot/sessions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setChatSessions(data.sessions)
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error)
    }
  }

  // Load specific chat session
  const loadChatSession = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chatbot/session/${chatId}?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setCart(data.cart || [])
        setCurrentChatId(chatId)
        setShowSidebar(false)
      }
    } catch (error) {
      console.error("Error loading chat session:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true)

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          userId,
          chatId: currentChatId,
          cart,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const botMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          products: data.products,
        }

        setMessages((prev) => [...prev, botMessage])
        setCart(data.cart)

        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId)
        }
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: ProductCard) => {
    const existingItem = cart.find((item) => item.product_id === product._id)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product._id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          product_id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
        },
      ])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      setLoading(true)

      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          chatId: currentChatId,
          items: cart,
          totalAmount: getTotalAmount(),
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "AgriDeliver",
        description: "Agricultural Products",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyResponse.ok) {
            // Clear cart and show success message
            setCart([])
            setShowCart(false)

            const successMessage: Message = {
              role: "assistant",
              content: `🎉 Payment successful! Your order has been placed. Order ID: ${orderData.orderId}. You'll receive a confirmation email shortly.`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, successMessage])
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#16a34a",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setCurrentChatId("")
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AgriDeliver assistant. How can I help you today? 🌾",
        timestamp: new Date(),
      },
    ])
    setShowSidebar(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {cart.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-red-500">
            {cart.length}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[450px] max-h-[85vh] bg-white rounded-lg shadow-2xl border border-green-200 z-50 flex overflow-hidden">
          {/* Sidebar for chat history */}
          {showSidebar && (
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-sm">Chat History</h3>
                <Button onClick={startNewChat} size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
              <ScrollArea className="flex-1 h-[500px]">
                {chatSessions.map((session) => (
                  <button
                    key={session.chatId}
                    onClick={() => loadChatSession(session.chatId)}
                    className={`w-full p-3 text-left hover:bg-gray-100 border-b border-gray-200 ${
                      currentChatId === session.chatId ? "bg-green-50" : ""
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{session.lastMessage}</p>
                  </button>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold">AgriBot</h3>
                  <p className="text-xs text-green-100">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-green-700"
                  onClick={() => {
                    setShowSidebar(!showSidebar)
                    if (!showSidebar) loadChatSessions()
                  }}
                >
                  <History className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-green-700 relative"
                  onClick={() => setShowCart(!showCart)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-[10px] p-0">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Cart View */}
            {showCart && (
              <div className="flex-1 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold">Shopping Cart</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4 h-[300px]">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3 min-h-full">
                      {cart.map((item) => (
                        <div key={item.product_id} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                ₹{item.price} × {item.quantity}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">₹{getTotalAmount().toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Messages View */}
            {!showCart && (
              <>
                <ScrollArea className="flex-1 px-4 py-2 h-[400px]">
                  <div className="flex flex-col gap-3 min-h-full">
                    {messages.map((message, index) => (
                      <div key={index}>
                        <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Product Cards */}
                        {message.products && message.products.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {message.products.map((product) => (
                              <div
                                key={product._id}
                                className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <p className="text-xs font-semibold truncate">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold text-green-600">₹{product.price}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(product)}
                                    className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || loading}
                      size="icon"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

