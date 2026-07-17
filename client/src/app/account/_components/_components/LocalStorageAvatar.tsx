"use client";

import { useEffect, useState } from "react";

const AVATAR_STORAGE_KEY = "isra-account-avatar-local";

export default function LocalStorageAvatar({
  fallback,
  name,
  className,
}: {
  fallback: string;
  name: string;
  className?: string;
}) {
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (saved) setAvatar(saved);

    function onAvatar(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setAvatar(detail || "");
    }

    window.addEventListener("isra-avatar-updated", onAvatar);
    return () => window.removeEventListener("isra-avatar-updated", onAvatar);
  }, []);

  return (
    <div className={className || "account-avatar"}>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
