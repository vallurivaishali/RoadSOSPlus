import Link from 'next/link'
import { Shield, Map, AlertTriangle, BarChart3, ArrowRight, Radio, Target, Zap } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      title: 'Instant Accident Reporting',
      desc: 'Report accidents with GPS, photos, voice, and video. AI classifies severity in seconds.',
    },
    {
      icon: Map,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Live Safety Map',
      desc: 'Real-time heatmaps of accident zones, near-misses, and risk scores across the city.',
    },
    {
      icon: Target,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Risk Zone Detection',
      desc: 'AI-driven risk scoring (0–100) identifies danger zones before more accidents happen.',
    },
    {
      icon: Radio,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Driver Warnings',
      desc: 'Plan your route and get warnings for high-risk zones along your path.',
    },
    {
      icon: BarChart3,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      title: 'Authority Analytics',
      desc: 'Structured data for road safety authorities to prioritize interventions.',
    },
    {
      icon: Zap,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      title: 'Emergency Assistance',
      desc: 'Locate nearby hospitals and police stations instantly after reporting.',
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="relative border-b border-slate-800/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">RoadSOS<span className="text-blue-400">+</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/auth/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Road Safety Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Making roads safer
          <br />
          <span className="text-gradient">one report at a time</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          RoadSOS+ empowers citizens to report accidents instantly, helps authorities identify danger
          zones, and warns drivers before they enter high-risk areas.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/register" className="btn-primary px-6 py-3 text-base">
            Report an Incident <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="btn-ghost px-6 py-3 text-base border border-slate-700">
            Authority Login
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { label: 'Reports Analyzed', value: '1,200+' },
            { label: 'Risk Zones Mapped', value: '48' },
            { label: 'Cities Covered', value: '3' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="glass-card p-6 hover:border-slate-600 transition-colors duration-200">
              <div className={`w-10 h-10 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-600">
          <span>© 2026 RoadSOS+. Built for public safety.</span>
          <span>Powered by Gemini AI · OpenStreetMap · FastAPI</span>
        </div>
      </footer>
    </div>
  )
}
