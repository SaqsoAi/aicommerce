import Link from "next/link";
import { getAccountDashboard } from "@/api/account.api";
import { AccountGlyph, AccountPageShell } from "./_components/AccountClientUi";
import LocalStorageAvatar from "./_components/LocalStorageAvatar";

type AnyRecord = Record<string, any>;

function currency(value: unknown) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "Tk 0";
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function normalizeUploadUrl(url: unknown) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `http://localhost:5000${url}`;
  return url;
}

function getDisplayName(profile: AnyRecord) {
  return profile?.displayName || profile?.name || profile?.email || "Customer";
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TC"
  );
}

function memberSince(profile: AnyRecord) {
  const value = profile?.joinedAt || profile?.createdAt || profile?.memberSince;
  if (!value) return "Unavailable";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Unavailable";
  }
}

function orderCode(order: AnyRecord, index: number) {
  const raw =
    order?.orderNumber ||
    order?.orderNo ||
    order?.code ||
    order?.id ||
    `SH20240${index + 1}`;

  const text = String(raw);
  return text.startsWith("#") ? text : `#${text.slice(-8).toUpperCase()}`;
}

function orderStatus(order: AnyRecord) {
  return String(order?.status || order?.orderStatus || "Processing").replaceAll("_", " ");
}

function orderItems(order: AnyRecord) {
  const count = Number(
    order?.itemCount ||
      order?.itemsCount ||
      order?.items?.length ||
      order?.orderItems?.length ||
      1
  );

  return `${count} ${count === 1 ? "item" : "items"}`;
}

function orderTotal(order: AnyRecord) {
  return order?.totalAmount || order?.total || order?.amount || order?.grandTotal || 0;
}

function wishlistTitle(item: AnyRecord, index: number) {
  return item?.name || item?.title || item?.product?.name || `Saved Wishlist ${index + 1}`;
}

function productTitle(item: AnyRecord) {
  return item?.name || item?.product?.name || item?.title || "Recommended Product";
}

function productPrice(item: AnyRecord) {
  return item?.discountPrice || item?.price || item?.product?.price || 0;
}

function productImage(item: AnyRecord) {
  return normalizeUploadUrl(
    item?.thumbnail ||
      item?.image ||
      item?.imageUrl ||
      item?.url ||
      item?.images?.[0]?.url ||
      item?.product?.thumbnail ||
      item?.product?.image ||
      item?.product?.imageUrl ||
      item?.product?.url ||
      item?.product?.images?.[0]?.url ||
      item?.product?.media?.[0]?.url
  );
}


