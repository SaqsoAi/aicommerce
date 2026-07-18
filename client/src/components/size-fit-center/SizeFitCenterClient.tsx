"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MessageCircle, Phone, Ruler, Video } from "lucide-react";
import {
  getPublicSizeFitReviews,
  getSizeFitCenterSettings,
  type SizeFitCenterSettings,
  type SizeFitReview,
} from "@/api/size-fit-center.api";

type MenuItem = {
  key: string;
  label: string;
  description?: string;
  enabled?: boolean;
  order?: number;
};

type StatItem = {
  label: string;
  value: string;
  icon?: string;
};

type HelpCard = {
  title: string;
  text: string;
  actionLabel: string;
  href: string;
};

type HeroConfig = {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

type ContentConfig = {
  title?: string;
  subtitle?: string;
  content?: string;
  steps?: string[];
  points?: string[];
};

type HelpConfig = {
  title?: string;
  subtitle?: string;
  cards?: HelpCard[];
};

const defaultHero: HeroConfig = {
  badge: "AI Powered Fit Center",
  title: "Size & Fit Center",
  subtitle:
    "Find your perfect fit with comprehensive sizing tools, real customer reviews, virtual try-on technology, and expert guidance.",
  primaryCta: {
    label: "Find My Size",
    href: "#find-size",
  },
  secondaryCta: {
    label: "Virtual Try-On",
    href: "/virtual-tryon",
  },
};

const defaultStats: StatItem[] = [
  { label: "Size Charts", value: "50+", icon: "▦" },
  { label: "Fit Reviews", value: "12.5K+", icon: "◇" },
  { label: "Perfect Fits", value: "94%", icon: "◎" },
  { label: "AR Items", value: "200+", icon: "▱" },
];

const defaultMenu: MenuItem[] = [
  {
    key: "size-guide",
    label: "Size Guide",
    description: "Brand-specific size charts and conversions",
    enabled: true,
    order: 1,
  },
  {
    key: "find-size",
    label: "Find Your Size",
    description: "Personalized size recommendations",
    enabled: true,
    order: 2,
  },
  {
    key: "fit-guide",
    label: "Fit Guide",
    description: "Understanding different fits and body types",
    enabled: true,
    order: 3,
  },
  {
    key: "virtual-tryon",
    label: "Virtual Try-On",
    description: "AR-powered virtual fitting room",
    enabled: true,
    order: 4,
  },
  {
    key: "reviews",
    label: "Customer Fit Reviews",
    description: "Real customer fit experiences",
    enabled: true,
    order: 5,
  },
  {
    key: "measure",
    label: "How to Measure",
    description: "Step-by-step measuring instructions",
    enabled: true,
    order: 6,
  },
  {
    key: "guarantee",
    label: "Fit Guarantee",
    description: "Our 30-day fit guarantee program",
    enabled: true,
    order: 7,
  },
];

const defaultHelp: HelpConfig = {
  title: "Still Need Help?",
  subtitle:
    "Our fit specialists are here to help you find the perfect size and fit for any item in our collection.",
  cards: [
    {
      title: "Live Chat",
      text: "Chat with our fit specialists for personalized sizing advice and recommendations.",
      actionLabel: "Start Chat",
      href: "mailto:support@stylehub.com?subject=Fit%20Help",
    },
    {
      title: "Virtual Consultation",
      text: "Book a one-on-one video consultation with our styling and fit experts.",
      actionLabel: "Book Session",
      href: "mailto:support@stylehub.com?subject=Book%20Fit%20Consultation",
    },
    {
      title: "Phone Support",
      text: "Call our customer service team for immediate assistance with sizing questions.",
      actionLabel: "Call Now",
      href: "tel:+8800000000000",
    },
  ],
};

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }

  return fallback;
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return fallback;
}

