import React, { useEffect, useRef, forwardRef, Ref } from 'react';

interface PreviewComponentProps {
  baseImage: string; // dataURL o URL de la imagen base
  overlayUrl: string;
  logoUrl?: string;
  logoSize: number;
  marginBottom: number;
  marginRight: number;
  displayLogo: boolean;
  displayText: boolean;
  igText: {
    size: number;
    color: string;
    opacity: number;
  };
  addressText: {
    size: number;
    color: string;
    opacity: number;
  };
  igHandle?: string;
  address?: string;
}

export const PreviewComponent = forwardRef<HTMLCanvasElement, PreviewComponentProps>(({
  baseImage,
  overlayUrl,
  logoUrl,
  logoSize,
  marginBottom,
  marginRight,
  displayLogo,
  displayText,
  igText,
  addressText,
  igHandle,
  address,
}, ref: Ref<HTMLCanvasElement>) => {
  const localRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.MutableRefObject<HTMLCanvasElement | null>) || localRef;

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cargar imágenes
      const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Imagen base
      const base = await loadImg(baseImage);
      canvas.width = base.width;
      canvas.height = base.height;
      ctx.drawImage(base, 0, 0, base.width, base.height);

      // Overlay
      if (overlayUrl) {
        const overlay = await loadImg(overlayUrl);
        ctx.drawImage(overlay, 0, 0, base.width, base.height);
      }

      // Logo
      if (displayLogo && logoUrl) {
        const logo = await loadImg(logoUrl);
        const x = base.width - logoSize - marginRight;
        const y = base.height - logoSize - marginBottom;
        ctx.drawImage(logo, x, y, logoSize, logoSize);
      }

      // IG Text
      if (displayText && igHandle) {
        ctx.save();
        ctx.globalAlpha = igText.opacity;
        ctx.font = `${igText.size}px Instrument Sans, Arial, sans-serif`;
        ctx.fillStyle = igText.color;
        ctx.textBaseline = 'bottom';
        ctx.fillText(`@${igHandle}`, marginRight, base.height - marginBottom - logoSize - 10);
        ctx.restore();
      }

      // Address Text
      if (displayText && address) {
        ctx.save();
        ctx.globalAlpha = addressText.opacity;
        ctx.font = `${addressText.size}px Instrument Sans, Arial, sans-serif`;
        ctx.fillStyle = addressText.color;
        ctx.textBaseline = 'bottom';
        ctx.fillText(address, marginRight, base.height - marginBottom - 10);
        ctx.restore();
      }
    };
    draw();
  }, [baseImage, overlayUrl, logoUrl, logoSize, marginBottom, marginRight, displayLogo, displayText, igText, addressText, igHandle, address, canvasRef]);

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', borderRadius: 16, boxShadow: '0 2px 16px #0004' }} />
  );
});

PreviewComponent.displayName = 'PreviewComponent'; 