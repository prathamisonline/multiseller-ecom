import Hero from '@/components/shared/Hero';

export default function Home() {
  return (
    <div className="flex flex-col space-y-20 pb-20">
      <Hero />

      {/* Featured Categories Section - Placeholder */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Featured Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Electronics', 'Fashion', 'Home Decor', 'Gadgets'].map((cat) => (
            <div key={cat} className="group relative h-40 overflow-hidden rounded-2xl bg-card border border-border hover:border-indigo-500 transition-all cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground group-hover:text-indigo-400 transition-colors">{cat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products Section - Placeholder */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
          <button className="text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group space-y-4">
              <div className="aspect-square bg-card rounded-2xl border border-border overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h3 className="text-foreground font-medium transition-colors">Premium Product Name</h3>
                <p className="text-indigo-400 font-bold mt-1">₹4,999</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
