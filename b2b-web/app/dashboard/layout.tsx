"use client";

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
        router.replace("/dashboard/onboarding");
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

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
