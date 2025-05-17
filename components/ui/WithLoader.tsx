"use client";
import React from "react";
import LoaderBolas from "@/components/ui/LoaderBolas";

interface WithLoaderProps {
  loading: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function WithLoader({ loading, fallback, children }: WithLoaderProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite">
        {fallback ?? <LoaderBolas />}
      </div>
    );
  }
  return <>{children}</>;
}

export default WithLoader; 