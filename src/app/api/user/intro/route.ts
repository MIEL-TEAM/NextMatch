import { markIntroAsSeen } from "@/app/actions/userActions";

export async function POST() {
  const result = await markIntroAsSeen();
  if (result.status === "error") {
    return new Response(result.error as string, { status: 500 });
  }

  return new Response("OK");
}
