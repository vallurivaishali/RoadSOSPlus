/**
 * Map state store — filter state for the safety map.
 * Shared between SafetyMap component and map filter controls.
 */
import { create } from 'zustand'

export type MapTimeFilter = 'today' | 'week' | 'month' | 'all'
export type MapLayerFilter = 'incidents' | 'near_miss' | 'risk_zones' | 'heatmap'

interface MapState {
  timeFilter: MapTimeFilter
  activeLayers: Set<MapLayerFilter>
  selectedIncidentId: string | null
  selectedRiskZoneId: string | null

  setTimeFilter: (filter: MapTimeFilter) => void
  toggleLayer: (layer: MapLayerFilter) => void
  setSelectedIncident: (id: string | null) => void
  setSelectedRiskZone: (id: string | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  timeFilter: 'week',
  activeLayers: new Set(['incidents', 'near_miss', 'risk_zones']),
  selectedIncidentId: null,
  selectedRiskZoneId: null,

  setTimeFilter: (filter) => set({ timeFilter: filter }),

  toggleLayer: (layer) =>
    set((state) => {
      const next = new Set(state.activeLayers)
      if (next.has(layer)) {
        next.delete(layer)
      } else {
        next.add(layer)
      }
      return { activeLayers: next }
    }),

  setSelectedIncident: (id) => set({ selectedIncidentId: id }),
  setSelectedRiskZone: (id) => set({ selectedRiskZoneId: id }),
}))
