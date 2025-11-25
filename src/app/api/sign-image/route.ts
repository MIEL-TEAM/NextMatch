import { cloudinary } from "@/lib/cloudinary";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const isAuthenticated = !!session?.user?.id;

    const body = (await request.json()) as {
      paramsToSign: Record<string, string>;
    };
    const { paramsToSign } = body;

    if (!isAuthenticated) {
      const folder = paramsToSign.folder || "";
      const isRegistrationUpload =
        folder.includes("registration") ||
        folder.includes("profile-setup") ||
        folder.includes("signup");

      if (!isRegistrationUpload) {
        console.warn(
          "⚠️ Unauthenticated upload attempt to non-registration folder:",
          folder
        );
        return Response.json(
          {
            error:
              "Unauthorized - Registration uploads only allowed to registration folders",
          },
          { status: 401 }
        );
      }

      console.log(
        "📸 Registration upload request (unauthenticated) to folder:",
        folder
      );
    } else {
      console.log(
        "📸 Authenticated upload request from user:",
        session.user.id
      );
    }

    // Generate Cloudinary signature
    const signature = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return Response.json({ signature });
  } catch (error) {
    console.error("❌ Error in /api/sign-image:", error);
    return Response.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
