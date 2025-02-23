import React from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12">
      <LoginForm />
    </div>
  );
}
