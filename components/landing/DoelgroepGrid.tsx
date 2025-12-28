'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain, Shield, Eye, Heart, Users, Sparkles
} from 'lucide-react'

interface DoelgroepTile {
  slug: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  gradientFrom: string
  gradientTo: string
  size: 'small' | 'medium' | 'large'
}

const doelgroepTiles: DoelgroepTile[] = [
  {
    slug: 'dating-met-autisme',
    title: 'Neurodiversiteit',
    subtitle: 'Autisme, ADHD & HSP',
    icon: Brain,
    gradientFrom: '#6366f1',
    gradientTo: '#8b5cf6',
    size: 'large'
  },
  {
    slug: 'veilig-daten-lvb',
    title: 'Extra Begeleiding',
    subtitle: 'Veilig & duidelijk',
    icon: Shield,
    gradientFrom: '#10b981',
    gradientTo: '#14b8a6',
    size: 'medium'
  },
  {
    slug: 'dating-voor-slechtzienden',
    title: 'Toegankelijkheid',
    subtitle: 'Audio & screenreader',
    icon: Eye,
    gradientFrom: '#0ea5e9',
    gradientTo: '#06b6d4',
    size: 'medium'
  },
  {
    slug: 'dating-met-beperking',
    title: 'Fysieke Beperking',
    subtitle: 'Kijk verder',
    icon: Heart,
    gradientFrom: '#8b5cf6',
    gradientTo: '#a855f7',
    size: 'small'
  },
  {
    slug: 'dating-50-plus',
    title: '50+ Dating',
    subtitle: 'Nooit te laat',
    icon: Users,
    gradientFrom: '#dc2626',
    gradientTo: '#f97316',
    size: 'small'
  },
  {
    slug: 'daten-met-burnout',
    title: 'Mentale Gezondheid',
    subtitle: 'Op jouw tempo',
    icon: Sparkles,
    gradientFrom: '#14b8a6',
    gradientTo: '#22c55e',
    size: 'small'
  }
]

export default function DoelgroepGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-semibold mb-4">
              Speciale Aandacht
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Liefde voor iedereen
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Wij geloven dat iedereen liefde verdient. Daarom hebben we speciale aandacht voor:
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {doelgroepTiles.map((tile, index) => {
            const IconComponent = tile.icon
            const gridClasses = tile.size === 'large'
              ? 'col-span-2 row-span-2'
              : tile.size === 'medium'
              ? 'col-span-2 md:col-span-1 row-span-1 md:row-span-2'
              : 'col-span-1'

            return (
              <motion.div
                key={tile.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={gridClasses}
              >
                <Link
                  href={`/${tile.slug}`}
                  className="group block h-full"
                >
                  <div
                    className={`relative h-full min-h-[180px] md:min-h-[200px] rounded-3xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl ${tile.size === 'large' ? 'min-h-[300px] md:min-h-[420px]' : tile.size === 'medium' ? 'min-h-[200px] md:min-h-[420px]' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${tile.gradientFrom} 0%, ${tile.gradientTo} 100%)`
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl transform -translate-x-10 translate-y-10" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-end text-white">
                      <div className={`mb-4 ${tile.size === 'large' ? 'mb-6' : ''}`}>
                        <div className={`inline-flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ${tile.size === 'large' ? 'w-16 h-16' : 'w-12 h-12'}`}>
                          <IconComponent className={tile.size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} />
                        </div>
                      </div>

                      <h3 className={`font-bold mb-1 ${tile.size === 'large' ? 'text-2xl md:text-3xl' : tile.size === 'medium' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                        {tile.title}
                      </h3>
                      <p className={`text-white/80 ${tile.size === 'small' ? 'text-sm' : ''}`}>
                        {tile.subtitle}
                      </p>

                      {/* Arrow indicator */}
                      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 mb-4">
            Zie je jezelf niet in een specifieke groep? Geen probleem!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
            Iedereen is welkom
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
