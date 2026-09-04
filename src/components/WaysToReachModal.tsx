import React, { useState } from 'react';
import { X, Navigation, Bike, Train, Bus, Car, ExternalLink, MapPin, Check, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { calculateWaysToReach, TransitMode, RouteOption } from '../utils/waysToReach';

interface WaysToReachModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: { lat: number; lng: number; label?: string };
  destination: { lat: number; lng: number; label?: string };
  onSelectRouteForMap: (route: RouteOption) => void;
}

export const WaysToReachModal: React.FC<WaysToReachModalProps> = ({
  isOpen,
  onClose,
  origin,
  destination,
  onSelectRouteForMap
}) => {
  const [activeMode, setActiveMode] = useState<TransitMode>('bike');
  const [plottedMode, setPlottedMode] = useState<TransitMode | null>(null);

  if (!isOpen) return null;

  const routes = calculateWaysToReach(origin, destination);
  const selectedRoute = routes[activeMode];

  const handlePlotOnMap = (route: RouteOption) => {
    setPlottedMode(route.id);
    onSelectRouteForMap(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-900 border border-slate-700/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between bg-dark-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                Ways to Reach Target <span className="text-xs text-indigo-400 font-normal">(पहुँचने के तरीके)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                {origin.label || 'Your Location'} <ArrowRight className="w-3 h-3 inline text-slate-500 mx-1" /> {destination.label || 'Target Asset'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transit Mode Tabs */}
        <div className="grid grid-cols-4 p-2 bg-dark-950 gap-1.5 border-b border-dark-700">
          {[
            { id: 'bike' as TransitMode, label: 'Bike 🏍️', icon: Bike, color: 'emerald' },
            { id: 'metro' as TransitMode, label: 'Metro 🚇', icon: Train, color: 'purple' },
            { id: 'bus' as TransitMode, label: 'Bus 🚌', icon: Bus, color: 'amber' },
            { id: 'car' as TransitMode, label: 'Car 🚗', icon: Car, color: 'blue' }
          ].map(m => {
            const IconComponent = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50 scale-[1.02]'
                    : 'bg-dark-900/60 text-slate-400 hover:text-white hover:bg-dark-800 border border-dark-700/50'
                }`}
              >
                <IconComponent className="w-4 h-4 mb-1" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Route Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-dark-800/90 border border-dark-700 p-3 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">ESTIMATED TIME</div>
              <div className="text-base sm:text-lg font-extrabold text-indigo-400 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{selectedRoute.durationMinutes} min</span>
              </div>
            </div>
            <div className="bg-dark-800/90 border border-dark-700 p-3 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">DISTANCE</div>
              <div className="text-base sm:text-lg font-extrabold text-cyan-400 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{selectedRoute.distanceKm} km</span>
              </div>
            </div>
            <div className="bg-dark-800/90 border border-dark-700 p-3 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">EST. FARE / FUEL</div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                {selectedRoute.costEstimate}
              </div>
            </div>
          </div>

          {/* Badge & Summary Card */}
          <div className="bg-dark-800/60 border border-dark-700 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${selectedRoute.badgeBg}`}>
                {selectedRoute.badgeText}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Mode: {selectedRoute.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedRoute.summary}
            </p>
          </div>

          {/* Special Transit Badges */}
          {selectedRoute.metroDetails && (
            <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-purple-400" />
                <span>Metro Stations Route Info</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>? Boarding Station: <strong className="text-amber-300">{selectedRoute.metroDetails.originStation.name}</strong> ({selectedRoute.metroDetails.originStation.lineName})</div>
                <div>? Destination Station: <strong className="text-indigo-300">{selectedRoute.metroDetails.destStation.name}</strong> ({selectedRoute.metroDetails.destStation.lineName})</div>
                <div>? Total Stations: <strong>{selectedRoute.metroDetails.totalStations} Stations</strong></div>
              </div>
            </div>
          )}

          {selectedRoute.busDetails && (
            <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-amber-400" />
                <span>Bus Route Details ({selectedRoute.busDetails.busNumber})</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>? Route Bus: <strong className="text-amber-200">{selectedRoute.busDetails.busNumber}</strong> (Electric / DTC Express)</div>
                <div>? Total Stops: <strong>{selectedRoute.busDetails.totalStops} Bus Stops</strong></div>
              </div>
            </div>
          )}

          {/* Turn-by-Turn Guidance Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Step-by-Step Directions
            </h4>
            <div className="space-y-2 border-l-2 border-indigo-500/40 pl-3">
              {selectedRoute.steps.map((step, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0 flex items-center justify-center border border-indigo-500/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-dark-700 bg-dark-800/90 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => handlePlotOnMap(selectedRoute)}
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              plottedMode === activeMode
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {plottedMode === activeMode ? (
              <><Check className="w-4 h-4" /> Plotted on Live Map</>
            ) : (
              <><Navigation className="w-4 h-4" /> Plot Route on Live Map</>
            )}
          </button>

          <a
            href={selectedRoute.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Open Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
