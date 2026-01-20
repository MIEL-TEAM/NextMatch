import { Button } from "@nextui-org/react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

type SocialLoginProps = {
  vertical?: boolean;
  callbackUrl?: string;
  buttonClassName?: string;
};

export default function SocialLogin({
  vertical = false,
  callbackUrl,
  buttonClassName = "", 
}: SocialLoginProps) {
  const onClick = (provider: "google" | "facebook") => {
    signIn(provider, callbackUrl ? { callbackUrl } : undefined);
  };

  const defaultClassName = vertical
    ? "bg-white/95 backdrop-blur-md text-gray-700 hover:bg-white h-10 text-base font-medium rounded-md shadow-lg"
    : "";

  return (
    <div
      className={`flex items-center w-full ${vertical ? "flex-col gap-4" : "gap-2"}`}
    >
      <Button
        size="lg"
        fullWidth
        variant={vertical ? "flat" : "bordered"}
        onPress={() => onClick("google")}
        className={`${buttonClassName || defaultClassName} ${vertical ? "relative" : ""}`}
        startContent={!vertical ? <FcGoogle size={24} /> : undefined}
      >
        {vertical && (
          <>
            <span className="absolute right-4">
              <FcGoogle size={24} />
            </span>
            <span>התחברות עם Google</span>
          </>
        )}
      </Button>

      <Button
        size="lg"
        fullWidth
        variant={vertical ? "flat" : "bordered"}
        onPress={() => onClick("facebook")}
        className={`${buttonClassName || defaultClassName} ${vertical ? "relative" : ""}`}
        startContent={!vertical ? <FaFacebook size={24} className="text-[#0866ff]" /> : undefined}
      >
        {vertical && (
          <>
            <span className="absolute right-4">
              <FaFacebook size={24} className="text-[#0866ff]" />
            </span>
            <span>התחברות עם Facebook</span>
          </>
        )}
      </Button>
    </div>
  );
}