"use client"

import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-green-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-green-800 font-bold text-lg">🌾</span>
              </div>
              <span className="text-xl font-bold">AgriDeliver</span>
            </div>
            <p className="text-green-100">Your trusted partner for agricultural products delivery across India.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-green-100 hover:text-white transition-colors">
                {t("nav.home")}
              </Link>
              <Link href="/products" className="block text-green-100 hover:text-white transition-colors">
                {t("nav.products")}
              </Link>
              <Link href="/orders" className="block text-green-100 hover:text-white transition-colors">
                {t("nav.orders")}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              <div className="text-green-100">{t("category.seeds")}</div>
              <div className="text-green-100">{t("category.fertilizers")}</div>
              <div className="text-green-100">{t("category.tools")}</div>
              <div className="text-green-100">{t("category.pesticides")}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-green-100">
              <div>📞 +91-9876543210</div>
              <div>📧 support@agridelivery.com</div>
              <div>📍 Agriculture Hub, India</div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-100">
          <p>&copy; 2024 AgriDeliver. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
