/**
 * Admin Layout - Protected Admin Routes
 *
 * Only users with ADMIN role can access /admin routes
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Home, Shield } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check if user is logged in
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/admin/dashboard')
  }

  // Get user from database to check role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true, email: true }
  })

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Toegang geweigerd
          </h1>
          <p className="text-slate-600 mb-6">
            Je hebt geen toegang tot het admin dashboard. Deze sectie is alleen beschikbaar voor beheerders.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Terug naar homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-rose-400" />
              <span className="font-semibold">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{user.name || user.email}</span>
              <Link
                href="/"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Terug naar site
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
