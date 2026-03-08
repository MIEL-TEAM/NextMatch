"use client";

import CardWrapper from "@/components/CardWrapper";
import { useCopy } from "@/lib/copy";
import Icon from "@/lib/table/Icon";
import { useRouter } from "next/navigation";

export default function RegisterSuccessClient() {
  const { t } = useCopy("onboarding");
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardWrapper
        headerText={t("register.success.header")}
        subHeaderText={t("register.success.subtitle")}
        headerIcon={<Icon name="paper-plane" type="sol" className="size-[30px] bg-secondary" />}
        action={() => router.push("/login")}
        actionLabel="עבור להתחברות"
      />
    </div>
  );
}
