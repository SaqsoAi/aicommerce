"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { getMyOrders, getOrderTracking } from "@/services/order.service";
import {
  getCustomerProfileFields,
  getProfile,
  updateProfile,
} from "@/services/account.service";

import { SaqsoCard, SaqsoStatCard } from "@/components/saqso";

import DashboardHeader from "./components/DashboardHeader";
import QuickActions from "./components/QuickActions";
import RecentOrders from "./components/RecentOrders";
import AccountSettings from "./components/AccountSettings";
import LoyaltyProgram from "./components/LoyaltyProgram";
import StyleProfile from "./components/StyleProfile";
import WishlistPreview from "./components/WishlistPreview";
import PersonalizedRecommendations from "./components/PersonalizedRecommendations";
import SavedLooksPreview from "./components/SavedLooksPreview";
import MembershipCardWidget from "@/components/membership/MembershipCardWidget";
import RewardWalletWidget from "@/components/rewards/RewardWalletWidget";
import { getMembershipRecommendation, getMyMembership } from "@/services/membership.service";
import { getRewardRedemptionRules, getRewardWallet } from "@/services/reward.service";
import { getMySavedLooks } from "@/api/saved-looks.api";
import { getMyVirtualTryOnHistory } from "@/api/virtual-tryon.api";
import DashboardIntelligence from "./components/DashboardIntelligence";
import ActivityTimeline from "./components/ActivityTimeline";
import CustomerIntelligencePanel from "./components/CustomerIntelligencePanel";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [tracking, setTracking] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [membershipRecommendation, setMembershipRecommendation] = useState<any>(null);
  const [rewardWallet, setRewardWallet] = useState<any>(null);
  const [redemptionRules, setRedemptionRules] = useState<any[]>([]);
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [tryOnHistory, setTryOnHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      getMyOrders(user.id),
      getProfile(),
      getCustomerProfileFields(),
      getMyMembership(),
      getRewardWallet(),
      getRewardRedemptionRules(),
      getMembershipRecommendation(orders.reduce((sum: number, o: any) => sum + Number(o.finalAmount || 0), 0)),
      getMySavedLooks(),
      getMyVirtualTryOnHistory(),
    ])
      .then(async ([ordersRes, profileRes, fieldsRes, membershipRes, walletRes, redemptionRes, recommendationRes, savedLooksRes, tryOnHistoryRes]) => {
        const orderList = ordersRes.data || [];

        setOrders(orderList);
        setProfile(profileRes.data || {});
        setFields(fieldsRes.data || []);
        setMembership(membershipRes.data || null);
        setRewardWallet(walletRes.data || null);
        setRedemptionRules(redemptionRes.data || []);
        setMembershipRecommendation(recommendationRes.data || null);
        setSavedLooks(savedLooksRes || []);
        setTryOnHistory(tryOnHistoryRes.data || []);

        if (orderList.length > 0) {
          try {
            const trackingRes = await getOrderTracking(orderList[0].id);
            setTracking(trackingRes.data);
          } catch {}
        }
      })
      .catch(console.error);
  }, [user]);

  const visibleFields = useMemo(() => {
    return fields
      .filter((field) => field.enabled !== false && field.visible !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [fields]);

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  const saveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile(profile);
      alert("Profile saved");
    } catch (error) {
      console.error(error);
      alert("Profile save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[#030712] text-white bg-zinc-50 dark:bg-white text-slate-950 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-4 sm:px-6 lg:px-8 space-y-8 px-6 py-6 sm:py-8 lg:py-10">
        <DashboardHeader user={user} profile={profile} logout={logout} />

        <div className="grid gap-5 md:grid-cols-4">
          <SaqsoStatCard label="Total Orders" value={orders.length} />
          <SaqsoStatCard label="Pending" value={pending} />
          <SaqsoStatCard label="Delivered" value={delivered} />
          <SaqsoStatCard label="Reward Points" value="120" />
          <SaqsoStatCard label="Returns" value="0" />
          <SaqsoStatCard label="Refunds" value="0" />
          <SaqsoStatCard label="Notifications" value="0" />
          <SaqsoStatCard
            label="Membership"
            value={membership?.tier || "NONE"}
          />
        </div>

        <QuickActions />

        <DashboardIntelligence
          orders={orders}
          membership={membership}
          rewardWallet={rewardWallet}
          savedLooks={savedLooks}
          tryOnHistory={tryOnHistory}
          profile={profile}
        />

        <div className="grid gap-5 lg:grid-cols-1 lg:grid-cols-2">
          <MembershipCardWidget membership={membership} recommendation={membershipRecommendation} profile={profile} onRefresh={() => window.location.reload()} />
          <RewardWalletWidget wallet={rewardWallet} redemptionRules={redemptionRules} onRefresh={() => window.location.reload()} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <RecentOrders orders={orders} />

          <div className="space-y-5">
            <SaqsoCard>
              <h2 className="mb-5 text-2xl font-black text-zinc-950 dark:text-white">
                Active Shipment
              </h2>

              {tracking ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500">Courier: {tracking.courier || "N/A"}</p>
                  <p className="text-sm text-zinc-500">Tracking: {tracking.trackingCode || "N/A"}</p>
                  <p className="font-bold text-zinc-950 dark:text-white">{tracking.shipmentStatus || "PENDING"}</p>
                </div>
              ) : (
                <p className="text-zinc-500">No shipment available.</p>
              )}
            </SaqsoCard>

            <LoyaltyProgram />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-1 lg:grid-cols-2">
          <StyleProfile />
          <WishlistPreview />
        </div>

        <SavedLooksPreview />

        <AccountSettings
          profile={profile}
          fields={visibleFields}
          saving={saving}
          setProfile={setProfile}
          saveProfile={saveProfile}
        />

        <CustomerIntelligencePanel user={user} />

        <ActivityTimeline
          orders={orders}
          savedLooks={savedLooks}
          tryOnHistory={tryOnHistory}
          rewardWallet={rewardWallet}
          membership={membership}
        />

        <PersonalizedRecommendations />
      </div>
    </main>
  );
}











