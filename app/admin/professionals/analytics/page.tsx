'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  BadgeCheck,
  Clock,
  Euro,
  Activity,
  Eye,
  Wrench,
  RefreshCw,
  Loader2,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Star,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total: number;
    verified: number;
    pending: number;
    active: number;
    mrr: number;
    arr: number;
  };
  growth: {
    data: { date: string; signups: number; basic: number; standard: number; premium: number }[];
    signupsInPeriod: number;
    avgSignupsPerDay: number;
  };
  verification: {
    verifiedInPeriod: number;
    pending: number;
    avgHours: number;
  };
  engagement: {
    totalContentViews: number;
    totalToolsUsed: number;
    activeInPeriod: number;
    activeRate: number;
  };
  topProfessionals: {
    id: string;
    organizationName: string;
    organizationType: string;
    professionalTier: string;
    contentViews: number;
    toolsUsed: number;
    lastActiveAt: string;
  }[];
  revenue: {
    mrr: number;
    arr: number;
    trend: { month: string; mrr: number }[];
  };
  conversion: {
    signups: number;
    verified: number;
    active: number;
    paid: number;
  };
  distribution: {
    byType: { type: string; count: number }[];
    byTier: { tier: string; count: number; revenue: number }[];
  };
  period: number;
}

const PROFESSIONAL_TYPES: Record<string, string> = {
  THERAPIST: 'Therapeut',
  COACH: 'Coach',
  CARE_INSTITUTION: 'Zorginstelling',
  EDUCATION: 'Onderwijs',
  HEALTHCARE: 'Gezondheidszorg',
  GOVERNMENT: 'Overheid',
  OTHER: 'Overig',
};

const TIER_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  BASIC: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Star className="w-3 h-3" /> },
  STANDARD: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Sparkles className="w-3 h-3" /> },
  PREMIUM: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Crown className="w-3 h-3" /> },
};

const TYPE_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-slate-500',
  'bg-gray-500',
];

export default function ProfessionalsAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/professionals/analytics?period=${period}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMaxSignups = () => {
    if (!data) return 1;
    return Math.max(...data.growth.data.map(d => d.signups), 1);
  };

  const getMaxMrr = () => {
    if (!data || data.revenue.trend.length === 0) return 1;
    return Math.max(...data.revenue.trend.map(d => d.mrr), 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500">Kon analytics niet laden</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/professionals"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-500">Professionals prestaties en groei</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
              >
                <option value="7">Laatste 7 dagen</option>
                <option value="30">Laatste 30 dagen</option>
                <option value="90">Laatste 90 dagen</option>
                <option value="365">Laatste jaar</option>
              </select>
              <a
                href={`/api/admin/professionals/export?format=csv`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <Building2 className="w-4 h-4" />
              Totaal
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.overview.total}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
              <BadgeCheck className="w-4 h-4" />
              Geverifieerd
            </div>
            <p className="text-3xl font-bold text-green-600">{data.overview.verified}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-600 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Wachtend
            </div>
            <p className="text-3xl font-bold text-amber-600">{data.overview.pending}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
              <Activity className="w-4 h-4" />
              Actief ({period}d)
            </div>
            <p className="text-3xl font-bold text-blue-600">{data.overview.active}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-600 text-sm mb-2">
              <Euro className="w-4 h-4" />
              MRR
            </div>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(data.overview.mrr)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-violet-200">
            <div className="flex items-center gap-2 text-violet-600 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              ARR
            </div>
            <p className="text-3xl font-bold text-violet-600">{formatCurrency(data.overview.arr)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Chart */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Nieuwe Aanmeldingen</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">
                  {data.growth.signupsInPeriod} totaal
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {data.growth.avgSignupsPerDay.toFixed(1)}/dag
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end gap-1">
              {data.growth.data.slice(-30).map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-violet-500 rounded-t transition-all hover:bg-violet-600"
                    style={{
                      height: `${(day.signups / getMaxSignups()) * 100}%`,
                      minHeight: day.signups > 0 ? '4px' : '0',
                    }}
                    title={`${day.date}: ${day.signups} aanmeldingen`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{data.growth.data[0]?.date}</span>
              <span>{data.growth.data[data.growth.data.length - 1]?.date}</span>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">MRR Groei</h3>
              <span className="text-emerald-600 font-medium">
                {formatCurrency(data.revenue.mrr)}
              </span>
            </div>
            <div className="h-48 flex items-end gap-2">
              {data.revenue.trend.slice(-12).map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{
                      height: `${(month.mrr / getMaxMrr()) * 100}%`,
                      minHeight: month.mrr > 0 ? '4px' : '0',
                    }}
                    title={`${month.month}: ${formatCurrency(month.mrr)}`}
                  />
                  <span className="text-xs text-slate-400 mt-1 rotate-45 origin-left">
                    {month.month.substring(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Conversie Funnel</h3>
            <div className="space-y-4">
              {[
                { label: 'Aanmeldingen', value: data.conversion.signups, color: 'bg-slate-500' },
                { label: 'Geverifieerd', value: data.conversion.verified, color: 'bg-blue-500' },
                { label: 'Actief', value: data.conversion.active, color: 'bg-violet-500' },
                { label: 'Betalend', value: data.conversion.paid, color: 'bg-emerald-500' },
              ].map((step, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{step.label}</span>
                    <span className="font-medium text-slate-900">{step.value}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all`}
                      style={{
                        width: `${(step.value / data.conversion.signups) * 100}%`,
                      }}
                    />
                  </div>
                  {i > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {Math.round((step.value / data.conversion.signups) * 100)}% van totaal
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Per Type</h3>
            <div className="space-y-3">
              {data.distribution.byType.map((item, i) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[i % TYPE_COLORS.length]}`} />
                  <span className="flex-1 text-sm text-slate-600">
                    {PROFESSIONAL_TYPES[item.type] || item.type}
                  </span>
                  <span className="font-medium text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Per Tier</h3>
            <div className="space-y-4">
              {data.distribution.byTier.map(item => (
                <div key={item.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${TIER_COLORS[item.tier]?.bg} ${TIER_COLORS[item.tier]?.text}`}>
                      {TIER_COLORS[item.tier]?.icon}
                      {item.tier}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{item.count}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(item.revenue)}/mnd</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Stats */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Engagement Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <Eye className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {data.engagement.totalContentViews.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Content Views</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <Wrench className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {data.engagement.totalToolsUsed.toLocaleString()}
                </p>
                <p className="text-sm text-purple-600">Tools Gebruikt</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <Activity className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {data.engagement.activeRate}%
                </p>
                <p className="text-sm text-green-600">Actief Rate</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600 mb-2" />
                <p className="text-2xl font-bold text-amber-600">
                  {data.verification.avgHours}u
                </p>
                <p className="text-sm text-amber-600">Gem. Verificatie Tijd</p>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Top Professionals</h3>
            <div className="space-y-3">
              {data.topProfessionals.slice(0, 5).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/admin/professionals/${p.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{p.organizationName}</p>
                    <p className="text-xs text-slate-500">
                      {p.contentViews} views, {p.toolsUsed} tools
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[p.professionalTier]?.bg} ${TIER_COLORS[p.professionalTier]?.text}`}>
                    {p.professionalTier}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
