"use client";
import { useEffect } from 'react';

export default function TestSharePage() {
  useEffect(() => {
    const btn = document.createElement('button');
    btn.textContent = 'Compartir PNG rojo (fuera de React)';
    btn.style.padding = '16px 32px';
    btn.style.fontSize = '18px';
    btn.style.background = '#e11d48';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.position = 'fixed';
    btn.style.top = '40%';
    btn.style.left = '50%';
    btn.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(btn);

    btn.onclick = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 500, 500);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'rojo.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Imagen roja',
          text: 'Comparte este PNG rojo'
        });
      }, 'image/png');
    };

    return () => {
      document.body.removeChild(btn);
    };
  }, []);

  return <div style={{ textAlign: 'center', marginTop: 40 }}>Prueba el botón flotante fuera de React</div>;
} 