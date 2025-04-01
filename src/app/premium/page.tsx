"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HeartLoading from "@/components/HeartLoading";
import { PremiumStatusCard } from "@/components/premium/status/PremiumStatusCard";
import { PremiumPlansGrid } from "@/components/premium/plans/PremiumPlansGrid";
import { SuccessMessage } from "@/components/premium/shared/SuccessMessage";
import { CancelSubscriptionModal } from "@/components/premium/modals/CancelSubscriptionModal";
import { getAllFeatures } from "@/components/premium/features/createFeaturesList";
import {
  activatePremium,
  getPremiumStatus,
  redirectToCancelSubscription,
  processCancellationReturn,
  createReactivateSubscriptionSession,
  checkStripeSubscriptionStatus,
  updatePremiumStatusFromStripe,
} from "@/app/actions/premiumActions";
import {
  PremiumInfo,
  PremiumStatusResponse,
  StatusMessage,
} from "@/components/premium/types";

export default function PremiumPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const features = getAllFeatures();

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // UI states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );

  // Premium states
  const [isPremium, setIsPremium] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo | null>(null);

  // Event states
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [justCanceled, setJustCanceled] = useState(false);
  const [justRenewed, setJustRenewed] = useState(false);

  // Handle successful Stripe checkout
  const handleStripeSuccess = useCallback(
    (data: PremiumStatusResponse) => {
      setJustSubscribed(true);
      setStatusMessage({
        message: "ההצטרפות לתכנית הפרימיום התקבלה בהצלחה!",
        type: "success",
      });

      setIsPremium(true);
      setPremiumInfo({
        premiumUntil:
          data.premiumUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        boostsAvailable: data.boostsAvailable || 10,
        activePlan: searchParams.get("plan") || "popular",
        canceledAt: null,
      });
    },
    [searchParams]
  );

  // Check premium status and handle URL parameters
  const checkPremiumStatus = useCallback(async () => {
    try {
      // Get URL parameters
      const success = searchParams.get("success") === "true";
      const refreshStatus = searchParams.get("refreshStatus") === "true";
      const sessionId = searchParams.get("session_id");
      const canceledAction = searchParams.get("canceled_action") === "true";
      const renewed = searchParams.get("renewed") === "true";

      // Handle cancellation return from Stripe
      if (canceledAction) {
        try {
          await processCancellationReturn();
          setJustCanceled(true);
          setStatusMessage({
            message:
              "המנוי בוטל בהצלחה, אך יישאר פעיל עד סוף תקופת החיוב הנוכחית",
            type: "warning",
          });
        } catch (cancelError) {
          console.error("Failed to process cancellation return:", cancelError);
        }
      }

      // Handle renewal return from Stripe
      if (renewed) {
        await checkStripeSubscriptionStatus();
        setJustRenewed(true);
        setStatusMessage({
          message: "המנוי חודש בהצלחה!",
          type: "success",
        });
      }

      // Handle successful payment
      if (success && sessionId) {
        try {
          await updatePremiumStatusFromStripe(sessionId);
        } catch (updateError) {
          console.error("Failed to update premium status:", updateError);
        }
      }

      // Refresh status if needed
      if (refreshStatus) {
        await checkStripeSubscriptionStatus();
      }

      // Get current premium status
      const data = await getPremiumStatus();

      if (!data.premiumUntil) {
        // Add a default date if none exists (if the user is premium)
        if (data.isPremium) {
          // Add three months from current date as a default
          const defaultDate = new Date();
          defaultDate.setMonth(defaultDate.getMonth() + 3);
          data.premiumUntil = defaultDate;
        }
      }

      // Update UI based on status
      if (success) {
        handleStripeSuccess(data);
      } else if (searchParams.get("canceled") === "true") {
        setStatusMessage({
          message: "תהליך התשלום בוטל",
          type: "error",
        });
      } else {
        // Normal status update
        const now = new Date();
        const premiumUntil = data.premiumUntil
          ? new Date(data.premiumUntil)
          : null;
        const isPremiumActive =
          data.isPremium || (premiumUntil && premiumUntil > now);

        if (isPremiumActive) {
          setIsPremium(true);
          setPremiumInfo({
            premiumUntil: data.premiumUntil,
            boostsAvailable: data.boostsAvailable || 0,
            activePlan: data.activePlan || "popular",
            canceledAt: data.canceledAt,
          });
        } else {
          setIsPremium(false);
          setPremiumInfo(null);
        }
      }
    } catch (error) {
      console.error("שגיאה בבדיקת סטטוס פרימיום:", error);
      setStatusMessage({
        message: "שגיאה בטעינת נתוני המנוי, אנא נסה שוב מאוחר יותר",
        type: "error",
      });
    } finally {
      setInitialLoading(false);
    }
  }, [searchParams, handleStripeSuccess]);

  // Initial check for premium status
  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  // Clear URL parameters after handling them
  useEffect(() => {
    const hasParams = searchParams.toString().length > 0;
    if (hasParams && !initialLoading) {
      const timeout = setTimeout(() => {
        router.replace("/premium", { scroll: false });
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [searchParams, initialLoading, router]);

  // Activate a premium plan
  const handleActivatePremium = useCallback(
    async (planId: string, months: number = 1) => {
      setLoadingPlan(planId);
      try {
        const formData = new FormData();
        formData.append("planId", planId);
        formData.append("months", months.toString());

        const result = await activatePremium(formData);

        if (result && result.success) {
          setIsPremium(true);
          setJustSubscribed(true);
          setPremiumInfo({
            premiumUntil: result.premiumUntil,
            boostsAvailable: result.boostsAvailable,
            activePlan: planId,
            canceledAt: null,
          });

          setStatusMessage({
            message: "ההצטרפות לתכנית הפרימיום התקבלה בהצלחה!",
            type: "success",
          });
        }
      } catch (error) {
        console.error("שגיאה בהפעלת פרימיום:", error);
        setStatusMessage({
          message: "שגיאה בהפעלת המנוי, אנא נסה שוב",
          type: "error",
        });
      } finally {
        setLoadingPlan(null);
      }
    },
    []
  );

  // Cancel subscription via Stripe portal
  const handleCancelSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const redirectUrl = await redirectToCancelSubscription();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("שגיאה בביטול המנוי:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "שגיאה בביטול המנוי, אנא נסה שוב";

      setStatusMessage({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  }, []);

  // Manage subscription via Stripe portal
  const handleManageSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "נכשל ביצירת הפעלה לפורטל החיוב");
      }

      if (!data.url) {
        throw new Error("לא הוחזרה כתובת URL מפורטל החיוב");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("שגיאה בגישה לפורטל החיוב:", error);
      setStatusMessage({
        message: "שגיאה בגישה לפורטל ניהול המנוי",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Renew Subscription
  const handleRenewSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const { url } = await createReactivateSubscriptionSession();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("שגיאה בחידוש המנוי:", error);
      setStatusMessage({
        message: "שגיאה בחידוש המנוי, אנא נסה שוב",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (initialLoading) {
    return <HeartLoading />;
  }

  const isCanceled = !!premiumInfo?.canceledAt;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">שדרג לחווית Miel פרימיום</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          גלה את כל היתרונות של חשבון פרמיום והגדל את הסיכויים למצוא את ההתאמה
          המושלמת
        </p>
      </div>

      {statusMessage && (
        <SuccessMessage
          message={statusMessage.message}
          type={statusMessage.type}
        />
      )}

      {isPremium && (
        <div className="mb-12">
          <PremiumStatusCard
            premiumUntil={premiumInfo?.premiumUntil || null}
            boostsAvailable={premiumInfo?.boostsAvailable || 0}
            onCancelSubscription={() => setShowCancelModal(true)}
            onManageSubscription={handleManageSubscription}
            showConfetti={justSubscribed || justRenewed}
            isManageLoading={isLoading}
            canceledAt={premiumInfo?.canceledAt}
            justCanceled={justCanceled}
            onRenewSubscription={
              isCanceled ? handleRenewSubscription : undefined
            }
          />
        </div>
      )}

      <div className={isPremium ? "mt-12" : ""}>
        {isPremium && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">
              {isCanceled
                ? "חדש את המנוי או בחר תוכנית אחרת"
                : "עדכן את תוכנית הפרימיום שלך"}
            </h2>
            <p className="text-gray-600">
              {isCanceled
                ? "המנוי שלך יפוג בקרוב - חדש אותו או בחר תוכנית אחרת"
                : "בחר תוכנית אחרת או המשך עם התוכנית הנוכחית שלך"}
            </p>
          </div>
        )}

        <PremiumPlansGrid
          onActivatePremium={handleActivatePremium}
          loadingPlan={loadingPlan}
          basicFeatures={features.basic}
          popularFeatures={features.popular}
          annualFeatures={features.annual}
          activePlan={isPremium ? premiumInfo?.activePlan : null}
          isCanceled={isCanceled}
          canceledAt={premiumInfo?.canceledAt}
          premiumUntil={premiumInfo?.premiumUntil}
          onCancel={
            isPremium && !isCanceled
              ? () => setShowCancelModal(true)
              : undefined
          }
        />
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isLoading}
      />
    </div>
  );
}
