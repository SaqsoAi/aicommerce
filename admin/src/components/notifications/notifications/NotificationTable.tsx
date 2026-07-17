"use client";

import { Notification } from "@/services/notification.service";

interface Props {
  data: Notification[];
}

export default function NotificationTable({
  data,
}: Props) {
  return (
    <div
      className="
      rounded-3xl
      overflow-hidden
      border
      border-zinc-200
      dark:border-zinc-800
    "
    >
      <table className="w-full">
        <thead
          className="
          bg-zinc-100
          dark:bg-zinc-900
        "
        >
          <tr>
            <th className="p-4 text-left">
              Title
            </th>

            <th className="p-4 text-left">
              Type
            </th>

            <th className="p-4 text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="
              border-t
              border-zinc-200
              dark:border-zinc-800
            "
            >
              <td className="p-4">
                {item.title}
              </td>

              <td className="p-4">
                {item.type}
              </td>

              <td className="p-4">
                {item.isRead
                  ? "Read"
                  : "Unread"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}