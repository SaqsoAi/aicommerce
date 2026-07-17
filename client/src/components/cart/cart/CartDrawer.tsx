"use client";

export default function CartDrawer() {
  return (
    <div className="fixed right-0 top-0 h-screen w-[450px] bg-white shadow-2xl z-50 p-6">
      <h2 className="text-3xl font-bold mb-8">
        Shopping Cart
      </h2>

      <div className="space-y-5">
        <div className="flex gap-4">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
            className="w-24 h-24 rounded-2xl object-cover"
          />

          <div>
            <h3 className="font-semibold">
              Premium Shirt
            </h3>

            <p>à§³ 2200</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-black text-white py-4 rounded-full mt-10">
        Checkout
      </button>
    </div>
  );
}

