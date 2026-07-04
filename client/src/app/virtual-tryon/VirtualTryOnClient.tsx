// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  deleteVirtualTryOnHistory,
  getMyVirtualTryOnHistory,
  retryVirtualTryOn,
} from "@/api/virtual-tryon.api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type TryOnJob = {
  id: string;
  productId: string;
  personImage: string;
  garmentImage: string;
  resultImage?: string | null;
  status: string;
  error?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name?: string;
    thumbnail?: string;
    price?: number;
  };
};

type ProductInfo = {
  id: string;
  name?: string;
  thumbnail?: string;
  price?: number;
  brand?: {
    name?: string;
  };
};

export default function VirtualTryOnClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sizes, setSizes] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [history, setHistory] = useState<TryOnJob[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [product, setProduct] = useState<ProductInfo | null>(null);

  const [cameraPermission, setCameraPermission] =
    useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [isARActive, setIsARActive] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);

  useEffect(() => {
    loadSettings();
    loadProduct();
    loadHistory();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch(`${API}/virtual-tryon/settings`);
      const data = await res.json();
      setSizes(data.data?.sizes || sizes);
    } catch {
      setSizes(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
    }
  }

  async function loadProduct() {
    if (!productId) return;

    try {
      const res = await fetch(`${API}/products/${productId}`);
      const json = await res.json();
      setProduct(json.data || json.product || json);
    } catch {
      setProduct(null);
    }
  }

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      const res = await getMyVirtualTryOnHistory();
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function startTryOn() {
    try {
      setCameraPermission("requesting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraPermission("granted");
      setIsARActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setCameraPermission("denied");
      setIsARActive(false);
    }
  }

  function stopTryOn() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsARActive(false);
    setCameraPermission("idle");
  }

  async function resetCamera() {
    stopTryOn();
    setTimeout(() => {
      startTryOn();
    }, 250);
  }

  function captureFrame() {
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 220);
  }

  async function shareTryOn() {
    const text = `Trying on ${product?.name || "this product"} in size ${selectedSize}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Virtual Try-On",
        text,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(`${text} - ${window.location.href}`);
    alert("Try-on link copied.");
  }

  async function addToCart() {
    if (!productId) {
      alert("No product selected.");
      return;
    }

    try {
      const res = await fetch(`${API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: 1,
          size: selectedSize,
        }),
      });

      if (!res.ok) throw new Error("Add to cart failed");
      alert("Added to cart.");
    } catch {
      alert("Cart API unavailable or login required.");
    }
  }

  const retry = async (id: string) => {
    try {
      await retryVirtualTryOn(id);
      await loadHistory();
    } catch {
      alert("Try-On retry failed");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteVirtualTryOnHistory(id);
      await loadHistory();
    } catch {
      alert("Try-On delete failed");
    }
  };

  const productName = product?.name || "Selected Product";
  const productPrice = product?.price ? `$${product.price}` : "";
  const productImage = product?.thumbnail;

  return (
    <main className="min-h-screen bg-white p-6 text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <section className="mx-auto max-w-6xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 transition-colors duration-200 motion-reduce:transition-none">
        <div className="flex flex-wrap items-center justify-between gap-4 enterprise-mobile-stack">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              SAQSO Luxury AR Fitting Room
            </p>
            <h1 className="mt-2 text-3xl font-bold">Virtual Try-On</h1>
            <p className="mt-2 text-neutral-500">
              Open the luxury AR overlay, select size, share the look, or add to cart.
            </p>
          </div>

          <div className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
            FAL.ai FASHN
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 enterprise-mobile-stack">
          {[
            ["See the Fit", "Visualize how clothes look on you before buying."],
            ["Instant Try-On", "Camera based instant fitting preview."],
            ["Share & Compare", "Share your try-on look before purchasing."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-neutral-50 p-5 text-center dark:bg-neutral-900">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none">
          <h2 className="text-xl font-semibold">Selected Product</h2>
          <p className="mt-2 text-sm text-neutral-500">
            {productId ? `Product ID: ${productId}` : "No product selected"}
          </p>

          <button type="button"
            onClick={startTryOn}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Start Virtual Try-On
          </button>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 transition-colors duration-200 motion-reduce:transition-none">
        <div className="flex flex-wrap items-center justify-between gap-4 enterprise-mobile-stack">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              Style Memory
            </p>
            <h2 className="mt-2 text-2xl font-bold">My Try-On History</h2>
          </div>

          <button type="button"
            onClick={loadHistory}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none"
          >
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <p className="mt-6 text-neutral-500">Loading try-on history...</p>
        ) : history.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="font-bold">No try-on history yet</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Try products virtually and your results will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 enterprise-mobile-stack">
            {history.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 transition-colors duration-200 motion-reduce:transition-none"
              >
                <div className="enterprise-responsive-guard grid grid-cols-2 enterprise-mobile-stack">
                  <div
                    className="h-72 bg-neutral-100 bg-cover bg-center dark:bg-neutral-900"
                    style={{
                      backgroundImage: item.personImage ? `url(${item.personImage})` : undefined,
                    }}
                  />
                  <div
                    className="h-72 bg-neutral-100 bg-cover bg-center dark:bg-neutral-900"
                    style={{
                      backgroundImage:
                        item.resultImage || item.garmentImage
                          ? `url(${item.resultImage || item.garmentImage})`
                          : undefined,
                    }}
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{item.product?.name || "Product Try-On"}</h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-bold dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none">
                      {item.status}
                    </span>
                  </div>

                  {item.error ? (
                    <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                      {item.error}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button type="button"
                      onClick={() => retry(item.id)}
                      className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
                    >
                      Retry
                    </button>

                    <a
                      href={`/product/${item.productId}`}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none"
                    >
                      View Product
                    </a>

                    <button type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-red-600 dark:border-neutral-800 transition-colors duration-200 motion-reduce:transition-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {cameraPermission === "requesting" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center text-black">
            <h3 className="mt-4 text-xl font-bold">Camera Access Required</h3>
            <p className="mt-2 text-neutral-500">
              Allow camera permission to start virtual try-on.
            </p>
            <div className="mt-5 text-sm text-neutral-400">Requesting permission...</div>
          </div>
        </div>
      )}

      {cameraPermission === "denied" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center text-black">
            <h3 className="mt-4 text-xl font-bold">Camera Access Denied</h3>
            <p className="mt-2 text-neutral-500">
              Please enable camera permission from browser settings.
            </p>
            <button type="button"
              onClick={() => setCameraPermission("idle")}
              className="mt-5 rounded-xl bg-black px-5 py-3 text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {isARActive && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#081221] text-white">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#081221]/90 px-5 py-4 backdrop-blur enterprise-mobile-stack">
            <button type="button"
              onClick={stopTryOn}
              className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"
            >
              Ã— Close
            </button>

            <div className="flex items-center gap-2">
              <button type="button"
                onClick={resetCamera}
                className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"
              >
                Reset
              </button>
              <button type="button"
                onClick={captureFrame}
                className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"
              >
                Capture
              </button>
            </div>
          </div>

          <div className="relative min-h-[calc(100vh-72px)] px-4 py-6">
            {captureFlash ? <div className="fixed inset-0 z-30 bg-white/40" /> : null}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />

            <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl flex-col items-center justify-center">
              <div className="relative flex h-[430px] w-[290px] items-center justify-center rounded-[28px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm transition-colors duration-200 motion-reduce:transition-none">
                <div className="absolute inset-8 rounded-[22px] border border-white/10 bg-white/10 transition-colors duration-200 motion-reduce:transition-none" />
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="relative z-10 max-h-[310px] max-w-[220px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="relative z-10 text-center text-white/70">
                    <div className="text-4xl">â™™</div>
                    <div className="mt-3 text-sm font-semibold">AR Try-On Active</div>
                    <div className="mt-1 text-xs">Move closer to see the fit</div>
                  </div>
                )}
              </div>

              <div className="mt-3 w-[290px] rounded-xl bg-black/70 p-4 text-center shadow-xl">
                <h3 className="font-bold">{productName}</h3>
                <p className="text-xs text-white/60">
                  {product?.brand?.name || "StyleHub"} {productPrice ? `Â· ${productPrice}` : ""}
                </p>
                <p className="mt-1 text-xs text-white/60">Selected Size: {selectedSize}</p>
              </div>
            </div>

            <div className="relative z-10 mx-auto mt-4 max-w-6xl rounded-2xl border border-white/10 bg-black/70 p-4 transition-colors duration-200 motion-reduce:transition-none">
              <p className="mb-3 text-sm font-semibold text-white">Select Size:</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      selectedSize === size
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative z-10 mx-auto mt-4 grid max-w-6xl gap-3 md:grid-cols-2 enterprise-mobile-stack">
              <button type="button"
                onClick={shareTryOn}
                className="rounded-xl border border-white/25 px-5 py-4 text-sm font-bold hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"
              >
                Share
              </button>
              <button type="button"
                onClick={addToCart}
                className="rounded-xl bg-neutral-700 px-5 py-4 text-sm font-bold text-white hover:bg-neutral-600"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
