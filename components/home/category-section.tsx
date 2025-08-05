"use client"

import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"

const categories = [
  {
    id: 1,
    name: "category.seeds",
    icon: "🌱",
    image: "https://i.postimg.cc/6Qn8Yy5j/image.png",
    color: "bg-green-100 hover:bg-green-200",
  },
  {
    id: 2,
    name: "category.fertilizers",
    icon: "🧪",
    image: "https://i.postimg.cc/sX3gmmLx/image.png",
    color: "bg-blue-100 hover:bg-blue-200",
  },
  {
    id: 3,
    name: "category.tools",
    icon: "🔧",
    image: "https://i.postimg.cc/JhLr7KMx/image.png",
    color: "bg-yellow-100 hover:bg-yellow-200",
  },
  {
    id: 4,
    name: "category.pesticides",
    icon: "🛡️",
    image: "https://i.postimg.cc/7ZvDXXG4/image.png",
    color: "bg-purple-100 hover:bg-purple-200",
  },
]

export function CategorySection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600">Find everything you need for modern agriculture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`} className="group">
              <div
                className={`${category.color} rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={t(category.name)}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800">{t(category.name)}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
