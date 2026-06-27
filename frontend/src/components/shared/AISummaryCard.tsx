import { BrainCircuit, CheckCircle2, AlertTriangle, Info, Zap, ShieldAlert, Target } from 'lucide-react'

interface AISummaryProps {
  summary: string
}

export function AISummaryCard({ summary }: AISummaryProps) {
  let parsedData = null
  let isJson = false

  try {
    parsedData = JSON.parse(summary)
    isJson = true
  } catch (e) {
    // Legacy simple string fallback
    isJson = false
  }

  if (!summary) return null

  if (!isJson) {
    return (
      <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">AI Analysis</h4>
        </div>
        <p className="text-sm text-slate-300">{summary}</p>
      </div>
    )
  }

  const {
    confidence_score,
    detected_objects,
    damage_assessment,
    recommended_actions,
    emergency_guidance,
    road_safety_insights
  } = parsedData

  return (
    <div className="rounded-xl border border-blue-500/30 bg-slate-900/80 overflow-hidden relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="p-4 border-b border-blue-500/20 bg-blue-500/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-blue-100">AI Safety Assessment</h4>
        </div>
        
        {/* Confidence Score */}
        {confidence_score && (
          <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Confidence</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  confidence_score > 80 ? 'bg-emerald-500' : 
                  confidence_score > 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidence_score}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white">{confidence_score}%</span>
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Emergency Guidance */}
          {emergency_guidance && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Emergency Guidance</h5>
                <p className="text-sm text-red-100 font-medium">{emergency_guidance}</p>
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {recommended_actions && recommended_actions.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recommended Actions
              </h5>
              <ul className="space-y-1.5 ml-1 border-l-2 border-slate-800 pl-3">
                {recommended_actions.map((action: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300">{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Detected Objects */}
          {detected_objects && detected_objects.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Detected Objects
              </h5>
              <div className="flex flex-wrap gap-2">
                {detected_objects.map((obj: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium capitalize">
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Damage Assessment */}
          {damage_assessment && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Damage Assessment
              </h5>
              <p className="text-sm text-slate-300">{damage_assessment}</p>
            </div>
          )}
        </div>

        {/* Footer Insight */}
        {road_safety_insights && (
          <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-2.5 bg-slate-800/30 p-3.5 rounded-lg border border-slate-700/50">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Safety Insights</h5>
                <p className="text-sm text-slate-300 italic">"{road_safety_insights}"</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
