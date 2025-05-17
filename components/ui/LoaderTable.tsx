import React from "react";

export default function LoaderTable() {
  return (
    <div className="relative w-12 h-12 inline-block" role="status" aria-live="polite">
      <div className="absolute left-0 top-0 w-0.5 bg-violet-700 rounded animate-loader-table-left" />
      <div className="absolute left-0 top-0 h-0.5 bg-violet-700 rounded animate-loader-table-top" />
      <div className="absolute right-0 top-0 w-0.5 bg-violet-700 rounded animate-loader-table-right" />
      <div className="absolute left-0 bottom-0 h-0.5 bg-violet-700 rounded animate-loader-table-bottom" />
      <style jsx>{`
        .loader-table-holder {
          position: relative;
          width: 50px;
          height: 50px;
          display: inline-block;
        }
        .loader-table-bar {
          background: #7209b7;
          box-shadow: 0px 0px 0 #3a0866, 0px 0px 4px #3a0866, 0px 0px 8px #3a0866, 0px 0px 16px #3a0866;
          border-radius: 4px;
          position: absolute;
        }
        .left {
          width: 2px;
          animation: loader-table-left 2s linear infinite;
        }
        @keyframes loader-table-left {
          0%  {height: 0; top: 48px; left: 0;}
          20% {height: 50px; top: 0; left: 0;}
          40% {height: 0; top: 0; left: 0;}
        }
        .top {
          height: 2px;
          animation: loader-table-top 2s linear infinite;
        }
        @keyframes loader-table-top {
          0%  {width: 0; top: 0; left: 0;}
          20% {width: 0; top: 0; left: 0;}
          40% {width: 50px; top: 0; left: 0;}
          60% {width: 0; top:0; left: 50px;}
        }
        .right {
          width: 2px;
          animation: loader-table-right 2s linear infinite;
        }
        @keyframes loader-table-right {
          0%  {height: 0; top: 0; left: 48px;}
          40% {height: 0; top: 0; left: 48px;}
          60% {height: 50px; top: 0; left: 48px;}
          80% {height: 0; top: 50px;left: 48px;}
        }
        .bottom {
          height: 2px;
          animation: loader-table-bottom 2s linear infinite;
        }
        @keyframes loader-table-bottom {
          0%  {width: 0; top: 48px; left: 48px;}
          60% {width: 0; top: 48px; left: 48px;}
          80% {width: 50px; top:48px; left: 0px;}
          100% {width: 0px; top:48px; left: 0px;}
        }
      `}</style>
    </div>
  );
} 