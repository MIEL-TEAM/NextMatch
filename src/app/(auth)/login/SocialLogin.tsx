import { Button } from "@nextui-org/react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

type SocialLoginProps = {
  vertical?: boolean;
  callbackUrl?: string;
};

export default function SocialLogin({
  vertical = false,
  callbackUrl,
}: SocialLoginProps) {
  const onClick = (provider: "google" | "facebook") => {
    signIn(provider, callbackUrl ? { callbackUrl } : undefined);
  };

  return (
    <div
      className={`flex items-center w-full ${vertical ? "flex-col gap-4" : "gap-2"}`}
    >
      <Button
        size="lg"
        fullWidth
        variant={vertical ? "flat" : "bordered"}
        onPress={() => onClick("google")}
        className={
          vertical
            ? "bg-white/95 backdrop-blur-md text-gray-700 hover:bg-white h-14 text-base font-medium rounded-xl shadow-lg"
            : ""
        }
        startContent={<FcGoogle size={24} />}
      >
        {vertical && "התחברות עם Google"}
      </Button>

      <Button
        size="lg"
        fullWidth
        variant={vertical ? "flat" : "bordered"}
        onPress={() => onClick("facebook")}
        className={
          vertical
            ? "bg-white/95 backdrop-blur-md text-gray-700 hover:bg-white h-14 text-base font-medium rounded-xl shadow-lg"
            : ""
        }
        startContent={<FaFacebook size={24} className="text-[#0866ff]" />}
      >
        {vertical && "התחברות עם Facebook"}
      </Button>
    </div>
  );
}
