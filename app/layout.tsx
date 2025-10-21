import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/components/providers/cart-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { EnhancedChatbot } from "@/components/chatbot/enhanced-chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgriDeliver - Online Agriculture Delivery System",
  description: "Your trusted partner for agricultural products delivery",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
                <Navbar />
                <main className="min-h-[calc(100vh-140px)]">{children}</main>
                <Footer />
                <EnhancedChatbot />
                <Toaster />
              </div>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
