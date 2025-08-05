"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="agri-button text-lg px-8 py-4">
                  {t("hero.cta")} 🚀
                </Button>
              </Link>
              <Link href="/orders">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  {t("orders.title")} 📦
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="agri-card p-8">
              <img
                src="https://i.postimg.cc/tJXn1pbr/image.png"
                alt="Agriculture"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl animate-bounce">
              🌱
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
