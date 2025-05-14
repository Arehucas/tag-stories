"use client";
import { SessionProvider } from "next-auth/react";
import { CampaignTransitionProvider } from "./campaign/CampaignDashboardClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CampaignTransitionProvider>
        {children}
      </CampaignTransitionProvider>
    </SessionProvider>
  );
} 