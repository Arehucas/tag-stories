import type { NextConfig } from "next";

export const i18n = {
  locales: ['es'],
  defaultLocale: 'es',
};

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  i18n,
  /* config options here */
};

export default nextConfig;
