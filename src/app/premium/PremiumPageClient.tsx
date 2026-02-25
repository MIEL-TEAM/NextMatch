"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PremiumState, StatusMessage } from "@/components/premium/types";
import { ProspectView } from "@/components/premium/ProspectView";
import { PendingView } from "@/components/premium/PendingView";
import { SubscriberView } from "@/components/premium/SubscriberView";
import { ActivationView } from "@/components/premium/ActivationView";
import { CancelSubscriptionModal } from "@/components/premium/modals/CancelSubscriptionModal";
import { SuccessMessage } from "@/components/premium/shared/SuccessMessage";
import {
  activatePremium,
  cancelPremium,
  createReactivateSubscriptionSession,
} from "@/app/actions/premiumActions";

interface PremiumPageClientProps {
  state: PremiumState;
  activated: boolean;
  firstName: string;
}

function isRecentlyActivated(activatedAt: Date | null): boolean {
  if (!activatedAt) return false;
  return Date.now() - new Date(activatedAt).getTime() < 30 * 60 * 1000;
}

export default function PremiumPageClient({ state, activated, firstName }: PremiumPageClientProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [showActivation, setShowActivation] = useState(activated);

  const handleActivate = async (planId: string, months: number) => {
    setLoadingPlan(planId);
    const fd = new FormData();
    fd.append("planId", planId);
    fd.append("months", String(months));
    try {
      const result = await activatePremium(fd);
      if (result?.success) {
        router.push("/premium?activated=1");
      }
    } catch {
      setStatusMessage({ message: "שגיאה בהפעלת המנוי, אנא נסה שוב", type: "error" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setIsActionLoading(true);
    try {
      await cancelPremium();
      router.refresh();
      setStatusMessage({ message: "המנוי בוטל בהצלחה", type: "success" });
    } catch (err) {
      setStatusMessage({
        message: err instanceof Error ? err.message : "שגיאה בביטול המנוי",
        type: "error",
      });
    } finally {
      setIsActionLoading(false);
      setShowCancelModal(false);
    }
  };

  const handleRenew = async () => {
    setIsActionLoading(true);
    try {
      const { url } = await createReactivateSubscriptionSession();
      if (url) window.location.href = url;
    } catch (err) {
      setStatusMessage({
        message: err instanceof Error ? err.message : "שגיאה בחידוש המנוי",
        type: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  

  const view = (() => {

    console.log("STATUS:", state.status)
    console.log("ACTIVATED PARAM:", activated)
    console.log("NOW:", new Date())

    switch (state.status) {
      case "FREE":
        return (
          <ProspectView
            plans={state.availablePlans}
            onActivate={handleActivate}
            loadingPlan={loadingPlan}
          />
        );
      case "PENDING":
        return <PendingView activated={activated} />;
      case "ACTIVE":
        if (showActivation && isRecentlyActivated(state.subscription.activatedAt)) {
          return (
            <ActivationView
              firstName={firstName}
              boosts={state.subscription.boostsAvailable}
              onDone={() => setShowActivation(false)}
            />
          );
        }
        return (
          <SubscriberView
            state={state}
            onActivate={handleActivate}
            onCancelRequest={() => setShowCancelModal(true)}
            onRenew={handleRenew}
            loadingPlan={loadingPlan}
            isActionLoading={isActionLoading}
          />
        );
      case "CANCELED":
      case "PAST_DUE":
        return (
          <SubscriberView
            state={state}
            onActivate={handleActivate}
            onCancelRequest={() => setShowCancelModal(true)}
            onRenew={handleRenew}
            loadingPlan={loadingPlan}
            isActionLoading={isActionLoading}
          />
        );
    }
  })();

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4" dir="rtl">
      {statusMessage && (
        <SuccessMessage message={statusMessage.message} type={statusMessage.type} />
      )}
      {view}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isLoading={isActionLoading}
      />
    </div>
  );
}
