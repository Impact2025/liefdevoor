"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-[90vh] flex items-center overflow-hidden">

      {/* 1. De Achtergrond Foto */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1920"
          alt="Een gelukkig koppel dat lacht"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "60% center" }}
        />
      </div>

      {/* 2. De 'Scrim' Gradient voor leesbaarheid */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />

      {/* 3. De Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-white"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-medium tracking-wide">Veilig & Geverifieerd daten</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Vind liefde <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">
              zonder gedoe.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-slate-200 mb-10 leading-relaxed max-w-lg">
            Het datingplatform waar eerlijkheid wint. Met slimme hulp voor je profiel en focus op echte connecties.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="group px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-rose-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Heart className="w-5 h-5 fill-current group-hover:animate-pulse" />
              Gratis Starten
            </Link>

            <Link
              href="/prijzen"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Bekijk abonnementen
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-4 text-sm text-slate-300 font-medium">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
              ].map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden">
                  <Image
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
            <p>Al <strong className="text-white">10.000+</strong> matches gemaakt</p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
