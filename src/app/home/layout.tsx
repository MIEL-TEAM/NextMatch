// app/home/layout.tsx
import HomePageWrapper from "@/app/HomePageWrapper";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomePageWrapper>{children}</HomePageWrapper>;
}
