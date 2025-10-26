import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <div className="w-full h-[280px] relative">
      <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-white/20 to-transparent dark:from-slate-950/60 dark:via-slate-950/30" />
      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-6 pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">NewSQL</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mt-1">A modern, visual, and AI-powered database management system. Build schemas, connect tables across databases, and filter data without writing queries.</p>
        </div>
      </div>
    </div>
  );
}
