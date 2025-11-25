import { getSession } from "@/lib/session";
import ClientSession from "@/components/ClientSession";

export default async function Home() {
  // ✅ Uses cached session - deduped with layout
  const session = await getSession();

  return (
    <div className="flex flex-row justify-around mt-20 gap-6">
      <div className="bg-green-50 p-10 rounded-xl shadow-md w-1/2 overflow-auto">
        <h3 className=" text-2xl font-semibold">Server session data:</h3>
        {session ? (
          <div>
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        ) : (
          <div>Not signed in</div>
        )}
      </div>
      <ClientSession />
    </div>
  );
}
