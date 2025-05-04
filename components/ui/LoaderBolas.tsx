import React from "react";

function getRandomColor() {
  const colors = ["#f472b6", "#38bdf8"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function LoaderBolas({ text = "Cargando..." }: { text?: string }) {
  const color = React.useMemo(() => getRandomColor(), []);
  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="loader-wrapper">
        <div className="ball" />
        <div className="ball" />
        <div className="ball" />
      </div>
      <svg width="0" height="0">
        <defs>
          <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="filter" />
            <feComposite in="SourceGraphic" in2="filter" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span className="text-white text-base text-center mt-5" style={{ paddingTop: 18 }}>{text}</span>
      <style jsx>{`
        .loader-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          filter: url('#pink-glow');
        }
        .ball {
          width: 30px;
          height: 30px;
          position: absolute;
          top: 15px;
          left: 15px;
        }
        .ball:before {
          background: ${color};
          border-radius: 100%;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          content: '';
          display: block;
        }
        .ball:nth-child(1) {
          animation: x-axis-lateral 2s infinite alternate ease-in-out;
        }
        .ball:nth-child(1):before {
          animation: y-axis-lateral 1s infinite 0.1s alternate ease-in-out;
        }
        .ball:nth-child(2) {
          animation: x-axis 2s infinite alternate ease-in-out;
        }
        .ball:nth-child(2):before {
          animation: y-axis 1s infinite .5s alternate ease-in-out;
        }
        .ball:nth-child(3) {
          animation: x-axis-lateral 2s infinite alternate ease;
          left: 45px;
          top: 45px;
        }
        .ball:nth-child(3):before {
          animation: y-axis-lateral 1s infinite .4s alternate ease-in-out;
        }
        @keyframes x-axis {
          0% { transform: translate(-48px, 0); }
          100% { transform: translate(48px, 0); }
        }
        @keyframes y-axis {
          0% { transform: translateY(21px); }
          100% { transform: translateY(-33px) scale(.8); background: #f9a8d4;}
        }
        @keyframes x-axis-lateral {
          0% { transform: translate(-18px, 0); }
          100% { transform: translate(18px, 0); }
        }
        @keyframes y-axis-lateral {
          0% { transform: translateY(6px); }
          100% { transform: translateY(-30px); background: #f9a8d4;}
        }
      `}</style>
    </div>
  );
} 