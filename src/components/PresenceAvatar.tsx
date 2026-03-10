import usePresenceStore from "@/hooks/usePresenceStore";
import { Avatar, Badge } from "@nextui-org/react";

type PresenceAvatarProps = {
  userId?: string;
  src?: string | null;
};
export default function PresenceAvatar({ userId, src }: PresenceAvatarProps) {
  const isOnline = usePresenceStore((state) =>
    userId ? state.members.includes(userId) : false
  );

  return (
    <Badge content="" color="success" shape="circle" isInvisible={!isOnline}>
      <Avatar src={src || "/images/user.png"} alt="User avatar" />
    </Badge>
  );
}
