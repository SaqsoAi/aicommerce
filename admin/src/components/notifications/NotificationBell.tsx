"use client";

import {
  Bell,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
} from "@/services/notification.service";

export default function NotificationBell() {
  const [items, setItems] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    getNotifications()
      .then((res) =>
        setItems(res.data)
      )
      .catch(console.error);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() =>
          setOpen(!open)
        }
      >
        <Bell size={20} />
      </button>

      {items.length > 0 && (
        <span
          className="
          absolute
          -top-2
          -right-2
          bg-red-500
          text-white
          text-xs
          w-5
          h-5
          rounded-full
          flex
          items-center
          justify-center
        "
        >
          {items.length}
        </span>
      )}

      {open && (
        <div
          className="
          absolute
          right-0
          mt-3

          w-[340px]

          bg-white
          dark:bg-zinc-900

          border
          border-zinc-200
          dark:border-zinc-800

          rounded-3xl

          shadow-xl

          overflow-hidden

          z-50
        "
        >
          <div
            className="
            p-4
            border-b
          "
          >
            <h3
              className="
              font-semibold
            "
            >
              Notifications
            </h3>
          </div>

          <div
            className="
            max-h-[350px]
            overflow-y-auto
          "
          >
            {items.map(
              (item) => (
                <div
                  key={item.id}
                  className="
                  p-4

                  border-b
                  border-zinc-200
                  dark:border-zinc-800

                  last:border-none
                "
                >
                  <div
                    className="
                    font-medium
                  "
                  >
                    {item.title}
                  </div>

                  <div
                    className="
                    text-xs
                    text-zinc-500
                    mt-1
                  "
                  >
                    {item.type}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}