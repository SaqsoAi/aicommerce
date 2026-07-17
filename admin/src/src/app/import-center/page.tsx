"use client";

const importGroups = [
  {
    title: "Homepage Import",
    source: "Homepage Hero + Homepage Builder + Recommendation + Social Feed",
    items: ["HeroSection", "TrendingCollections", "PersonalizationBanner", "RecommendationEngine", "SocialProofFeed", "StyleDiscovery", "SustainabilityCommitment"],
    access: "Super Admin / Tenant Owner / Store Admin"
  },
  {
    title: "Product Catalog Import",
    source: "Products + Categories + Brands + Variants + Filter Settings",
    items: ["ProductCard data", "FilterSidebar options", "SearchBar config", "SortDropdown config", "StylistPicks", "StyleItSection"],
    access: "Super Admin / Tenant Owner / Store Admin"
  },
  {
    title: "Product Detail Content Import",
    source: "Product Table + Product Media + Variants + Reviews + Recommendations",
    items: ["ProductGallery", "ProductInfo", "ProductDetails", "CustomerReviews", "CompleteTheLook", "RecommendedProducts"],
    access: "Super Admin / Tenant Owner / Store Admin"
  },
  {
    title: "Cart/Checkout Content Import",
    source: "Cart Rules + Checkout Settings + Coupons + Product Variants + Order Summary Logic",
    items: ["CartItem", "CheckoutForm", "OrderSummary", "RecommendedItems", "MiniCart"],
    access: "Super Admin / Tenant Owner / Store Admin"
  },
  {
    title: "Size Fit Center Import",
    source: "Variant Size + Size Guide + Fit Reviews + Virtual Try-On Settings",
    items: ["SizeGuide", "MeasuringGuide", "FindYourSize", "CustomerFitFeedback", "VirtualFitting", "FitGuarantee"],
    access: "Super Admin / Tenant Owner / Store Admin"
  },
  {
    title: "User Dashboard Content Import",
    source: "Customers + Orders + Wishlist + Rewards + Membership + Profile",
    items: ["DashboardHeader", "QuickActions", "RecentOrders", "WishlistPreview", "LoyaltyProgram", "StyleProfile", "AccountSettings"],
    access: "Super Admin / Tenant Owner"
  },
  {
    title: "Template Asset Import",
    source: "Media Library + Template Settings + Store Settings",
    items: ["Template media", "Template sections", "Responsive assets", "Brand assets"],
    access: "Super Admin only"
  }
];

export default function ImportCenterPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Website Studio</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Import Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Import Center duplicate data create kore na. Eta existing Admin Dashboard modules theke source mapping,
            validation, missing-field warning and sync readiness show kore.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {importGroups.map((group) => (
            <article key={group.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">{group.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Source: {group.source}</p>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                  {group.access}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                Missing source field thakle import run hobe na; warning report generate hobe.
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}