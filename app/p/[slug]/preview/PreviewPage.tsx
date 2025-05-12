"use client";
import Steps from '@/components/ui/Steps';
import { useImageStore } from '@/hooks/useImageStore';
import Image from 'next/image';
import { useProviderStore } from '@/hooks/useProviderStore';
import ProviderHeader from '@/components/ui/ProviderHeader';
import { useRouter } from 'next/navigation';
import { use } from "react";
import { useT } from '@/lib/useT';
import { useEffect, useState } from 'react';
import { get as idbGet } from 'idb-keyval';
import { Instrument_Sans } from 'next/font/google';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const croppedImage = useImageStore(state => state.croppedImage);
  const setCroppedImage = useImageStore(state => state.setCroppedImage);
  const provider = useProviderStore(state => state.provider);
  const setProvider = useProviderStore(state => state.setProvider);
  const steps = [
    { title: 'Sube tu foto', description: 'Saca o elige una foto' },
    { title: 'Ajusta tu imagen', description: 'Recorta y ajusta tu foto.' },
    { title: 'Comparte', description: <><div>Publica tu story en Instagram.</div>{provider?.instagram_handle && <div>Etiqueta a @{provider.instagram_handle}</div>}</> },
  ];

  const router = useRouter();
  const t = useT();

  // Estado para debug visual
  const [debugInfo, setDebugInfo] = useState<{ size: number; type: string } | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [jpegDataUrl, setJpegDataUrl] = useState<string | null>(null);
  const [jpegSize, setJpegSize] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    // Restaurar provider desde localStorage si no está en el store
    if (!provider) {
      const prov = localStorage.getItem('taun_provider');
      if (prov) setProvider(JSON.parse(prov));
    }
    setIsReady(true);
  }, [provider, setProvider]);

  useEffect(() => {
    if (isReady && typeof window !== 'undefined') {
      const host = window.location.hostname;
      setIsLocalhost(
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.')
      );
    }
  }, [isReady]);

  // Recuperar imagen cropeada de IndexedDB si no está en memoria
  useEffect(() => {
    if (!isReady) return;
    if (typeof window === 'undefined') return;
    if (!croppedImage) {
      idbGet('taun_cropped_image').then((img: string | undefined) => {
        if (img) {
          setCroppedImage(img);
          setDebugInfo({
            size: Math.round((img.length * 3 / 4) / 1024),
            type: 'image/png',
          });
        } else {
          setDebugInfo(null);
        }
      });
    } else {
      setDebugInfo({
        size: Math.round((croppedImage.length * 3 / 4) / 1024),
        type: 'image/png',
      });
    }
  }, [croppedImage, setCroppedImage, isReady]);

  // Generar DataURL JPEG desde el PNG cropeado
  useEffect(() => {
    if (!isReady) return;
    if (!croppedImage) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // Asegura que no haya problemas de CORS
    img.src = croppedImage;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo obtener el contexto del canvas.');
        ctx.drawImage(img, 0, 0);
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
        setJpegDataUrl(jpegUrl);
        setJpegSize(Math.round((jpegUrl.length * 3 / 4) / 1024));
      } catch (err) {
        setJpegDataUrl(null);
        setJpegSize(null);
        alert('Error generando la imagen de preview: ' + (err?.toString() || ''));
      }
    };
    img.onerror = (err) => {
      setJpegDataUrl(null);
      setJpegSize(null);
      alert('Error cargando la imagen para generar el preview.');
    };
  }, [croppedImage, isReady]);

  // Redirigir si no hay imagen cropeada (solo tras intentar recuperar de IndexedDB)
  useEffect(() => {
    if (isReady && typeof window !== 'undefined' && !croppedImage) {
      router.replace(`/p/${slug}`);
    }
  }, [croppedImage, router, slug, isReady]);

  // Obtener campaña y template al cargar
  useEffect(() => {
    if (!isReady || !slug) return;
    fetch(`/api/provider/${slug}/campaign`)
      .then(res => res.ok ? res.json() : null)
      .then(async (camp) => {
        if (camp && camp.templateId) {
          setCampaign(camp);
          // Obtener todas las plantillas permitidas por plan
          const templatesRes = await fetch('/api/templates');
          if (templatesRes.ok) {
            const templates = await templatesRes.json();
            // Buscar la plantilla correspondiente
            const found = templates.find((t: any) => t._id === camp.templateId || t._id === camp.templateId?.toString());
            if (found) setTemplate(found);
            else setTemplate(null);
          } else {
            setTemplate(null);
          }
        } else {
          setTemplate(null);
        }
      })
      .catch(() => setTemplate(null));
  }, [isReady, slug]);

  if (!isReady) {
    return <div />;
  }

  async function subirImagenViaBackend(dataUrl: string): Promise<string | null> {
    const formData = new FormData();
    // Convierte el dataUrl a un Blob
    const arr = dataUrl.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'image/png';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8arr], { type: mime });
    formData.append('file', blob, 'story.png');
    setUploading(true);
    setUploadResponse(null);
    let data = {};
    try {
      const res = await fetch('/api/upload-logo', { method: 'POST', body: formData });
      data = await res.json();
    } catch (e) {
      data = { error: e?.toString() };
    }
    setUploadResponse(data);
    setUploading(false);
    return (data as any).url || null;
  }

  // --- Lógica de compartir multiplataforma adaptada de testshare ---
  function isInstagramWebView() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor : '';
    return /Instagram/.test(ua);
  }
  function isChromeOniOS() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return /CriOS/.test(ua);
  }
  function isSafariOniOS() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return /Safari/.test(ua) && /iPhone|iPad|iPod/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua);
  }
  function isAndroidBrowser() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return /Android/.test(ua) && !/Instagram/.test(ua);
  }
  function getShareContext() {
    if (isInstagramWebView()) return 'instagram';
    if (isChromeOniOS()) return 'chrome_ios';
    if (isSafariOniOS()) return 'safari_ios';
    if (isAndroidBrowser()) return 'android';
    return 'other';
  }

  async function handleShareJPEG(jpegDataUrl: string) {
    const arr = jpegDataUrl.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8arr], { type: mime });
    const file = new File([blob], 'story.jpg', { type: mime });
    const context = getShareContext();
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Imagen para Instagram Story',
          text: 'Comparte tu imagen en Instagram Stories',
        });
        return;
      } catch {
        alert('No se pudo compartir la imagen. Se descargará.');
      }
    } else {
      let msg = '';
      if (context === 'chrome_ios') {
        msg = 'Estás en Chrome para iOS. No se puede compartir imágenes directamente. Se descargará la imagen.';
      } else if (context === 'instagram') {
        msg = 'Estás en el WebView de Instagram. Si no se abre el diálogo de compartir, descarga la imagen y súbela manualmente.';
      } else {
        msg = 'Tu navegador no permite compartir imágenes generadas. Se descargará la imagen.';
      }
      alert(msg);
    }
    // Fallback: descarga automática
    const urlDescarga = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlDescarga;
    a.download = 'story.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(urlDescarga);
    }, 200);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] flex flex-col items-center">
      <ProviderHeader logoUrl={provider?.logo_url} instagramHandle={provider?.instagram_handle} />
      <div className="flex flex-col items-center w-full max-w-xs gap-8 mx-auto">
        <div className="w-full flex flex-col items-center mt-8">
          <div className="flex flex-col items-center w-full" style={{ gap: '0.5rem' }}>
            <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0 mx-auto" style={{ height: '426.67px', width: '240px' }}>
              {croppedImage && template ? (
                <>
                  {/* Imagen base */}
                  <Image src={croppedImage} alt="Preview" fill className="object-cover" />
                  {/* Overlay */}
                  <Image src={template.overlayUrl} alt="Overlay" fill className="object-cover" style={{zIndex: 1}} />
                  {/* Logo */}
                  {template.displayLogo && provider?.logo_url && (
                    <div style={{
                      position: 'absolute',
                      right: template.marginRight,
                      bottom: template.marginBottom,
                      width: template.logoSize,
                      height: template.logoSize,
                      zIndex: 2,
                      background: 'rgba(255,255,255,0.0)',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Image
                        src={provider.logo_url}
                        alt={provider.nombre || 'Logo'}
                        width={template.logoSize}
                        height={template.logoSize}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }}
                        priority
                      />
                    </div>
                  )}
                  {/* IG Text + icono */}
                  {template.displayText && provider?.instagram_handle && (
                    <span
                      style={{
                        position: 'absolute',
                        left: template.marginRight,
                        bottom: template.marginBottom + template.logoSize + 10,
                        fontSize: template.igText.size,
                        color: template.igText.color,
                        opacity: template.igText.opacity,
                        fontWeight: 600,
                        zIndex: 3,
                        textShadow: '0 1px 4px #0008',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}><rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12"/><path d="M7.75 12C7.75 14.0711 9.42893 15.75 11.5 15.75C13.5711 15.75 15.25 14.0711 15.25 12C15.25 9.92893 13.5711 8.25 11.5 8.25C9.42893 8.25 7.75 9.92893 7.75 12Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor"/><rect x="3.75" y="3.75" width="15.5" height="15.5" rx="4.25" stroke="currentColor" strokeWidth="1.5"/></svg>
                      @{provider.instagram_handle}
                    </span>
                  )}
                  {/* Address Text */}
                  {template.displayText && provider?.direccion && (
                    <span
                      style={{
                        position: 'absolute',
                        left: template.marginRight,
                        bottom: template.marginBottom + 10,
                        fontSize: template.addressText.size,
                        color: template.addressText.color,
                        opacity: template.addressText.opacity,
                        fontWeight: 400,
                        zIndex: 3,
                        textShadow: '0 1px 4px #0008',
                      }}
                    >
                      {provider.direccion}
                    </span>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-2xl">
                  {t('public_stories.no_image')}
                </div>
              )}
            </div>
            {isLocalhost && debugInfo && (
              <div className="w-full bg-black/60 text-xs text-white rounded-lg p-2 my-2">
                <div><b>DEBUG VISUAL (IP local):</b></div>
                <div><b>Tamaño:</b> {debugInfo.size} KB</div>
                <div><b>Tipo:</b> {debugInfo.type}</div>
              </div>
            )}
            {isLocalhost && !debugInfo && (
              <div className="w-full bg-yellow-900/60 text-xs text-white rounded-lg p-2 my-2">
                <b>DEBUG VISUAL ACTIVO:</b> No hay imagen cropeada cargada.
              </div>
            )}
            <button
              className="w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg mt-4 mb-2"
              disabled={!croppedImage || !jpegDataUrl || uploading}
              onClick={async () => {
                if (!croppedImage || !jpegDataUrl) {
                  alert('La imagen de preview no está lista.');
                  return;
                }
                setUploading(true);
                setUploadResponse(null);
                try {
                  // 1. Preparar archivo JPEG
                  const arr = jpegDataUrl.split(',');
                  const bstr = atob(arr[1]);
                  const u8arr = new Uint8Array(bstr.length);
                  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
                  const blob = new Blob([u8arr], { type: 'image/jpeg' });
                  const fileName = provider && provider.instagram_handle ? `story-${provider.instagram_handle}.jpg` : 'story-local.jpg';
                  const file = new File([blob], fileName, { type: 'image/jpeg' });
                  let compartido = false;
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                      await navigator.share({
                        files: [file],
                        title: 'Comparte tu story',
                        text: 'Publica tu story en Instagram',
                      });
                      compartido = true;
                    } catch (e: any) {
                      compartido = false;
                      // Siempre mostrar el mensaje personalizado si no se comparte
                      const ig = provider?.instagram_handle ? `@${provider.instagram_handle}` : '@ighandler';
                      alert(`¡No has compartido la story! ${ig} no podrá revisar tu story y darte tu recompensa.`);
                    }
                  }
                  if (compartido) {
                    // 2. Subir a Cloudinary
                    const formData = new FormData();
                    formData.append('file', blob, fileName);
                    const uploadRes = await fetch('/api/upload-logo', {
                      method: 'POST',
                      body: formData,
                    });
                    const uploadData = await uploadRes.json();
                    if (!uploadData.url) throw new Error('Error subiendo a Cloudinary: ' + JSON.stringify(uploadData));
                    // 3. Guardar en BBDD
                    const saveRes = await fetch('/api/story-submission', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ providerId: slug, imageUrl: uploadData.url }),
                    });
                    const saveData = await saveRes.json();
                    if (!saveRes.ok) throw new Error('Error guardando en BBDD: ' + JSON.stringify(saveData));
                    setUploadResponse({ cloudinary: uploadData, db: saveData });
                  }
                  // Si no se pudo compartir, no hacer nada (ni descarga ni alerta extra)
                } catch (e) {
                  setUploadResponse({ error: e?.toString() });
                  alert('Error en compartir/guardar: ' + (e?.toString() || ''));
                  console.error('Error en compartir/guardar:', e);
                } finally {
                  setUploading(false);
                }
              }}
            >
              {uploading ? t('public_stories.generating_story') : t('public_stories.share_instagram')}
            </button>
            {isLocalhost && (
              <div className="w-full bg-black/60 text-xs text-white rounded-lg p-2 my-2">
                <div><b>DEBUG VISUAL (IP local):</b></div>
                {croppedImage ? (
                  <>
                    <div><b>Nombre:</b> story.png</div>
                    <div><b>Tamaño:</b> {Math.round((croppedImage.length * 3 / 4) / 1024)} KB</div>
                    <div><b>Tipo:</b> image/png</div>
                    <div><b>DataURL inicio PNG:</b><br />
                      {croppedImage.slice(0, 100).match(/.{1,50}/g)?.map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </div>
                    <div><b>DataURL fin PNG:</b><br />
                      {croppedImage.slice(-100).match(/.{1,50}/g)?.map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </div>
                    {jpegDataUrl && (
                      <>
                        <div className="mt-2"><b>Nombre:</b> story.jpg</div>
                        <div><b>Tamaño:</b> {jpegSize} KB</div>
                        <div><b>Tipo:</b> image/jpeg</div>
                        <div><b>DataURL inicio JPEG:</b><br />
                          {jpegDataUrl.slice(0, 100).match(/.{1,50}/g)?.map((line, i) => (
                            <span key={i}>{line}<br /></span>
                          ))}
                        </div>
                        <div><b>DataURL fin JPEG:</b><br />
                          {jpegDataUrl.slice(-100).match(/.{1,50}/g)?.map((line, i) => (
                            <span key={i}>{line}<br /></span>
                          ))}
                        </div>
                        <button
                          className="mt-2 px-3 py-1 rounded bg-blue-700 text-white"
                          onClick={async () => {
                            if (jpegDataUrl) {
                              await handleShareJPEG(jpegDataUrl);
                            }
                          }}
                        >Compartir/Descargar JPEG</button>
                      </>
                    )}
                  </>
                ) : (
                  <div>No hay imagen cropeada cargada.</div>
                )}
              </div>
            )}
            {isLocalhost && uploading && (
              <div className="w-full bg-blue-900/60 text-xs text-white rounded-lg p-2 my-2">Subiendo imagen...</div>
            )}
            {isLocalhost && uploadResponse && (
              <div className="w-full bg-red-900/60 text-xs text-white rounded-lg p-2 my-2">
                <div><b>Respuesta backend:</b> {JSON.stringify(uploadResponse)}</div>
              </div>
            )}
          </div>
        </div>
        <Steps steps={steps} current={2} />
      </div>
      <div className="flex justify-center w-full mt-0 mb-[50px]">
        <button
          className="w-full max-w-xs mt-5 border border-white/40 text-white/80 rounded-xl px-6 py-2 hover:bg-white/10 transition"
          onClick={() => router.push(`/p/${slug}`)}
        >
          {t('public_stories.upload_another')}
        </button>
      </div>
    </div>
  );
} 