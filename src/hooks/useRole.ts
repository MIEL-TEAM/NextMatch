import { useServerSession } from "@/contexts/SessionContext";

export const useRole = () => {
  const { session } = useServerSession();

  return session?.user?.role;
};
