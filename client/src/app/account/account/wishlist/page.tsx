import { getAccountWishlist } from "@/api/account.api";
import { AccountCard, AccountGlyph, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

function normalizeUploadUrl(url: unknown) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `http://localhost:5000${url}`;
  return url;
}

function wishlistImage(item: any) {
  return normalizeUploadUrl(
    item?.thumbnail ||
      item?.image ||
      item?.imageUrl ||
      item?.url ||
      item?.product?.thumbnail ||
      item?.product?.image ||
      item?.product?.imageUrl ||
      item?.product?.images?.[0]?.url ||
      item?.product?.media?.[0]?.url
  );
}

function wishlistName(item: any, index: number) {
  return item?.name || item?.title || item?.product?.name || `Saved Product ${index + 1}`;
}

function wishlistPrice(item: any) {
  const value = Number(item?.price || item?.product?.price || item?.product?.discountPrice || 0);
  return value ? `Tk ${value.toLocaleString("en-BD")}` : "Saved item";
}

export default async function AccountWishlistPage() {
  let rows: any[] = [];
  let error = "";
  try {
    const data = await getAccountWishlist();
    rows = Array.isArray(data) ? data : (data as any)?.wishlist || [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load wishlist";
  }

  return (
    <AccountPageShell active="Wishlist" eyebrow="Wishlist" title="My Wishlist" description="Saved fashion picks, add-to-cart actions, and wishlist management.">
      {error && <AccountNotice message={`Wishlist API fallback: ${error}`} />}
      <AccountCard title="Saved Items" subtitle="Real saved product integration.">
        {rows.length ? (
          <div className="account-wishlist-products">
            {rows.map((item: any, index: number) => (
              <div className="account-wishlist-product-card" key={item?.id || index}>
                <div className="account-wishlist-product-image">
                  {wishlistImage(item) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={wishlistImage(item)} alt={wishlistName(item, index)} />
                  ) : (
                    <AccountGlyph icon="heart" />
                  )}
                </div>
                <div>
                  <h3>{wishlistName(item, index)}</h3>
                  <p>{item?.product?.brand || item?.brand || "Luxury Essentials"}</p>
                  <strong>{wishlistPrice(item)}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
            No wishlist items found.
          </div>
        )}
      </AccountCard>
    </AccountPageShell>
  );
}