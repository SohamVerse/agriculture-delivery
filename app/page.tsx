import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategorySection } from "@/components/home/category-section"
import { StatsSection } from "@/components/home/stats-section"

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <StatsSection />
    </div>
  )
}
