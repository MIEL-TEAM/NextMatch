export const runtime = "nodejs";

import Cerdentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import type { NextAuthConfig } from "next-auth";
import { loginSchema } from "./lib/schemas/loginSchema";
import { getUserByEmail } from "./app/actions/authActions";
import { compare } from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
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

          // Comprehensive validation in one place
          if (!user || !user.email) {
            throw new Error("פרטי התחברות שגויים");
          }

          if (!user.emailVerified) {
            throw new Error("אנא אמת את כתובת האימייל שלך לפני ההתחברות");
          }

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
