// Auth Form Props
export type EmailUserRegisterWrapperProps = {
  email?: string;
};

export type EmailUserProfileFormProps = {
  email?: string;
};

export type VerifyEmailClientProps = {
  token: string;
};

export type SocialLoginProps = {
  vertical?: boolean;
  callbackUrl?: string;
};

// User Types
export type UserType = "email" | "oauth" | "loading";
