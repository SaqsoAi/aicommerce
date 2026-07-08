export type StoreCurrency = {
  code: string;
  symbol: string;
  locale: string;
};

export const fallbackCurrency: StoreCurrency = {
  code: "BDT",
  symbol: "৳",
  locale: "bn-BD",
};

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

export function resolveStoreCurrency(settings?: Record<string, unknown> | null): StoreCurrency {
  const raw =
    settings?.currencyCode ??
    settings?.currency ??
    settings?.storeCurrency ??
    settings?.defaultCurrency;

  const code = typeof raw === "string" && raw.trim()
    ? raw.trim().toUpperCase()
    : "BDT";

  const symbol =
    typeof settings?.currencySymbol === "string" && settings.currencySymbol.trim()
      ? settings.currencySymbol.trim()
      : currencySymbols[code] ?? code;

  return {
    code,
    symbol,
    locale: code === "BDT" ? "bn-BD" : "en-US",
  };
}

export function formatStoreMoney(value: unknown, currency: StoreCurrency = fallbackCurrency): string {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  if (!Number.isFinite(amount)) return ${currency.symbol}0;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return ${currency.symbol};
  }
}

export async function fetchStoreCurrency(apiBase: string): Promise<StoreCurrency> {
  const endpoints = [
    ${apiBase}/enterprise-settings,
    ${apiBase}/store-settings,
    ${apiBase}/settings/store,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const json = await res.json();
      return resolveStoreCurrency(json?.data ?? json?.settings ?? json);
    } catch {}
  }

  return fallbackCurrency;
}