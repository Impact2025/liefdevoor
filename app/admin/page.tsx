/**
 * Admin Index Page
 *
 * Main landing page for admin section
 */

import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Heart,
  Shield,
  Mail,
  Ticket,
  FileText,
  Settings,
  BarChart3,
  ArrowRight,
  Lock,
  TrendingUp
} from 'lucide-react'

interface AdminCard {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
  stats?: string
}

const adminSections: AdminCard[] = [
  {
    title: 'Dashboard',
    description: 'Overzicht van statistieken, gebruikers en activiteit',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    stats: 'Live data'
  },
  {
    title: 'Coupon Beheer',
    description: 'Maak en beheer kortingscodes en promoties',
    href: '/admin/coupons',
    icon: Ticket,
    color: 'from-primary-500 to-pink-600',
    stats: 'Wereldklasse systeem'
  },
  {
    title: 'Blog Beheer',
    description: 'Schrijf en publiceer blog artikelen',
    href: '/admin/blog',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    stats: 'Content management'
  },
  {
    title: 'Security & 2FA',
    description: 'Beveiligingsinstellingen en two-factor authenticatie',
    href: '/admin/security/2fa',
    icon: Lock,
    color: 'from-amber-500 to-orange-600',
    stats: 'Extra beveiliging'
  },
]

const quickStats = [
  {
    label: 'User Management',
    description: 'Beheer gebruikers, rollen en permissies',
    icon: Users,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    label: 'Match Oversight',
    description: 'Monitor matches en interacties',
    icon: Heart,
    color: 'bg-pink-50 text-pink-600'
  },
  {
    label: 'Email Management',
    description: 'Bekijk email logs en statistieken',
    icon: Mail,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    label: 'Reports & Safety',
    description: 'Bekijk meldingen en veiligheidswaarschuwingen',
    icon: Shield,
    color: 'bg-amber-50 text-amber-600'
  },
]

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
              <Shield className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-medium">Admin Control Center</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welkom in de Admin Omgeving
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Beheer je dating platform met krachtige tools en real-time inzichten
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white mb-2">{stat.label}</h3>
                <p className="text-sm text-slate-400">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Admin Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Admin Modules
          </h2>
          <p className="text-slate-600">
            Kies een module om mee te werken
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="group relative bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-primary-400 transition-all shadow-sm hover:shadow-xl"
            >
              {/* Gradient Background */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity`} />

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <section.icon className="w-7 h-7 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {section.description}
                </p>

                {section.stats && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                    <TrendingUp className="w-4 h-4" />
                    {section.stats}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 border border-primary-200">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Dashboard voor Complete Overzicht
              </h3>
              <p className="text-slate-700 mb-4">
                Ga naar het dashboard voor real-time statistieken, gebruikersbeheer, match oversight en meer.
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Beveiligde Toegang
            </h4>
            <p className="text-sm text-slate-600">
              Alleen gebruikers met ADMIN rol hebben toegang tot deze omgeving
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Real-time Data
            </h4>
            <p className="text-sm text-slate-600">
              Alle statistieken en data worden live bijgewerkt vanuit de database
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Volledige Controle
            </h4>
            <p className="text-sm text-slate-600">
              Beheer alle aspecten van je platform vanaf één centrale plek
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
