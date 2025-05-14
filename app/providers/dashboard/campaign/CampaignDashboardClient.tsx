"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useT } from '@/lib/useT';
import { useTemplates } from '@/hooks/useTemplates';
import { SelectedTemplateSection } from '@/components/SelectedTemplateSection';
import ProviderStoryCardList from '@/components/ui/ProviderStoryCardList';
import ProviderDashboardTabs from '@/components/ui/ProviderDashboardTabs';
import LoaderTable from '@/components/ui/LoaderTable';

// Defino interfaces para los estados
interface Provider {
  nombre?: string;
  logo_url?: string;
  slug?: string;
  overlayPreference?: string;
}
interface Campaign {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  isActive?: boolean;
  requiredStories?: number;
  overlayType?: string;
  overlayUrl?: string;
  templateId?: string;
}
interface Form {
  nombre: string;
  descripcion: string;
  isActive: boolean;
  requiredStories: number;
  overlayType: string;
  overlayUrl: string;
}

export default function CampaignDashboardClient() {
  // ...copia todo el contenido de la función CampaignDashboard de page.tsx aquí...
} 