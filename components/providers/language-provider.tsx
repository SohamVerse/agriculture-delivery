"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.cart": "Cart",
    "nav.orders": "Orders",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.register": "Register",

    // Home page
    "hero.title": "Fresh Agricultural Products Delivered to Your Doorstep",
    "hero.subtitle": "Quality seeds, fertilizers, and farming tools for modern agriculture",
    "hero.cta": "Shop Now",

    // Products
    "products.title": "Our Products",
    "products.search": "Search products...",
    "products.filter": "Filter by category",
    "products.addToCart": "Add to Cart",
    "products.outOfStock": "Out of Stock",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.remove": "Remove",

    // Orders
    "orders.title": "Order Tracking",
    "orders.trackingId": "Enter Tracking ID",
    "orders.track": "Track Order",
    "orders.status": "Status",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.phone": "Phone Number",
    "auth.address": "Address",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.loginTitle": "Login to Your Account",
    "auth.registerTitle": "Create New Account",

    // Categories
    "category.seeds": "Seeds",
    "category.fertilizers": "Fertilizers",
    "category.tools": "Tools",
    "category.pesticides": "Pesticides",

    // Common
    "common.price": "Price",
    "common.quantity": "Quantity",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.success": "Success!",
  },
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.products": "उत्पाद",
    "nav.cart": "कार्ट",
    "nav.orders": "ऑर्डर",
    "nav.admin": "एडमिन",
    "nav.login": "लॉगिन",
    "nav.logout": "लॉगआउट",
    "nav.register": "रजिस्टर",

    // Home page
    "hero.title": "ताज़े कृषि उत्पाद आपके दरवाजे तक",
    "hero.subtitle": "आधुनिक कृषि के लिए गुणवत्तापूर्ण बीज, उर्वरक और कृषि उपकरण",
    "hero.cta": "अभी खरीदें",

    // Products
    "products.title": "हमारे उत्पाद",
    "products.search": "उत्पाद खोजें...",
    "products.filter": "श्रेणी के अनुसार फ़िल्टर करें",
    "products.addToCart": "कार्ट में जोड़ें",
    "products.outOfStock": "स्टॉक में नहीं",

    // Cart
    "cart.title": "शॉपिंग कार्ट",
    "cart.empty": "आपका कार्ट खाली है",
    "cart.total": "कुल",
    "cart.checkout": "चेकआउट",
    "cart.remove": "हटाएं",

    // Orders
    "orders.title": "ऑर्डर ट्रैकिंग",
    "orders.trackingId": "ट्रैकिंग आईडी दर्ज करें",
    "orders.track": "ऑर्डर ट्रैक करें",
    "orders.status": "स्थिति",

    // Auth
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.name": "पूरा नाम",
    "auth.phone": "फोन नंबर",
    "auth.address": "पता",
    "auth.login": "लॉगिन",
    "auth.register": "रजिस्टर",
    "auth.loginTitle": "अपने खाते में लॉगिन करें",
    "auth.registerTitle": "नया खाता बनाएं",

    // Categories
    "category.seeds": "बीज",
    "category.fertilizers": "उर्वरक",
    "category.tools": "उपकरण",
    "category.pesticides": "कीटनाशक",

    // Common
    "common.price": "मूल्य",
    "common.quantity": "मात्रा",
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
    "common.edit": "संपादित करें",
    "common.delete": "हटाएं",
    "common.loading": "लोड हो रहा है...",
    "common.error": "कुछ गलत हुआ",
    "common.success": "सफल!",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
