export const runtime = "nodejs";

import Cerdentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import type { NextAuthConfig } from "next-auth";
import { loginSchema } from "./lib/schemas/loginSchema";
import { getUserByEmail } from "./app/actions/authActions";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      // Prevents duplicate User rows when a Facebook account shares an email
      // with an existing credentials/Google user. Without this flag, a Facebook
      // login that matches an existing email would throw an OAuthAccountNotLinked
      // error. With email=null (Facebook without email permission), the adapter
      // still uses the Account row to ensure identity stability across logins.
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "public_profile",
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || null,
          image: profile.picture?.data?.url,
        } as any;
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }),
    Cerdentials({
      name: "credentials",
      async authorize(creds) {
        const validate = loginSchema.safeParse(creds);

        if (validate.success) {
          const { email, password } = validate.data;

          const user = await getUserByEmail(email);

          if (!user || !user.email) {
            throw new Error("פרטי התחברות שגויים");
          }

          if (!user.emailVerified) {
            throw new Error("אנא אמת את כתובת האימייל שלך לפני ההתחברות");
          }

          // Dynamic import to avoid SSR issues with bcryptjs
          const { compare } = await import("bcryptjs");
          if (
            !user.passwordHash ||
            !(await compare(password, user.passwordHash))
          ) {
            throw new Error("פרטי התחברות שגויים");
          }

          return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
