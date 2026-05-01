import { Footer } from "@/components/shared/footer";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { Navbar } from "@/components/shared/navbar";

type StoreLayoutProps = {
  children: React.ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
