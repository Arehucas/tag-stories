"use client";
import { useEffect } from "react";

export default function IGConnectLaunch() {
  useEffect(() => {
    const igOauthUrl = 'https://www.instagram.com/oauth/authorize?client_id=979575567711942&redirect_uri=https%3A%2F%2Fwww.taun.me%2Fig-connect%2Fcallback&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights';
    setTimeout(() => {
      window.location.replace(igOauthUrl);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Redirigiendo a Instagram...</h1>
        <p className="text-gray-700 text-center mb-2">Por favor, espera un momento.</p>
      </div>
    </div>
  );
} 