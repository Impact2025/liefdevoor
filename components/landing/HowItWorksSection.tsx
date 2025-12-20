"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Mic, MessageCircle, Heart } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Sectie Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full bg-rose-100 text-rose-700 font-semibold text-sm tracking-wide"
          >
            Eenvoudig & Veilig
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6"
          >
            In 3 stappen naar <span className="text-rose-600">echt contact.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 leading-relaxed"
          >
            Geen ingewikkeld gedoe. Wij helpen je bij elke stap, van je eerste woord tot je eerste date.
          </motion.p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* STAP 1: Profiel & AI (Groot Blok Links) */}
          <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative group"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-rose-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Vertel jouw verhaal (met een beetje hulp)</h3>
              <p className="text-lg text-slate-600 max-w-md">
                Weet je niet wat je moet schrijven? Geen probleem. Onze <strong>AI-assistent</strong> stelt je simpele vragen en maakt er een mooi profiel van.
              </p>
            </div>

            {/* Abstracte UI Visual: Chat met AI */}
            <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-rose-50 to-transparent hidden md:block" />
            <div className="absolute -right-4 bottom-8 w-64 p-4 bg-white rounded-xl border border-slate-200 shadow-lg transform rotate-[-3deg] group-hover:rotate-0 transition-all duration-500 hidden md:block">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-stone-500 rounded-full flex items-center justify-center">
                   <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs text-slate-400">AI Assistent</div>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-100 p-2 rounded-lg rounded-tl-none text-xs text-slate-600">
                  Waar word jij blij van?
                </div>
                <div className="bg-stone-50 p-2 rounded-lg rounded-tr-none text-xs text-rose-700 ml-auto w-fit">
                  Wandelen met mijn hond!
                </div>
                <div className="bg-slate-100 p-2 rounded-lg rounded-tl-none text-xs text-slate-600 font-medium">
                  Super! Ik zet het op je profiel.
                </div>
              </div>
            </div>
          </motion.div>

          {/* STAP 2: Veiligheid (Blok Rechtsboven) */}
          <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">100% Echte Mensen</h3>
            <p className="text-slate-600">
              Ieder profiel wordt gecheckt. Je ziet direct wie er geverifieerd is.
            </p>
            {/* Visual: Verified Badge */}
            <div className="absolute top-6 right-6">
               <ShieldCheck className="w-16 h-16 text-blue-50 transform rotate-12" />
            </div>
          </motion.div>

          {/* STAP 3: Contact (Blok Linksonder) */}
          <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden"
          >
             <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Praten zoals jij wilt</h3>
            <p className="text-slate-600">
              Typen of inspreken? Kies wat fijn voelt.
            </p>
             <div className="flex gap-3 mt-4">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <MessageCircle className="w-5 h-5 text-slate-400" />
                </div>
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-2 px-3">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <div className="w-12 h-1 bg-purple-200 rounded-full" />
                </div>
             </div>
          </motion.div>

          {/* USP: De Match (Groot Blok Rechtsonder) */}
          <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-br from-rose-600 to-orange-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center items-start"
          >
            <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Klaar voor de liefde?</h3>
              <p className="text-rose-100 text-lg mb-8">
                Ontdek wie jou leuk vindt. Zonder verborgen kosten, zonder spelletjes.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-3 rounded-xl font-bold shadow-md hover:bg-stone-50 transition-colors"
              >
                <Heart className="w-5 h-5 fill-current" />
                Maak gratis profiel aan
              </Link>
            </div>

            {/* Decoratieve Hartjes Background */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
               <Heart className="w-64 h-64 absolute -top-10 -right-10 fill-white" />
               <Heart className="w-32 h-32 absolute bottom-10 right-20 fill-white" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