function panelTitle(settings: SizeFitCenterSettings | null, key: string) {
  if (key === "size-guide") return asObject<ContentConfig>(settings?.sizeGuideJson, {}).title || "Size Guide";
  if (key === "find-size") return "Find Your Size";
  if (key === "fit-guide") return asObject<ContentConfig>(settings?.fitGuideJson, {}).title || "Fit Guide";
  if (key === "virtual-tryon") return "Virtual Fitting Room";
  if (key === "reviews") return "Customer Fit Feedback";
  if (key === "measure") return asObject<ContentConfig>(settings?.measurementJson, {}).title || "Measuring Guide";
  if (key === "guarantee") return asObject<ContentConfig>(settings?.guaranteeJson, {}).title || "Fit Guarantee Program";
  return "Size & Fit";
}

function ActionLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  return (
    <a
      href={href}
      className={
        variant === "dark"
          ? "inline-flex items-center justify-center rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-neutral-950"
          : "inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
      }
    >
      {children}
    </a>
  );
}

function SizeGuidePanel({ settings }: { settings: SizeFitCenterSettings | null }) {
  const content = asObject<ContentConfig>(settings?.sizeGuideJson, {
    title: "Size Guide",
    subtitle: "Find your perfect fit with our comprehensive size charts",
  });

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{content.title || "Size Guide"}</h2>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {content.subtitle || "Find your perfect fit with our comprehensive size charts"}
          </p>
        </div>
        <span className="text-sm text-neutral-500">All measurements in inches</span>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-semibold">Select Brand</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          {["StyleHub", "Zara", "H&M", "ASOS"].map((brand, index) => (
            <button
              key={brand}
              className={`rounded-lg border p-4 text-center transition hover:border-neutral-950 dark:hover:border-white ${
                index === 0
                  ? "border-neutral-950 dark:border-white"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="mx-auto mb-2 h-10 w-10 rounded bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-sm font-medium">{brand}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-semibold">Category</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Women", "Men", "Kids"].map((item, index) => (
            <button
              key={item}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                index === 0
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "border border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {["Tops & Dresses", "Bottoms"].map((item, index) => (
            <button
              key={item}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                index === 0
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "border border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              {["Size", "Bust", "Waist", "Hips", "UK", "EU", "US"].map((head) => (
                <th key={head} className="p-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["XS", "32-34", "24-26", "34-36", "6", "34", "2"],
              ["S", "34-36", "26-28", "36-38", "8", "36", "4"],
              ["M", "36-38", "28-30", "38-40", "10", "38", "6"],
              ["L", "38-40", "30-32", "40-42", "12", "40", "8"],
              ["XL", "40-42", "32-34", "42-44", "14", "42", "10"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-neutral-200 dark:border-neutral-800">
                {row.map((cell) => (
                  <td key={cell} className="p-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
        <strong>Measurement Tips:</strong>{" "}
        {content.content ||
          "For the most accurate fit, measure yourself while wearing well-fitting undergarments. Keep the measuring tape snug but not tight."}
      </div>
    </section>
  );
}

function FindSizePanel() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Recommendation ready: Start with your usual size and compare product-specific fit reviews before ordering.");
  }

  return (
    <section id="find-size" className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Find Your Size</h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Get personalized size recommendations across all brands.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        {[
          ["Bust/Chest (inches)", "e.g., 34"],
          ["Waist (inches)", "e.g., 28"],
          ["Hips (inches)", "e.g., 36"],
          ["Height (inches)", "e.g., 65"],
        ].map(([label, placeholder]) => (
          <label key={label} className="grid gap-2 text-sm font-medium">
            {label}
            <input
              className="rounded-xl border border-neutral-200 bg-white p-3 outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-white"
              placeholder={placeholder}
            />
          </label>
        ))}

        <div className="md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950"
          >
            Get Size Recommendations
          </button>
        </div>
      </form>

      {message ? (
        <div className="mt-5 rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
          {message}
        </div>
      ) : null}
    </section>
  );
}

function FitGuidePanel({ settings }: { settings: SizeFitCenterSettings | null }) {
  const fitGuide = asObject<ContentConfig>(settings?.fitGuideJson, {});

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-2xl font-bold">{fitGuide.title || "Fit Guide"}</h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {fitGuide.subtitle || "Understand different fit types and how they work with your body."}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {["Slim Fit", "Regular Fit", "Relaxed Fit"].map((fit, index) => (
                <button
                  key={fit}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    index === 1
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>

            <h3 className="text-xl font-bold">Regular Fit</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {fitGuide.content || "Classic fit with comfortable room for movement."}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {["Balanced proportions", "Comfortable ease through body", "Versatile for most body types", "Timeless, classic appearance"].map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-neutral-100 p-5 text-center dark:bg-neutral-900">
            <div className="mx-auto h-52 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-3 rounded bg-neutral-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950">
              Regular Fit Example
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-2xl font-bold">Body Type Styling Guide</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["Pear Shape", "Apple Shape", "Hourglass", "Rectangle"].map((shape) => (
            <div key={shape} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <h3 className="font-bold">{shape}</h3>
              <p className="mt-1 text-sm text-neutral-500">Personalized styling tips.</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>✓ Choose balanced silhouettes</li>
                <li>✓ Highlight your best features</li>
                <li>✓ Try comfortable structured fits</li>
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VirtualTryOnPanel() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Virtual Fitting Room</h2>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Try on clothes virtually using AR technology.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold dark:bg-neutral-900">
          AR Enabled
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["See the Fit", "Visualize how clothes look on you before buying"],
          ["Instant Try-On", "No need to wait for delivery to see if it fits"],
          ["Share & Compare", "Get opinions before purchasing"],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl bg-neutral-50 p-5 text-center dark:bg-neutral-900">
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-neutral-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-neutral-50 p-5 dark:bg-neutral-900">
        <h3 className="mb-2 font-bold">System Requirements</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Virtual try-on works best on modern smartphones and tablets with camera access.
        </p>
      </div>

      <div className="mt-6">
        <ActionLink href="/virtual-tryon">Open Virtual Try-On</ActionLink>
      </div>
    </section>
  );
}

function MeasurePanel({ settings }: { settings: SizeFitCenterSettings | null }) {
  const measure = asObject<ContentConfig>(settings?.measurementJson, {});
  const steps = measure.steps || [
    "Wear well-fitting garments.",
    "Use a soft measuring tape.",
    "Measure chest, waist, hips, and inseam.",
    "Compare your numbers with the product chart.",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-2xl font-bold">{measure.title || "Measuring Guide"}</h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {measure.subtitle || "Learn how to take accurate measurements for the perfect fit."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Bust", "Waist", "Hips", "Inseam"].map((item) => (
            <div key={item} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
              <h3 className="font-bold">{item}</h3>
              <ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                {steps.map((step, index) => (
                  <li key={`${item}-${step}`}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-xl font-bold">Helpful Tools & Resources</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Mobile App", "Use your camera to help with measurements"],
            ["Printable Guide", "Download and print our measuring guide"],
            ["Expert Help", "Chat with our fit specialists"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl bg-neutral-50 p-5 text-center dark:bg-neutral-900">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="data:text/plain;charset=utf-8,Size%20Guide%20Download%0AMeasure%20chest%2C%20waist%2C%20hips%20and%20inseam."
            download="size-guide.txt"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700"
          >
            Download Guide
          </a>
          <ActionLink href="mailto:support@stylehub.com?subject=Fit%20Expert%20Help">Chat with Expert</ActionLink>
        </div>
      </section>
    </div>
  );
}

function GuaranteePanel({ settings }: { settings: SizeFitCenterSettings | null }) {
  const guarantee = asObject<ContentConfig>(settings?.guaranteeJson, {});
  const points = guarantee.points || [
    "No questions asked size exchanges",
    "Free return support included",
    "Priority handling for fit exchanges",
    "Easy support throughout the process",
  ];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{guarantee.title || "Fit Guarantee Program"}</h2>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {guarantee.subtitle || "Shop with confidence — we guarantee the perfect fit."}
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold dark:bg-neutral-900">
          Protected
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["30-Day Fit Guarantee", "Free Exchange Shipping", "Quick Processing"].map((title) => (
          <div key={title} className="rounded-xl border border-neutral-200 p-5 text-center dark:border-neutral-800">
            <h3 className="font-bold">{title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {points.slice(0, 4).map((point) => (
                <li key={point}>✓ {point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-neutral-50 p-5 text-sm dark:bg-neutral-900">
        <strong>Our Promise:</strong> If any item does not fit as expected, we will make it right with clear support and easy exchange guidance.
      </div>
    </section>
  );
}

function ReviewsPanel({ reviews }: { reviews: SizeFitReview[] }) {
  const [fitFilter, setFitFilter] = useState("all");
  const visible = reviews.filter((review) => fitFilter === "all" || review.fitRating === fitFilter);

  function shareReview(review: SizeFitReview) {
    const text = `${review.product?.name || "Product"} fit review: ${review.fitRating || "Fit experience"}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Fit Review", text }).catch(() => undefined);
      return;
    }

    window.location.href = `mailto:?subject=Fit Review&body=${encodeURIComponent(text)}`;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Fit Feedback</h2>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Real customers sharing how items fit with photos and details.
          </p>
        </div>
        <span className="text-sm text-neutral-500">{visible.length} reviews</span>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <select className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          <option>All Products</option>
        </select>
        <select className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          <option>All Sizes</option>
        </select>
        <select
          value={fitFilter}
          onChange={(event) => setFitFilter(event.target.value)}
          className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <option value="all">All Fits</option>
          <option value="Perfect">Perfect</option>
          <option value="Runs Small">Runs Small</option>
          <option value="Runs Large">Runs Large</option>
          <option value="Slightly Loose">Slightly Loose</option>
          <option value="Slightly Tight">Slightly Tight</option>
        </select>
      </div>

      <div className="space-y-4">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-800">
            No approved customer fit reviews yet.
          </div>
        ) : (
          visible.map((review) => (
            <article key={review.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex gap-4">
                <div className="h-24 w-20 flex-none rounded-lg bg-neutral-100 dark:bg-neutral-900" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{review.product?.name || "Product"}</h3>
                      <p className="text-sm text-neutral-500">
                        {review.user?.name || "Customer"} Â· {review.verifiedPurchase ? "Verified Purchase" : "Customer Review"}
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold dark:bg-neutral-900">
                      {review.fitRating || "Fit Review"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900 sm:grid-cols-4">
                    <div>Size Ordered<br /><strong>{review.sizeOrdered || "N/A"}</strong></div>
                    <div>Height<br /><strong>{review.heightCm ? `${review.heightCm} cm` : "N/A"}</strong></div>
                    <div>Body Type<br /><strong>{review.bodyType || "N/A"}</strong></div>
                    <div>Rating<br /><strong>{review.rating}/5</strong></div>
                  </div>

                  <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {review.comment || "This customer submitted a fit review."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
                    <button type="button" onClick={() => alert("Thanks for your feedback.")}>Helpful</button>
                    <a href="mailto:support@stylehub.com?subject=Reply%20to%20Fit%20Review">Reply</a>
                    <button type="button" onClick={() => shareReview(review)}>Share</button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Share Your Fit Experience</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Help other customers by reviewing products you purchased.
        </p>
        <div className="mt-4">
          <ActionLink href="/orders">Write a Fit Review</ActionLink>
        </div>
      </div>
    </section>
  );
}

function HelpSection({ settings }: { settings: SizeFitCenterSettings | null }) {
  const help = asObject<HelpConfig>(settings?.helpJson, defaultHelp);
  const cards = help.cards?.length ? help.cards : defaultHelp.cards || [];

  return (
    <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">{help.title || defaultHelp.title}</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            {help.subtitle || defaultHelp.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-neutral-900"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-xl dark:border-neutral-700" aria-hidden="true">
                {index === 0 ? <MessageCircle size={20} /> : index === 1 ? <Video size={20} /> : <Phone size={20} />}
              </div>
              <h3 className="font-bold">{card.title}</h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{card.text}</p>
              <div className="mt-5">
                <ActionLink href={card.href}>{card.actionLabel}</ActionLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-neutral-950 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <h3 className="text-xl font-bold">StyleHub Commerce</h3>
            <p className="mt-4 max-w-md text-sm text-neutral-300">
              Your trusted partner in finding the perfect fit. We are committed to making online shopping as confident and satisfying as shopping in-store.
            </p>
          </div>

          <div>
            <h4 className="font-bold">Size & Fit</h4>
            <div className="mt-4 grid gap-2 text-sm text-neutral-300">
              <a href="#size-guide">Size Charts</a>
              <a href="#measure">Measuring Guide</a>
              <a href="#guarantee">Fit Guarantee</a>
              <a href="/virtual-tryon">Virtual Try-On</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold">Support</h4>
            <div className="mt-4 grid gap-2 text-sm text-neutral-300">
              <a href="mailto:support@stylehub.com">Contact Us</a>
              <a href="/orders">Returns & Exchanges</a>
              <a href="/shop">Shipping Info</a>
              <a href="mailto:support@stylehub.com?subject=FAQ">FAQ</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-sm text-neutral-400">
          © 2026 StyleHub Commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function ContentPanel({
  active,
  settings,
  reviews,
}: {
  active: string;
  settings: SizeFitCenterSettings | null;
  reviews: SizeFitReview[];
}) {
  if (active === "find-size") return <FindSizePanel />;
  if (active === "fit-guide") return <FitGuidePanel settings={settings} />;
  if (active === "virtual-tryon") return <VirtualTryOnPanel />;
  if (active === "reviews") return <ReviewsPanel reviews={reviews} />;
  if (active === "measure") return <MeasurePanel settings={settings} />;
  if (active === "guarantee") return <GuaranteePanel settings={settings} />;

  return <SizeGuidePanel settings={settings} />;
}

export default function SizeFitCenterClient() {
  const [settings, setSettings] = useState<SizeFitCenterSettings | null>(null);
  const [reviews, setReviews] = useState<SizeFitReview[]>([]);
  const [active, setActive] = useState("size-guide");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSizeFitCenterSettings(), getPublicSizeFitReviews()])
      .then(([settingsData, reviewData]) => {
        setSettings(settingsData);
        setReviews(reviewData);
      })
      .catch(() => {
        setSettings(null);
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const hero = asObject<HeroConfig>(settings?.heroJson, defaultHero);
  const stats = asArray<StatItem>(settings?.statsJson, defaultStats);
  const menu = useMemo(() => {
    const raw = asArray<MenuItem>(settings?.menuJson, defaultMenu);
    return raw
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [settings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          Loading Size & Fit Center...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-b from-white to-neutral-50 py-20 dark:border-neutral-900 dark:from-neutral-950 dark:to-neutral-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-900">
              <Ruler size={22} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {hero.badge || defaultHero.badge}
            </p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">
              {hero.title || defaultHero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              {hero.subtitle || defaultHero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {hero.primaryCta ? <ActionLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ActionLink> : null}
              {hero.secondaryCta ? <ActionLink href={hero.secondaryCta.href} variant="light">{hero.secondaryCta.label}</ActionLink> : null}
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={`${stat.label}-${stat.value}`}
                className="rounded-2xl border border-neutral-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70"
              >
                <div className="text-xl text-neutral-500" aria-hidden="true">{stat.icon && !/[\u00e2\u00c3\u00f0\ufffd]/.test(stat.icon) ? stat.icon : "◎"}</div>
                <div className="mt-2 text-3xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="mb-4 text-lg font-bold">Fit & Size Tools</h2>
            <div className="space-y-2">
              {menu.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                    active === item.key
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <span className="block text-sm font-bold">{item.label}</span>
                  {item.description ? (
                    <span className="mt-1 block text-xs opacity-70">{item.description}</span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-5 dark:border-neutral-800">
              <h3 className="mb-3 text-sm font-bold">Quick Actions</h3>
              <div className="grid gap-2 text-sm">
                <a className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" href="mailto:support@stylehub.com?subject=Chat%20with%20Fit%20Expert">
                  Chat with Fit Expert
                </a>
                <a
                  className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  href="data:text/plain;charset=utf-8,Size%20Guide%0AMeasure%20chest%2C%20waist%2C%20hips%20and%20inseam."
                  download="size-guide.txt"
                >
                  Download Size Guide
                </a>
              </div>
            </div>
          </div>
        </aside>

        <div id={active} className="space-y-6">
          <ContentPanel active={active} settings={settings} reviews={reviews} />
        </div>
      </section>

      <HelpSection settings={settings} />
      <Footer />
    </main>
  );
}
