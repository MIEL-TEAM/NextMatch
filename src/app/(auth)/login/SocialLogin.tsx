import { Button } from "@nextui-org/react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function SocialLogin() {
  const onClick = (provider: "google" | "facebook") => {
    signIn(provider, {
      callbackUrl: "/members",
    });
  };

  return (
    <div className="flex items-center w-full gap-2">
      <Button
        size="lg"
        fullWidth
        variant="bordered"
        onPress={() => onClick("google")}
      >
        <FcGoogle size={24} />
      </Button>

      <Button
        size="lg"
        fullWidth
        variant="bordered"
        onPress={() => onClick("facebook")}
      >
        <FaFacebook size={24} className="text-[#0866ff]" />
      </Button>
    </div>
  );
}
