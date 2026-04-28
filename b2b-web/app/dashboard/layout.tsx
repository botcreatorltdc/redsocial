"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/");
        return;
      }

      const userId = session.user.id;
      const { data: clubs, error } = await supabase
        .from("clubs")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      if (error) {
        console.error("No se pudo comprobar el club del owner:", error.message);
        setIsChecking(false);
        return;
      }

      const hasClub = Boolean(clubs && clubs.length > 0);
      const isOnboardingRoute = pathname === "/dashboard/onboarding";

      if (!hasClub && !isOnboardingRoute) {
        router.replace("/dashboard/onboarding");
        return;
      }

      if (hasClub && isOnboardingRoute) {
        router.replace("/dashboard");
        return;
      }

      setIsChecking(false);
    };

    void checkAccess();
  }, [pathname, router]);

  if (isChecking) return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "◦" },
    { href: "/dashboard/inventory", label: "Inventory", icon: "◦" },
    { href: "/dashboard/settings", label: "Settings", icon: "◦" },
    { href: "/dashboard/moderation", label: "Moderation", icon: "◦" }
  ];

  return (
    <div className="min-h-screen bg-botanical-bg text-botanical-text">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 md:px-8">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-botanical-line bg-white p-6 shadow-botanical md:block">
          <p className="font-serif text-2xl text-botanical-primary">Botanical Club</p>
          <nav className="mt-10 space-y-5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm tracking-[0.08em] transition ${
                    isActive
                      ? "bg-botanical-primary text-white"
                      : "text-botanical-muted hover:bg-botanical-bg hover:text-botanical-primary"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex gap-2 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-xs tracking-[0.08em] ${
                  pathname === item.href
                    ? "bg-botanical-primary text-white"
                    : "bg-white text-botanical-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