export default async function AccountOverviewPage() {
  let dashboard: AnyRecord | null = null;
  let error = "";

  try {
    dashboard = await getAccountDashboard();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load account dashboard";
  }

  const profile = dashboard?.profile || {};
  const name = getDisplayName(profile);
  const membership = dashboard?.membership || {};
  const rewards = dashboard?.rewards || {};
  const loyaltyPoints = Number(membership?.stylePoints || rewards?.balance || 0);
  const membershipTier = String(membership?.tier || "Not enrolled");
  const recentOrders = Array.isArray(dashboard?.recentOrders) ? dashboard.recentOrders : [];
  const wishlist = Array.isArray(dashboard?.wishlist) ? dashboard.wishlist : [];
  const recommendations = Array.isArray(dashboard?.recommendations) ? dashboard.recommendations : [];
  const avatarUrl = normalizeUploadUrl(profile?.avatarUrl || profile?.avatar);

  const quickActions = [
    { title: "Track Orders", subtitle: "View order status", href: "/account/orders", icon: "box", tone: "blue" },
    { title: "My Wishlist", subtitle: `${wishlist.length || 0} saved items`, href: "/account/wishlist", icon: "heart", tone: "pink" },
    { title: "Size Guide", subtitle: "Find perfect fit", href: "/size-fit-center", icon: "pin", tone: "green" },
    { title: "Style Quiz", subtitle: "Update preferences", href: "/account/style-profile", icon: "spark", tone: "violet" },
    { title: "My Rewards", subtitle: "Redeem points", href: "/account/rewards", icon: "gift", tone: "amber" },
    { title: "Get Help", subtitle: "24/7 support", href: "/account/support", icon: "help", tone: "cyan" },
  ];

  const fallbackOrders: AnyRecord[] = [];
  const fallbackWishlist: AnyRecord[] = [];
  const fallbackRecommendations: AnyRecord[] = [];

  return (
    <AccountPageShell active="Overview" eyebrow="" title="" description="">
      {error && <div className="account-lux-notice">Account API fallback: {error}</div>}

      <section className="account-hero-widget account-hero-widget-clean">
        <LocalStorageAvatar fallback={initials(name)} name={name} className="account-avatar" />
        <div className="account-hero-copy">
          <h1>Welcome back, {name}!</h1>
          <p>Member since {memberSince(profile)}</p>
          <p className="account-support-ready">ISRA LIFESTYLE member support: Ready</p>
        </div>

        <div className="account-hero-stats">
          <div>
            <strong>{loyaltyPoints.toLocaleString("en-BD")}</strong>
            <span>Style Points</span>
          </div>
          <div className="account-stat-divider" />
          <div>
            <strong>{membershipTier}</strong>
            <span>Member Tier</span>
          </div>
        </div>
      </section>

      <section className="account-quick-actions account-widget-panel">
        <div className="account-section-head">
          <h2>Quick Actions</h2>
          <Link href="/account/settings">View All</Link>
        </div>

        <div className="account-action-grid">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`account-action-card account-tone-${action.tone}`}
            >
              <span className="account-action-icon"><AccountGlyph icon={action.icon} /></span>
              <strong>{action.title}</strong>
              <small>{action.subtitle}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="account-widget-panel account-order-panel">
        <div className="account-section-head">
          <h2>Recent Orders</h2>
          <Link href="/account/orders">View All Orders</Link>
        </div>

        <div className="account-order-list">
          {recentOrders.slice(0, 3).map(
            (order: AnyRecord, index: number) => (
              <Link href="/account/orders" key={order?.id || index} className="account-order-row">
                <div>
                  <strong>Order {orderCode(order, index)}</strong>
                  <span>
                    {orderItems(order)}, {currency(orderTotal(order))}
                  </span>
                </div>
                <em>{orderStatus(order)}</em>
                <span className="account-row-arrow">&gt;</span>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="account-widget-panel">
        <div className="account-section-head">
          <div>
            <h2>My Wishlists</h2>
            <p>{wishlist.length || 0} items saved</p>
          </div>
          <Link href="/account/wishlist">+ New List</Link>
        </div>

        <div className="account-wishlist-grid">
          {wishlist.slice(0, 3).map(
            (item: AnyRecord, index: number) => (
              <Link href="/account/wishlist" key={item?.id || index} className="account-wishlist-card">
                {productImage(item) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="account-wishlist-thumb" src={productImage(item)} alt={wishlistTitle(item, index)} />
                )}
                <span className="account-wishlist-heart"><AccountGlyph icon="heart" /></span>
                <strong>{wishlistTitle(item, index)}</strong>
                <small>{item?.updated || item?.product?.name || item?.productId || "Saved product collection"}</small>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="account-widget-panel">
        <div className="account-section-head">
          <div>
            <h2>Recommended For You</h2>
            <p>Based on your style profile and purchase history</p>
          </div>
          <Link href="/shop">View All</Link>
        </div>

        <div className="account-reco-grid">
          {recommendations.slice(0, 3).map(
            (item: AnyRecord, index: number) => {
              const image = productImage(item);
              return (
                <Link
                  href={item?.id ? `/product/${item.id}` : "/shop"}
                  key={item?.id || index}
                  className="account-reco-card"
                >
                  <div className="account-reco-image">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={productTitle(item)} />
                    ) : null}
                  </div>
                  <strong>{productTitle(item)}</strong>
                  <span>{item?.brand?.name || item?.brand || "Luxury Essentials"}</span>
                  <em>{currency(productPrice(item))}</em>
                </Link>
              );
            }
          )}
        </div>
      </section>
    </AccountPageShell>
  );
}



