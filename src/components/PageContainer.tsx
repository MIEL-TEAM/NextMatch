"use client";

import { ReactNode } from "react";
import MielLayout from "@/app/mielLayout";
import MielFooter from "./FooterMainPage";

type PageContainerProps = {
  children: ReactNode;
  title: string;
};

export default function PageContainer({ children, title }: PageContainerProps) {
  return (
    <MielLayout>
      <div className="container mx-auto px-4 py-12" dir="rtl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-amber-800">
          {title}
        </h1>
        <div className="prose prose-amber prose-lg max-w-none">{children}</div>
      </div>
      <MielFooter />
    </MielLayout>
  );
}
