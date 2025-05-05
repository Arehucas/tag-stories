'use client';
import React from 'react';

type ContextType = 'instagram' | 'chrome_ios' | 'safari_ios' | 'android' | 'other';

function isInstagramWebView() {
  const ua = navigator.userAgent || navigator.vendor;
  return /Instagram/.test(ua);
}

function isChromeOniOS() {
  const ua = navigator.userAgent;
  return /CriOS/.test(ua);
}

function isSafariOniOS() {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && /iPhone|iPad|iPod/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua);
}

function isAndroidBrowser() {
  const ua = navigator.userAgent;
  return /Android/.test(ua) && !/Instagram/.test(ua);
}

export default function TestSharePage() {
  let context: ContextType = 'other';
  if (typeof window !== 'undefined') {
    if (isInstagramWebView()) context = 'instagram';
    else if (isChromeOniOS()) context = 'chrome_ios';
    else if (isSafariOniOS()) context = 'safari_ios';
    else if (isAndroidBrowser()) context = 'android';
  }

  const contextText: Record<ContextType, string> = {
    instagram: 'Estás en el WebView de Instagram. Se intentará compartir nativo.',
    chrome_ios: 'Estás en Chrome para iOS. No se puede compartir imágenes directamente.',
    safari_ios: 'Estás en Safari para iOS. Se intentará compartir nativo.',
    android: 'Estás en un navegador Android. Se intentará compartir nativo.',
    other: 'Navegador no identificado. Se intentará compartir nativo.'
  };

  const contextLabel: Record<ContextType, string> = {
    instagram: 'Instagram WebView',
    chrome_ios: 'Chrome en iOS',
    safari_ios: 'Safari en iOS',
    android: 'Navegador Android',
    other: 'Otro navegador'
  };

  const handleShare = async () => {
    // Crear canvas rojo 1080x1920
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('No se pudo crear el canvas.');
      return;
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convertir a blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('No se pudo generar la imagen.');
        return;
      }
      const file = new File([blob], 'imagen-roja.jpg', { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Imagen generada',
            text: 'Esta es una imagen roja 9:16',
          });
        } catch {
          alert('No se pudo compartir la imagen.');
        }
      } else {
        alert('Tu navegador no permite compartir imágenes generadas.');
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test de compartir imagen</h1>
      <p>{contextText[context]}</p>
      <div style={{ margin: '16px 0', fontWeight: 'bold' }}>{contextLabel[context]}</div>
      <button onClick={handleShare}>Compartir imagen</button>
    </div>
  );
} 