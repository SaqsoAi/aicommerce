"use client";


import { useBrand } from "@/providers/BrandProvider";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { brand } = useBrand();
  const { items } = useCartStore();

  return (
    <main 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
      <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
        <div data-cart-brand-strip 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
          <p 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >{brand.storeName} Shopping Bag</p>
          <p 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >{brand.contactPhone || brand.contactEmail || "Support ready for your order"}</p>
        </div>
        <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
          <div>
            <p 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
              Shopping Bag
            </p>
            <h1 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
              Your Cart
            </h1>
          </div>

          <Link
            href="/shop"
            
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
            <h2 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >Your cart is empty</h2>
            <p 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
              Add products to cart and come back here to checkout.
            </p>
            <Link
              href="/shop"
              style={{ backgroundColor: brand.primaryColor }} 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
            <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  >
              <CartSummary items={items} />

              <Link
                href="/checkout"
                style={{ backgroundColor: brand.primaryColor }} 
    param($m)
    $cls = $m.Groups[1].Value
    if ($cls -match 'min-h-screen' -and $cls -notmatch 'cart-page') {
      'className="cart-page ' + $cls + ' bg-[#f7f7f4] text-[#111111] dark:bg-[#050505] dark:text-white"'
    } else {
      $m.Value
    }
  
              >
                Proceed To Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}



