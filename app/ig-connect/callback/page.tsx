"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IGCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('Vinculando cuenta de Instagram...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) {
      setStatus('error');
      setMessage('No se recibió el código de Instagram.');
      return;
    }
    fetch("/api/ig-connect/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        setStatus('success');
        setMessage('¡Cuenta de Instagram vinculada correctamente!');
        setTimeout(() => router.push("/providers/dashboard"), 2000);
      })
      .catch((e) => {
        setStatus('error');
        setMessage('Error al vincular la cuenta de Instagram: ' + e.message);
      });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Vinculación de Instagram</h1>
        <p className={`text-center ${status === 'error' ? 'text-red-500' : 'text-gray-700'}`}>{message}</p>
      </div>
    </div>
  );
} 