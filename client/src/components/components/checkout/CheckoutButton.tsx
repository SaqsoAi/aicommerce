"use client";

interface CheckoutButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

export default function CheckoutButton({
  onClick,
  loading = false,
}: CheckoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        bg-black
        text-white
        px-6
        py-3
        rounded-xl
        hover:opacity-90
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {loading
        ? "Processing..."
        : "Checkout"}
    </button>
  );
}

