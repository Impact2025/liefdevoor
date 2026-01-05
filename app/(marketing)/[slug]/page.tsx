'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart, ShieldCheck, MessageSquare, Calendar, Zap, Clock, Sparkles,
  Shield, Mic, Users, Volume2, Keyboard, Contrast, Eye, MapPin,
  Battery, Moon, Coffee, MessageCircle, ArrowRight, Check, Star,
  ChevronDown, Play, Pause
} from 'lucide-react'
import { getDoelgroepBySlug, type DoelgroepData } from '@/lib/doelgroepen-data'
import { TextToSpeech } from '@/components/accessibility/TextToSpeech'
import { AccessibleLandingWrapper } from '@/components/accessibility/AccessibleLandingWrapper'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, ShieldCheck, MessageSquare, Calendar, Zap, Clock, Sparkles,
  Shield, Mic, Users, Volume2, Keyboard, Contrast, Eye, MapPin,
  Battery, Moon, Coffee, MessageCircle
}

interface KennisbankArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  articleType: string
  hasEasyRead: boolean
  readTime: number
  category: {
    name: string
    slug: string
  }
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  bannerText: string | null
  readTime: number
  category: {
    name: string
    color: string
    icon: string
  }
}

export default function DoelgroepLandingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<DoelgroepData | null>(null)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [kennisbankArticles, setKennisbankArticles] = useState<KennisbankArticle[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (slug) {
      const doelgroep = getDoelgroepBySlug(slug)
      if (doelgroep) {
        setData(doelgroep)

        // Haal blog posts op via API (gefilterd op tags)
        const fetchBlogPosts = async () => {
          try {
            const tagsParam = doelgroep.contentTags.join(',')
            const response = await fetch(`/api/blog/posts?tags=${tagsParam}&limit=3`)
            if (response.ok) {
              const result = await response.json()
              setBlogs(result.posts || [])
            }
          } catch (error) {
            console.error('Error fetching blog posts:', error)
          }
        }

        fetchBlogPosts()

        // Haal kennisbank artikelen op
        const fetchKennisbankArticles = async () => {
          try {
            // Map doelgroep slug to audience tag
            const audienceMap: Record<string, string> = {
              'dating-met-autisme': 'autisme',
              'dating-met-adhd': 'adhd',
              'veilig-daten-lvb': 'lvb',
              'dating-voor-slechtzienden': 'slechtziend',
              'dating-met-beperking': 'beperking',
              'daten-met-burnout': 'burnout',
              'dating-alleenstaande-ouders': 'ouders',
              'dating-50-plus': '50plus'
            }

            const audience = audienceMap[slug]
            if (audience) {
              const response = await fetch(`/api/kennisbank/articles?audience=${audience}&limit=6`)
              if (response.ok) {
                const result = await response.json()
                setKennisbankArticles(result.data?.articles || [])
              }
            }
          } catch (error) {
            console.error('Error fetching kennisbank articles:', error)
          }
        }

        fetchKennisbankArticles()
      }
    }
  }, [slug])

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-500 mx-auto animate-spin"></div>
          <p className="mt-4 text-slate-600">Laden...</p>
        </div>
      </div>
    )
  }

  // Simple mode voor LVB
  const textSize = data.enableSimpleMode || data.enableLargeText ? 'text-xl' : 'text-lg'
  const headingSize = data.enableSimpleMode ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'

  const pageContent = (
    <div className={`min-h-screen bg-white ${data.enableHighContrast ? 'high-contrast' : ''}`}>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/LiefdevoorIedereen_logo.png"
                alt="Liefde Voor Iedereen"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">Liefde Voor Iedereen</span>
            </Link>
            <div className="flex items-center gap-4">
              {data.enableAudioMode && (
                <TextToSpeech
                  text={`${data.heroTitle}. ${data.heroPainPoint}`}
                  variant="icon"
                  label="Lees pagina voor"
                />
              )}
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/30 transition-colors"
              >
                Inloggen
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${data.gradientFrom} 0%, ${data.gradientTo} 100%)`
          }}
        />

        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            {/* Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
              <ShieldCheck className="w-5 h-5" />
              <span className={`font-medium ${data.enableSimpleMode ? 'text-lg' : 'text-sm'}`}>
                {data.heroSubtitle}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className={`${headingSize} font-extrabold tracking-tight leading-[1.1] mb-6`}>
              {data.heroTitle}
            </h1>

            {/* Pain Point / Subtext */}
            <p className={`${textSize} md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl`}>
              {data.heroPainPoint}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/register?source=${data.sourceTag}`}
                className={`group px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${data.enableSimpleMode ? 'text-xl py-5' : 'text-lg'}`}
              >
                <Heart className="w-5 h-5" style={{ color: data.primaryColor }} />
                {data.enableSimpleMode ? 'Gratis Aanmelden' : 'Gratis Starten'}
              </Link>

              <Link
                href="#features"
                className={`px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${data.enableSimpleMode ? 'text-xl py-5' : 'text-lg'}`}
              >
                Meer Info
                <ChevronDown className="w-5 h-5" />
              </Link>
            </div>

            {/* Audio option for slechtzienden */}
            {data.enableAudioMode && (
              <div className="mt-8 flex items-center gap-3 text-white/80">
                <Volume2 className="w-5 h-5" />
                <span className={textSize}>
                  Audio beschikbaar op alle profielen
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${data.enableSimpleMode ? 'text-3xl' : 'text-3xl md:text-4xl'} font-bold text-slate-900 mb-4`}>
              {data.enableSimpleMode ? 'Waarom hier daten?' : 'Waarom kiezen voor ons?'}
            </h2>
            <p className={`${textSize} text-slate-600 max-w-2xl mx-auto`}>
              {data.enableSimpleMode
                ? 'Wij maken daten makkelijk en veilig'
                : 'Ontdek wat ons uniek maakt voor jou'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Heart
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${data.primaryColor}20` }}
                  >
                    <div style={{ color: data.primaryColor }}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className={`${data.enableSimpleMode ? 'text-2xl' : 'text-xl'} font-bold text-slate-900 mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={`${textSize} text-slate-600 leading-relaxed`}>
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Quote background */}
            <div
              className="absolute -top-6 -left-6 text-9xl font-serif opacity-10"
              style={{ color: data.primaryColor }}
            >
              &ldquo;
            </div>

            <div className="bg-gradient-to-br from-stone-50 to-white p-10 md:p-16 rounded-3xl border border-slate-200 relative">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <blockquote className={`${data.enableSimpleMode ? 'text-2xl' : 'text-xl md:text-2xl'} text-slate-700 leading-relaxed mb-8`}>
                &ldquo;{data.testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  {data.testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className={`${data.enableSimpleMode ? 'text-xl' : 'text-lg'} font-bold text-slate-900`}>
                    {data.testimonial.name} ({data.testimonial.age})
                  </div>
                  <div className="text-slate-500">{data.testimonial.location}</div>
                </div>
              </div>

              {/* Audio option */}
              {data.enableAudioMode && (
                <div className="mt-6">
                  <TextToSpeech
                    text={`${data.testimonial.name} uit ${data.testimonial.location} zegt: ${data.testimonial.quote}`}
                    variant="button"
                    label="Beluister dit verhaal"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Kennisbank Articles Section */}
      {kennisbankArticles.length > 0 && (
        <section className="py-24 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`${data.enableSimpleMode ? 'text-3xl' : 'text-3xl md:text-4xl'} font-bold text-slate-900 mb-4`}>
                {data.enableSimpleMode ? 'Kennisbank voor jou' : 'Kennisbank Artikelen'}
              </h2>
              <p className={`${textSize} text-slate-600`}>
                Uitgebreide gidsen en praktische informatie
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {kennisbankArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${data.gradientFrom}, ${data.gradientTo})`
                      }}
                    />
                    {article.articleType === 'PILLAR' && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-medium" style={{ color: data.primaryColor }}>
                          Uitgebreide gids
                        </span>
                      </div>
                    )}
                    {article.hasEasyRead && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-slate-600">
                          Easy Read
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-medium mb-2" style={{ color: data.primaryColor }}>
                      {article.category.name}
                    </div>
                    <h3 className={`${data.enableSimpleMode ? 'text-xl' : 'text-lg'} font-bold text-slate-900 mb-3 group-hover:text-rose-500 transition-colors`}>
                      {article.title}
                    </h3>
                    <p className={`${textSize} text-slate-600 mb-4 line-clamp-2`}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{article.readTime} min lezen</span>
                      <Link
                        href={`/kennisbank/${article.category.slug}/${article.slug}`}
                        className="flex items-center gap-1 font-medium transition-colors"
                        style={{ color: data.primaryColor }}
                      >
                        Lees meer
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/kennisbank"
                className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-xl font-medium transition-colors hover:bg-slate-50 ${data.enableSimpleMode ? 'text-lg' : ''}`}
                style={{ borderColor: data.primaryColor, color: data.primaryColor }}
              >
                Bekijk alle kennisbank artikelen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog Content Section */}
      {blogs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`${data.enableSimpleMode ? 'text-3xl' : 'text-3xl md:text-4xl'} font-bold text-slate-900 mb-4`}>
                {data.enableSimpleMode ? 'Tips & Verhalen' : 'Blog Artikelen'}
              </h2>
              <p className={`${textSize} text-slate-600`}>
                Handige tips en inspirerende verhalen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  {/* Image/Banner Header */}
                  {blog.featuredImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ) : blog.bannerText ? (
                    <div
                      className="relative h-48 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${data.gradientFrom}, ${data.gradientTo})`
                      }}
                    >
                      <span className="text-white text-3xl font-bold tracking-tight drop-shadow-lg">
                        {blog.bannerText}
                      </span>
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: `linear-gradient(135deg, ${data.gradientFrom}, ${data.gradientTo})`
                        }}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{
                        backgroundColor: `${blog.category.color}20`,
                        color: blog.category.color
                      }}>
                        {blog.category.icon} {blog.category.name}
                      </span>
                    </div>
                    <h3 className={`${data.enableSimpleMode ? 'text-xl' : 'text-lg'} font-bold text-slate-900 mb-3 group-hover:text-rose-500 transition-colors`}>
                      {blog.title}
                    </h3>
                    <p className={`${textSize} text-slate-600 mb-4 line-clamp-2`}>
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{blog.readTime} min lezen</span>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-1 font-medium transition-colors"
                        style={{ color: data.primaryColor }}
                      >
                        Lees meer
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/blog"
                className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-xl font-medium transition-colors hover:bg-slate-50 ${data.enableSimpleMode ? 'text-lg' : ''}`}
                style={{ borderColor: data.primaryColor, color: data.primaryColor }}
              >
                Bekijk alle blog artikelen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {data.faqItems && data.faqItems.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`${data.enableSimpleMode ? 'text-3xl' : 'text-3xl md:text-4xl'} font-bold text-slate-900 mb-4`}>
                {data.enableSimpleMode ? 'Veelgestelde Vragen' : 'Vragen & Antwoorden'}
              </h2>
            </div>

            <div className="space-y-4">
              {data.faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-slate-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className={`w-full flex items-center justify-between p-6 text-left hover:bg-stone-50 transition-colors ${data.enableSimpleMode ? 'text-lg' : ''}`}
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-6 pb-6"
                    >
                      <p className={`${textSize} text-slate-600 leading-relaxed`}>
                        {faq.answer}
                      </p>
                      {data.enableAudioMode && (
                        <div className="mt-4">
                          <TextToSpeech
                            text={`Vraag: ${faq.question}. Antwoord: ${faq.answer}`}
                            variant="minimal"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section
        className="py-24"
        style={{
          background: `linear-gradient(135deg, ${data.gradientFrom} 0%, ${data.gradientTo} 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={`${data.enableSimpleMode ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6`}>
              {data.enableSimpleMode ? 'Klaar om te starten?' : 'Klaar om de liefde te vinden?'}
            </h2>
            <p className={`${textSize} md:text-xl text-white/90 mb-10 max-w-2xl mx-auto`}>
              {data.enableSimpleMode
                ? 'Aanmelden is gratis en makkelijk.'
                : 'Sluit je aan bij duizenden singles. Gratis aanmelden duurt maar 2 minuten.'
              }
            </p>
            <Link
              href={`/register?source=${data.sourceTag}`}
              className={`inline-flex items-center gap-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-stone-50 transition-colors shadow-lg ${data.enableSimpleMode ? 'text-xl py-5 px-12' : 'text-lg py-4 px-10'}`}
            >
              {data.enableSimpleMode ? 'Gratis Aanmelden' : 'Start nu gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {["SSL Beveiligd", "AVG Compliant", "Nederlands bedrijf", "24/7 Support"].map((badge, i) => (
              <div key={i} className="flex items-center space-x-2 text-slate-500">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className={`font-medium ${data.enableSimpleMode ? 'text-lg' : ''}`}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-5">
                <Image
                  src="/images/LiefdevoorIedereen_logo.png"
                  alt="Liefde Voor Iedereen"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-lg font-bold">Liefde Voor Iedereen</span>
              </div>
              <p className={`text-slate-400 leading-relaxed ${data.enableSimpleMode ? 'text-base' : 'text-sm'}`}>
                Het dating platform waar echte connecties ontstaan. Veilig, betrouwbaar en 100% Nederlands.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Communities</h3>
              <ul className={`space-y-3 text-slate-400 ${data.enableSimpleMode ? 'text-base' : 'text-sm'}`}>
                <li><Link href="/dating-met-autisme" className="hover:text-white transition-colors">Dating met Autisme</Link></li>
                <li><Link href="/veilig-daten-lvb" className="hover:text-white transition-colors">Veilig Daten (LVB)</Link></li>
                <li><Link href="/dating-voor-slechtzienden" className="hover:text-white transition-colors">Dating voor Slechtzienden</Link></li>
                <li><Link href="/dating-met-beperking" className="hover:text-white transition-colors">Dating met Beperking</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Informatie</h3>
              <ul className={`space-y-3 text-slate-400 ${data.enableSimpleMode ? 'text-base' : 'text-sm'}`}>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Over ons</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/prijzen" className="hover:text-white transition-colors">Prijzen</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Juridisch</h3>
              <ul className={`space-y-3 text-slate-400 ${data.enableSimpleMode ? 'text-base' : 'text-sm'}`}>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link></li>
                <li><Link href="/toegankelijkheid" className="hover:text-white transition-colors">Toegankelijkheid</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Liefde Voor Iedereen. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  // Wrap with AccessibleLandingWrapper for pages with audio mode
  if (data.enableAudioMode) {
    return (
      <AccessibleLandingWrapper
        enableAudioMode={data.enableAudioMode}
        enableHighContrast={data.enableHighContrast}
        enableLargeText={data.enableLargeText}
        pageTitle={data.heroTitle}
        pageDescription={data.heroPainPoint}
      >
        {pageContent}
      </AccessibleLandingWrapper>
    )
  }

  return pageContent
}
