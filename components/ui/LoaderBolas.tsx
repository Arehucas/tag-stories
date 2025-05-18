import React from "react";
import { useT } from '@/lib/useT';

export default function LoaderBolas({ text }: { text?: string }) {
  const t = useT();
  const mensajes = [
    "Afilando bits y ajustando pixeles...",
    "Convenciendo a los servidores de que cooperen...",
    "Tu momento de gloria está a milisegundos...",
    "Reuniendo datos, café y buena vibra...",
    "Esto no es magia... pero casi...",
    "Leyendo las letras pequeñas del universo...",
    "Enviando palomas mensajeras digitales...",
    "Haciendo scroll en el código fuente del destino...",
    "Recargando el karma de los botones...",
    "Poniéndonos guapos para ti...",
  ];
  const randomMensaje = React.useMemo(() => mensajes[Math.floor(Math.random() * mensajes.length)], []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#18122b] relative" role="status" aria-live="polite">
      <div className="ghost-loader w-2/3 max-w-xs sm:w-56 sm:max-w-[220px]" style={{ maxWidth: '90vw', aspectRatio: '1/1' }}>
        <div className="first">
          <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
        <div className="second">
          <ul>
            <li></li>
            <li></li>
          </ul>
        </div>
        <div className="third">
          <ul>
            <li></li>
            <li></li>
            <li className="floating-1"></li>
            <li className="floating-1"></li>
            <li className="floating-2"></li>
            <li className="floating-2"></li>
          </ul>
        </div>
        <div className="fourth">
          <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li className="floating"></li>
            <li className="floating"></li>
            <li className="floating"></li>
            <li className="floating"></li>
          </ul>
          <span className="smile"></span>
          <span className="eyes"></span>
          <span className="cheeks"></span>
        </div>
        <div className="random-stars-container">
          <span className="random-stars"></span>
          <span className="random-stars"></span>
          <span className="random-stars"></span>
          <span className="random-stars"></span>
        </div>
      </div>
      <span className="text-white text-base text-center mt-5 pt-4">{text || randomMensaje}</span>
      <style jsx>{`
        .ghost-loader {
          position: relative;
          width: 220px;
          height: 220px;
        }
        .ghost-loader div {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .ghost-loader ul {
          margin: 0;
          padding: 0;
        }
        .ghost-loader li {
          list-style: none;
          display: block;
        }
        /* --- Adaptación de los estilos principales del fantasma y animaciones --- */
        .first {
          background: #5048A0;
          height: 130px;
          width: 145px;
          border-radius: 100px 0 0 100px;
          box-shadow: 2px 0px 10px #5048A0, -5px 0px 10px #5b2096;
          z-index: 4;
        }
        .first ul li {
          position: relative;
          height: 32.5px;
          margin-left: 70px;
          border-radius: 80px;
          background: linear-gradient(to right, #5048A0 60%, transparent);
          animation: glowbg 2s ease-in-out infinite;
        }
        .first ul li:nth-child(1) { width: 140px; animation-delay: 0.2s; animation-duration: 2.2s; }
        .first ul li:nth-child(2) { width: 160px; animation-delay: 0.4s; animation-duration: 2.4s; }
        .first ul li:nth-child(3) { width: 130px; animation-delay: 0.6s; animation-duration: 2.1s; }
        .first ul li:nth-child(4) { width: 150px; animation-delay: 0.8s; animation-duration: 2.3s; }
        .second {
          background: #85EDE8;
          opacity: 0.6;
          height: 115px;
          width: 130px;
          border-radius: 100px 0 0 100px;
          box-shadow: 0px 0px 15px #85EDE8;
          z-index: 3;
        }
        .second ul li:nth-child(1) {
          width: 170px;
          height: 30px;
          margin-left: 50px;
          border-radius: 200px;
          background: linear-gradient(to right, #85EDE8 50%, transparent);
          animation: glowbg 3s ease-in-out infinite;
          animation-delay: .5s;
        }
        .second ul li:nth-child(2) {
          width: 160px;
          height: 40px;
          margin-left: 50px;
          border-radius: 200px;
          background: linear-gradient(to right, #85EDE8 50%, transparent);
          margin-top: 45px;
          animation: glowbg 2.5s ease-in-out infinite;
          animation-delay: .8s;
        }
        .third {
          background: #85EDE8;
          height: 100px;
          width: 100px;
          margin-left: -8px;
          border-radius: 100px 0 0 100px;
          box-shadow: 0px 0px 15px #85EDE8;
          z-index: 2;
        }
        .third ul li {
          background: #85EDE8;
          border-radius: 300px;
        }
        .third ul li:nth-child(1) {
          width: 55px;
          height: 10px;
          margin-left: 50px;
          animation: anim1 1s ease infinite;
        }
        .third ul li:nth-child(2) {
          width: 90px;
          height: 10px;
          margin-left: 50px;
          margin-top: 80px;
          animation: anim1 1s ease infinite;
          animation-delay: .5s;
        }
        .third ul .floating-1 {
          width: 40px;
          left: 65px;
          top: 0;
          box-shadow: 0px 0px 5px #85EDE8;
          animation: f1 2s ease-out infinite;
        }
        .third ul .floating-1:last-of-type {
          width: 15px;
          left: 115px;
          animation: f11 1.8s ease-out infinite;
        }
        .third ul .floating-2 {
          width: 30px;
          left: 0px;
          animation: f11 1s ease-out infinite;
          animation-delay: .3s;
        }
        .third ul .floating-2:last-of-type {
          width: 10px;
          left: 0px;
          animation: f11 1.5s ease-out infinite;
          animation-delay: .5s;
        }
        .fourth {
          background: #fff;
          width: 80px;
          height: 80px;
          margin-left: -10px;
          border-radius: 100px 0 0 100px;
          box-shadow: 0px 0px 14px #fff;
          z-index: 5;
        }
        .fourth ul li {
          position: relative;
          transition: all 0.2s ease;
        }
        .fourth ul li:nth-child(1) {
          width: 90px;
          height: 12px;
          background: #fff;
          left: 50px;
          border-radius: 200px;
          box-shadow: 0px 0px 10px #fff;
          animation: anim2 1.5s ease-out infinite;
        }
        .fourth ul li:nth-child(2) {
          background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 4px, #fff 5px);
          width: 70px;
          height: 10px;
          margin-left: 50px;
          animation: anim3 1.6s ease-out infinite;
          animation-delay: 0.5s;
        }
        .fourth ul li:nth-child(3) {
          width: 105px;
          height: 12px;
          background: #fff;
          left: 45px;
          border-radius: 200px;
          box-shadow: 0px 0px 10px #fff;
          animation: anim2 1.2s ease-out infinite;
          animation-delay: 1s;
        }
        .fourth ul li:nth-child(4) {
          background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 4px, #fff 5px);
          width: 65px;
          height: 10px;
          margin-left: 70px;
          animation: anim3 2s ease-out infinite;
          animation-delay: 0.5s;
        }
        .fourth ul li:nth-child(5) {
          width: 85px;
          height: 12px;
          background: #fff;
          left: 60px;
          border-radius: 200px;
          box-shadow: 0px 0px 10px #fff;
          animation: anim4 2s ease-out infinite;
          animation-delay: 0.5s;
        }
        .fourth ul li:nth-child(6) {
          background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 5px, #fff 6px);
          width: 65px;
          height: 12px;
          margin-left: 75px;
          animation: anim3 1s ease-out infinite;
          animation-delay: 0.5s;
        }
        .fourth ul li:nth-child(7) {
          width: 100px;
          height: 12px;
          background: #fff;
          left: 55px;
          border-radius: 200px;
          box-shadow: 0px 0px 10px #fff;
          animation: anim2 1.3s ease-out infinite;
          animation-delay: 0.5s;
        }
        .fourth ul .floating {
          position: absolute;
          background: #fff;
          border-radius: 100px;
          box-shadow: 0px 0px 10px #85EDE8;
          z-index: -2;
          opacity: 0;
        }
        .fourth ul .floating:nth-child(8) {
          width: 12px;
          height: 12px;
          top: 0;
          left: 50px;
          animation: float1 3s ease infinite;
          animation-delay: .4s;
        }
        .fourth ul .floating:nth-child(9) {
          width: 12px;
          height: 12px;
          top: 22px;
          animation: float2 3s ease infinite;
          animation-delay: 2.5s;
        }
        .fourth ul .floating:nth-child(10) {
          width: 12px;
          height: 12px;
          top: 44px;
          left: 50px;
          animation: float3 3s ease infinite;
          animation-delay: 1.5s;
        }
        .fourth ul .floating:nth-child(11) {
          width: 12px;
          height: 12px;
          top: 67px;
          left: 50px;
          animation: float4 3s ease infinite;
          animation-delay: 1.5s;
        }
        .smile {
          position: absolute;
          border-bottom-left-radius: 90px;
          border-bottom-right-radius: 90px;
          width: 10px;
          height: 6px;
          background: transparent;
          border: 4px solid #000;
          left: 36px;
          top: 38px;
        }
        .smile::before {
          background: #fff;
          width: 23px;
          height: 5px;
          content: "";
          position: absolute;
          left: -5px;
          top: -5px;
        }
        .eyes {
          width: 10px;
          height: 10px;
          border-radius: 100px;
          background: #000;
          top: 30px;
          left: 25px;
          position: absolute;
        }
        .eyes::after {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 100px;
          background: #000;
          position: absolute;
          left: 28px;
        }
        .cheeks {
          width: 10px;
          height: 10px;
          background: #85EDE8;
          border-radius: 200px;
          top: 40px;
          left: 20px;
          position: absolute;
        }
        .cheeks::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          background: #85EDE8;
          left: 40px;
          top: 0px;
          border-radius: 200px;
        }
        .random-stars-container {
          width: 100%;
          height: 50%;
          background: transparent;
          box-shadow: none;
          z-index: -1;
          position: absolute;
          left: 0;
          top: 0;
        }
        .random-stars {
          display: block;
          position: absolute;
          opacity: 0;
          border-radius: 100px;
          background: linear-gradient(to right, #48098b, #85EDE8);
          animation: stars-moving 2.5s ease infinite;
        }
        .random-stars:nth-child(1) {
          width: 15px;
          height: 15px;
          left: 120px;
          top: 50px;
          animation-delay: .5s;
          animation-duration: 2s;
        }
        .random-stars:nth-child(2) {
          width: 10px;
          height: 10px;
          left: 0px;
          top: 80px;
        }
        .random-stars:nth-child(3) {
          width: 10px;
          height: 10px;
          left: 0px;
          top: 130px;
          animation-delay: .8s;
        }
        .random-stars:nth-child(4) {
          width: 12px;
          height: 12px;
          left: 0px;
          top: 180px;
          animation-delay: .2s;
          animation-duration: 3.5s;
        }
        /* --- Animaciones clave --- */
        @keyframes glowbg {
          0% { width: 120px; }
          25% { width: 200px; }
          100% { width: 120px; }
        }
        @keyframes anim1 {
          0% { left: 0px; }
          50% { left: 30px; }
          100% { left: 0px; }
        }
        @keyframes anim2 {
          0% { left: 45px; }
          50% { left: 65px; }
          100% { left: 45px; }
        }
        @keyframes anim3 {
          0% { left: 0px; }
          50% { left: 5px; }
          100% { left: 0px; }
        }
        @keyframes anim4 {
          0% { left: 60px; }
          50% { left: 80px; }
          100% { left: 60px; }
        }
        @keyframes f1 {
          0% { left: 15px; width: 70px; }
          50% { left: 150px; opacity: .5; width: 50px; }
          60% { left: 150px; opacity: 0; width: 4px; }
          100% { left: 15px; opacity: 0; width: 0px; }
        }
        @keyframes f11 {
          0% { left: 65px; }
          50% { left: 185px; opacity: .5; }
          60% { opacity: 0; left: 185px; }
          100% { left: 65px; opacity: 0; }
        }
        @keyframes float1 {
          0% { left: 50px; opacity: 0; }
          50% { left: 160px; opacity: 1; }
          70% { left: 160px; opacity: 0; }
          100% { left: 50px; opacity: 0; }
        }
        @keyframes float2 {
          0% { left: 60px; opacity: 0; }
          50% { left: 175px; opacity: 1; }
          70% { left: 175px; opacity: 0; }
          100% { left: 60px; opacity: 0; }
        }
        @keyframes float3 {
          0% { left: 50px; opacity: 0; }
          50% { left: 160px; opacity: 1; }
          70% { left: 160px; opacity: 0; }
          100% { left: 50px; opacity: 0; }
        }
        @keyframes float4 {
          0% { left: 50px; opacity: 0; }
          50% { left: 180px; opacity: 1; }
          70% { left: 180px; opacity: 0; }
          100% { left: 50px; opacity: 0; }
        }
        @keyframes stars-moving {
          0% { left: 0; opacity: 1; }
          50% { left: 100%; opacity: 1; }
          70% { left: 100%; opacity: 0; }
          100% { left: 0; opacity: 0; }
        }
      `}</style>
    </div>
  );
} 