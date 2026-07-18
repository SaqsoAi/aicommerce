import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="grid min-h-[70dvh] place-items-center bg-zinc-50 px-6 text-zinc-950 dark:bg-black dark:text-white"><section className="max-w-md text-center"><WifiOff className="mx-auto" size={44}/><h1 className="mt-5 text-3xl font-black">You are offline</h1><p className="mt-3 text-zinc-500">Reconnect to refresh products, stock, prices and complete checkout.</p><Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-zinc-950 px-6 font-black text-white dark:bg-white dark:text-black">Try storefront</Link></section></main>;
}
