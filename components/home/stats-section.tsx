"use client"

const stats = [
  { number: "10,000+", label: "Happy Farmers", icon: "👨‍🌾" },
  { number: "500+", label: "Products", icon: "📦" },
  { number: "50+", label: "Cities", icon: "🏙️" },
  { number: "24/7", label: "Support", icon: "🎧" },
]

export function StatsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Farmers Across India</h2>
          <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
