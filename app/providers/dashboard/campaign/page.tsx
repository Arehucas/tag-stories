import { Suspense } from "react";
import CampaignDashboardClient from './CampaignDashboardClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CampaignDashboardClient />
    </Suspense>
  );
} 