"use client";

type Props = {
  orders: any[];
};

export default function RecentOrders({
  orders,
}: Props) {
  return (
    <div
      className="
      bg-white
      dark:bg-zinc-900
      border
      border-zinc-200
      dark:border-zinc-800
      rounded-2xl
      p-6
    "
    >
      <h2 className="text-xl font-bold mb-5">
        Recent Orders
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="
            flex
            justify-between
            border-b
            pb-3
          "
          >
            <div>
              <div>
                {order.orderNumber}
              </div>

              <div
                className="
                text-sm
                text-zinc-500
              "
              >
                {order.customerName}
              </div>
            </div>

            <div>
              ৳
              {order.finalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}