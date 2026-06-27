'use client'

import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield, LogOut, Loader2 } from 'lucide-react'

export default function CitizenProfilePage() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your account details and settings.</p>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-700/50 pb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-400">
              {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Full Name</p>
                  <p className="font-medium text-white">{user.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email Address</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Account ID</p>
                  <p className="font-medium text-white font-mono text-xs">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/50">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
