'use client';
import React from 'react';

const IMAGE_URL = 'https://res.cloudinary.com/dg2xe4wtu/image/upload/v1746468351/provider_logos/f01t5exk9woz8opuxa1a.jpg';

type ContextType = 'instagram' | 'chrome_ios' | 'android' | 'other';

function isInstagramWebView() {
  const ua = navigator.userAgent || navigator.vendor;
  return /Instagram/.test(ua);
}

function isChromeOniOS() {
  const ua = navigator.userAgent;
  return /CriOS/.test(ua);
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
    else if (isAndroidBrowser()) context = 'android';
  }

  const contextText: Record<ContextType, string> = {
    instagram: 'Estás en el WebView de Instagram. Se intentará compartir nativo.',
    chrome_ios: 'Estás en Chrome para iOS. Se intentará compartir nativo (puede que no funcione).',
    android: 'Estás en un navegador Android. Se intentará compartir nativo.',
    other: 'Navegador no identificado. Se intentará compartir nativo.'
  };

  const contextLabel: Record<ContextType, string> = {
    instagram: 'Instagram WebView',
    chrome_ios: 'Chrome en iOS',
    android: 'Navegador Android',
    other: 'Otro navegador'
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (context === 'chrome_ios') {
          await navigator.share({
            title: 'Mira esta imagen',
            text: '¡Echa un vistazo a esta imagen!',
            url: IMAGE_URL,
          });
        } else {
          await navigator.share({
            title: 'Test de compartir imagen',
            text: '¡Mira esta imagen!',
            url: IMAGE_URL,
          });
        }
      } catch (err) {
        alert('No se pudo compartir la imagen.');
      }
    } else {
      alert('El navegador no soporta compartir nativo.');
    }
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