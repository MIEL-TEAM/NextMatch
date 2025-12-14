export const metadata = {
  title: "Miel – Application Information",
  description:
    "Information about Miel dating application for OAuth verification purposes",
  robots: "index, follow",
};

export default function OAuthPage() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.miel-love.com";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Miel – Application Information
        </h1>

        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
          <p>
            Miel is a dating application designed to help people create
            meaningful connections.
          </p>

          <p>
            Users can create a personal profile, discover compatible matches,
            and communicate with other users through the platform.
          </p>

          <p>
            Miel supports Google Sign-In to allow users to securely create and
            access their accounts. When users sign in with Google, Miel collects
            basic profile information such as name, email address, and profile
            photo for authentication purposes only.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Related Information
          </h2>
          <ul className="space-y-3 text-lg">
            <li>
              <a
                href={`${siteUrl}/privacy`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href={`${siteUrl}/terms`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
