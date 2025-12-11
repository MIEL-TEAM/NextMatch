import { getSession } from "@/lib/session";
import MembersClient from "./MembersClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
};

export default async function MembersPage() {
  try {
    console.log("[MembersPage] Starting to load page...");
    const session = await getSession();
    console.log("[MembersPage] Session loaded:", session ? "YES" : "NO");

    // If no session, redirect to login
    if (!session) {
      console.log("[MembersPage] No session, redirecting to /login");
      redirect("/login");
    }

    console.log("[MembersPage] Rendering MembersClient");
    return <MembersClient serverSession={session} />;
  } catch (error) {
    console.error("[MembersPage] Critical error:", error);
    // Return a simple error page instead of crashing
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>שגיאה בטעינת הדף</h1>
        <p>מצטערים, אירעה שגיאה. אנא נסה שוב מאוחר יותר.</p>
        <pre
          style={{ textAlign: "left", background: "#f0f0f0", padding: "10px" }}
        >
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
