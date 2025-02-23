import React from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12">
      <RegisterForm />
    </div>
  );
}
