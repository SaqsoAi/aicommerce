import Link from "next/link";
import { SaqsoCard, SaqsoEmptyState } from "@/components/saqso";

export default function RecentOrders({
  orders,
}: {
  orders: any[];
}) {
  return (
    <SaqsoCard>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Order Journey
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
            Recent Orders
          </h2>
        </div>

        <Link
          href="/track-order"
          className="rounded-full border px-4 py-2 text-sm font-bold dark:border-zinc-700"
        >
          Track Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <SaqsoEmptyState
          title="No Orders Yet"
          description="Start shopping to see your orders here."
          actionLabel="Shop Now"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-zinc-950 dark:text-white">
                    {order.orderNumber || order.id}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {order.status || "PENDING"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-black text-zinc-950 dark:text-white">
                    Tk {order.finalAmount || order.totalAmount || 0}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    View tracking
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SaqsoCard>
  );
}
